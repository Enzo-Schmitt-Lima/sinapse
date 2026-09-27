"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchJson, noteKeys } from "@/lib/api-client";
import type { Note, NoteSummary } from "@/lib/note-types";
import { useCurrentUserId } from "@/components/app/query-provider";

// Uma única lista leve (sem conteúdo) alimenta a sidebar inteira: filhos,
// favoritas, matérias, caminho e os chips [[ ]]. Os hooks abaixo são recortes
// dela, com a mesma "interface" dos hooks da v1 (undefined enquanto carrega).

async function fetchNoteList(): Promise<NoteSummary[]> {
  return (await fetchJson<NoteSummary[]>("/api/notes")) ?? [];
}

function useNoteList<T>(select: (notes: NoteSummary[]) => T): T | undefined {
  const userId = useCurrentUserId();
  return useQuery({ queryKey: noteKeys.list(userId), queryFn: fetchNoteList, select }).data;
}

const identity = (notes: NoteSummary[]) => notes;

export function useNotes(): NoteSummary[] | undefined {
  return useNoteList(identity);
}

export function useNoteListQuery() {
  const userId = useCurrentUserId();
  return useQuery({ queryKey: noteKeys.list(userId), queryFn: fetchNoteList });
}

/** `undefined` enquanto carrega, `null` se a nota não está na lista do usuário. */
export function useNoteSummary(id: string): NoteSummary | null | undefined {
  const select = useCallback((notes: NoteSummary[]) => notes.find((note) => note.id === id) ?? null, [id]);
  return useNoteList(select);
}

export function sortByTitle(notes: NoteSummary[]): NoteSummary[] {
  return [...notes].sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
}

export function selectChildren(notes: NoteSummary[], parentId: string | null): NoteSummary[] {
  return sortByTitle(notes.filter((note) => note.parentId === parentId));
}

export function selectFavorites(notes: NoteSummary[]): NoteSummary[] {
  return notes.filter((note) => note.favorite).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function selectFolders(notes: NoteSummary[]): string[] {
  const folders = new Set(notes.map((note) => note.folder).filter((folder): folder is string => !!folder));
  return [...folders].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

/** Ids da nota e de todas as subpáginas (qualquer profundidade). */
export function selectSubtreeIds(notes: NoteSummary[], rootId: string): string[] {
  const childrenOf = new Map<string, string[]>();
  for (const note of notes) {
    if (!note.parentId) continue;
    const list = childrenOf.get(note.parentId) ?? [];
    list.push(note.id);
    childrenOf.set(note.parentId, list);
  }
  const ids: string[] = [];
  const stack = [rootId];
  while (stack.length > 0) {
    const current = stack.pop()!;
    ids.push(current);
    stack.push(...(childrenOf.get(current) ?? []));
  }
  return ids;
}

async function fetchNote(id: string): Promise<Note | null> {
  return fetchJson<Note>(`/api/notes/${encodeURIComponent(id)}`);
}

/** Query completa da nota (com conteúdo); `data === null` se não foi encontrada. */
export function useNoteQuery(id: string) {
  const userId = useCurrentUserId();
  return useQuery({ queryKey: noteKeys.detail(userId, id), queryFn: () => fetchNote(id) });
}

/** Carrega o conteúdo da nota antes do clique (hover/foco nos links da sidebar). */
export function usePrefetchNote() {
  const userId = useCurrentUserId();
  const queryClient = useQueryClient();
  return useCallback(
    (id: string) => {
      void queryClient.prefetchQuery({ queryKey: noteKeys.detail(userId, id), queryFn: () => fetchNote(id) });
    },
    [queryClient, userId],
  );
}
