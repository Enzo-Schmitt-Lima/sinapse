"use client";

import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  createNoteAction,
  deleteNoteAction,
  toggleFavoriteAction,
  updateNoteAction,
  type ActionResult,
} from "@/app/actions/notes";
import { noteKeys } from "@/lib/api-client";
import { TEMP_NOTE_PREFIX, type Note, type NoteSummary } from "@/lib/note-types";
import { useCurrentUserId } from "@/components/app/query-provider";
import { useToast } from "@/components/app/app-toast";
import { selectSubtreeIds } from "./useNotes";

// Ações da sidebar com atualização otimista: a lista muda na hora e, se o
// servidor recusar (ou a rede falhar), a mudança é desfeita e um aviso aparece.

const NETWORK_ERROR = "Sem conexão com o servidor. Tente novamente.";

export interface CreateNoteOptions {
  title?: string;
  parentId?: string | null;
  folder?: string | null;
}

async function callAction<T>(action: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await action();
  } catch {
    return { ok: false, error: NETWORK_ERROR, code: "unexpected" };
  }
}

export function toSummary(note: Note): NoteSummary {
  const { content: _content, ...summary } = note;
  void _content;
  return summary;
}

export function useNoteMutations() {
  const userId = useCurrentUserId();
  const queryClient = useQueryClient();
  const toast = useToast();
  const listKey = useMemo(() => noteKeys.list(userId), [userId]);

  const updateList = useCallback(
    (update: (notes: NoteSummary[]) => NoteSummary[]) => {
      queryClient.setQueryData<NoteSummary[]>(listKey, (old) => (old ? update(old) : old));
    },
    [queryClient, listKey],
  );

  const patchSummary = useCallback(
    (id: string, patch: Partial<NoteSummary>) => {
      updateList((notes) => notes.map((note) => (note.id === id ? { ...note, ...patch } : note)));
      queryClient.setQueryData<Note | null>(noteKeys.detail(userId, id), (old) => (old ? { ...old, ...patch } : old));
    },
    [queryClient, updateList, userId],
  );

  const settle = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: listKey });
  }, [queryClient, listKey]);

  /** Cria a nota; devolve a nota criada ou `null` se falhou (já com aviso). */
  const createNote = useCallback(
    async (options: CreateNoteOptions = {}): Promise<Note | null> => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const tempId = `${TEMP_NOTE_PREFIX}${crypto.randomUUID()}`;
      const now = new Date().toISOString();
      updateList((notes) => [
        ...notes,
        {
          id: tempId,
          title: options.title?.trim() || "Sem título",
          parentId: options.parentId ?? null,
          folder: options.folder ?? null,
          favorite: false,
          links: [],
          createdAt: now,
          updatedAt: now,
        },
      ]);

      const input: CreateNoteOptions = {};
      if (options.title !== undefined) input.title = options.title;
      if (options.parentId) input.parentId = options.parentId;
      if (options.folder) input.folder = options.folder;
      const result = await callAction(() => createNoteAction(input));

      if (!result.ok) {
        updateList((notes) => notes.filter((note) => note.id !== tempId));
        toast(result.error);
        settle();
        return null;
      }
      const created = result.data;
      updateList((notes) => notes.map((note) => (note.id === tempId ? toSummary(created) : note)));
      queryClient.setQueryData(noteKeys.detail(userId, created.id), created);
      settle();
      return created;
    },
    [queryClient, listKey, updateList, toast, settle, userId],
  );

  const moveToFolder = useCallback(
    async (id: string, folder: string | null) => {
      const previous = queryClient.getQueryData<NoteSummary[]>(listKey)?.find((note) => note.id === id);
      await queryClient.cancelQueries({ queryKey: listKey });
      patchSummary(id, { folder });
      const result = await callAction(() => updateNoteAction(id, { folder }));
      if (!result.ok) {
        if (previous) patchSummary(id, { folder: previous.folder });
        toast(result.error);
      }
      settle();
    },
    [queryClient, listKey, patchSummary, toast, settle],
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      const current = queryClient.getQueryData<NoteSummary[]>(listKey)?.find((note) => note.id === id);
      const detail = queryClient.getQueryData<Note | null>(noteKeys.detail(userId, id));
      const wasFavorite = current?.favorite ?? detail?.favorite ?? false;
      await queryClient.cancelQueries({ queryKey: listKey });
      patchSummary(id, { favorite: !wasFavorite });
      const result = await callAction(() => toggleFavoriteAction(id));
      if (!result.ok) {
        patchSummary(id, { favorite: wasFavorite });
        toast(result.error);
      } else {
        patchSummary(id, { favorite: result.data });
      }
      settle();
    },
    [queryClient, listKey, patchSummary, toast, settle, userId],
  );

  /** Exclui a nota e as subpáginas; devolve os ids excluídos (vazio se falhou). */
  const deleteNote = useCallback(
    async (id: string): Promise<string[]> => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const snapshot = queryClient.getQueryData<NoteSummary[]>(listKey) ?? [];
      const subtree = new Set(selectSubtreeIds(snapshot, id));
      const removed = snapshot.filter((note) => subtree.has(note.id));
      updateList((notes) => notes.filter((note) => !subtree.has(note.id)));

      const result = await callAction(() => deleteNoteAction(id));
      if (!result.ok) {
        // Devolve só o que foi removido aqui, sem desfazer outras mudanças.
        updateList((notes) => [...notes, ...removed.filter((note) => !notes.some((item) => item.id === note.id))]);
        toast(result.error);
        settle();
        return [];
      }
      for (const deletedId of result.data) {
        queryClient.removeQueries({ queryKey: noteKeys.detail(userId, deletedId) });
      }
      void queryClient.invalidateQueries({ queryKey: noteKeys.backlinksAll(userId) });
      settle();
      return result.data;
    },
    [queryClient, listKey, updateList, toast, settle, userId],
  );

  return { createNote, moveToFolder, toggleFavorite, deleteNote, patchSummary };
}
