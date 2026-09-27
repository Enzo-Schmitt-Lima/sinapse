"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useQueryClient } from "@tanstack/react-query";
import { FileDown, MoreHorizontal, Star } from "lucide-react";
import type { PartialBlock } from "@blocknote/core";
import { fetchJson, noteKeys } from "@/lib/api-client";
import type { Note, NoteSearchResult, NoteSummary } from "@/lib/note-types";
import { downloadMarkdown, sanitizeFilename } from "@/lib/markdown";
import { cn } from "@/lib/utils";
import { useAutosave } from "@/hooks/useAutosave";
import { useNoteMutations } from "@/hooks/useNoteMutations";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const BlockNoteEditor = dynamic(
  () => import("./blocknote-editor").then((mod) => mod.BlockNoteEditor),
  { ssr: false, loading: () => <div className="h-40 animate-pulse rounded-md bg-muted" /> },
);

interface NoteEditorProps {
  note: Note;
  ownerId: string;
}

export function NoteEditor({ note, ownerId }: NoteEditorProps) {
  const { resolvedTheme } = useTheme();
  const queryClient = useQueryClient();
  const { createNote, patchSummary, toggleFavorite } = useNoteMutations();
  const [title, setTitle] = useState(note.title);
  const titleRef = useRef(note.title);
  const contentRef = useRef<PartialBlock[]>(note.content);

  // Resposta do servidor a um salvamento: atualiza o cache (updatedAt, links),
  // mantendo o título que está na tela (pode ter mudado durante o envio).
  const handleSaved = useCallback(
    (saved: Note) => {
      const detailKey = noteKeys.detail(ownerId, saved.id);
      const previousLinks = queryClient.getQueryData<Note | null>(detailKey)?.links ?? [];
      queryClient.setQueryData<Note>(detailKey, { ...saved, title: titleRef.current });
      // O título vem da tela: uma recarga da lista que chegou durante a
      // digitação pode ter trazido um título antigo.
      queryClient.setQueryData<NoteSummary[]>(noteKeys.list(ownerId), (old) =>
        old?.map((item) =>
          item.id === saved.id
            ? { ...item, title: titleRef.current, links: saved.links, updatedAt: saved.updatedAt }
            : item,
        ),
      );
      // Backlinks mudam só nas notas que entraram ou saíram dos links.
      const changed = new Set([
        ...previousLinks.filter((id) => !saved.links.includes(id)),
        ...saved.links.filter((id) => !previousLinks.includes(id)),
      ]);
      for (const id of changed) {
        void queryClient.invalidateQueries({ queryKey: noteKeys.backlinks(ownerId, id) });
      }
    },
    [ownerId, queryClient],
  );

  const { status, schedule, retry } = useAutosave(ownerId, note.id, handleSaved);

  function handleTitleChange(value: string) {
    setTitle(value);
    titleRef.current = value;
    // A sidebar acompanha o título na hora; o servidor recebe pelo autosave.
    // Cancela uma recarga da lista em andamento para ela não trazer o título antigo.
    void queryClient.cancelQueries({ queryKey: noteKeys.list(ownerId) }, { revert: false });
    patchSummary(note.id, { title: value });
    schedule({ title: value });
  }

  function handleContentChange(content: PartialBlock[]) {
    contentRef.current = content;
    // Links [[ ]] são recalculados no servidor a partir do conteúdo.
    schedule({ content });
  }

  const searchNotes = useCallback(
    async (query: string): Promise<NoteSummary[]> => {
      const results = await queryClient.fetchQuery({
        queryKey: noteKeys.search(ownerId, query.trim()),
        queryFn: async () =>
          (await fetchJson<NoteSearchResult[]>(`/api/notes/search?q=${encodeURIComponent(query.trim())}`)) ?? [],
        staleTime: 10_000,
      });
      return results.map((result) => result.note);
    },
    [ownerId, queryClient],
  );

  const createLinkedNote = useCallback((linkTitle: string) => createNote({ title: linkTitle }), [createNote]);

  async function handleExportMarkdown() {
    // Import dinâmico: o schema do BlockNote não deve entrar no bundle
    // carregado eagerly (mesma regra do editor: só client, sob demanda).
    const { blocksToMarkdown } = await import("./blocknote-schema");
    // Usa o que está na tela, mesmo que ainda não tenha sido salvo.
    const markdown = blocksToMarkdown(contentRef.current);
    downloadMarkdown(`${sanitizeFilename(title)}.md`, markdown);
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex items-start justify-between gap-1">
        <input
          value={title}
          onChange={(event) => handleTitleChange(event.target.value)}
          placeholder="Sem título"
          aria-label="Título da nota"
          maxLength={200}
          className="w-full min-w-0 rounded-sm bg-transparent text-2xl sm:text-3xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-ring"
        />

        <div className="mt-1 flex shrink-0 items-center gap-1">
          {status.state === "error" ? (
            // Só anuncia ao leitor de tela quando der erro (evita ruído a cada tecla).
            <span role="alert" className="mr-1 flex items-center text-xs text-destructive">
              {status.willRetry ? (
                <button
                  type="button"
                  onClick={retry}
                  className="cursor-pointer rounded-sm underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {status.message} — tentar de novo
                </button>
              ) : (
                <span className="max-w-48 text-right">{status.message}</span>
              )}
            </span>
          ) : (
            <span className="mr-1 text-xs text-muted-foreground">
              {status.state === "saving" ? "Salvando…" : "Salvo"}
            </span>
          )}

          <Button
            variant="ghost"
            size="icon"
            aria-label="Favoritar"
            aria-pressed={note.favorite}
            onClick={() => void toggleFavorite(note.id)}
          >
            <Star className={cn("h-4 w-4", note.favorite && "fill-current text-amber-500")} aria-hidden="true" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Mais opções da nota">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={handleExportMarkdown}>
                <FileDown /> Exportar como Markdown
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <BlockNoteEditor
        initialContent={note.content}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        onChange={handleContentChange}
        searchNotes={searchNotes}
        createNote={createLinkedNote}
      />
    </div>
  );
}
