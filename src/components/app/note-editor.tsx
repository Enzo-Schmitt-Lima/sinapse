"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { FileDown, MoreHorizontal, Star } from "lucide-react";
import type { PartialBlock } from "@blocknote/core";
import type { Note } from "@/lib/db";
import { toggleFavorite, updateNote, type NotePatch } from "@/lib/notes";
import { extractNoteLinks } from "@/lib/note-links";
import { downloadMarkdown, sanitizeFilename } from "@/lib/markdown";
import { cn } from "@/lib/utils";
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
}

export function NoteEditor({ note }: NoteEditorProps) {
  const { resolvedTheme } = useTheme();
  const [title, setTitle] = useState(note.title);
  const [status, setStatus] = useState<"saved" | "saving">("saved");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<NotePatch>({});

  function scheduleSave(patch: NotePatch) {
    pendingRef.current = { ...pendingRef.current, ...patch };
    setStatus("saving");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const toSave = pendingRef.current;
      pendingRef.current = {};
      timeoutRef.current = null;
      updateNote(note.id, toSave).then(() => setStatus("saved"));
    }, 500);
  }

  // Descarrega alterações pendentes se a nota trocar antes do debounce disparar.
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        if (Object.keys(pendingRef.current).length > 0) {
          updateNote(note.id, pendingRef.current);
        }
      }
    };
  }, [note.id]);

  async function handleExportMarkdown() {
    // Import dinâmico: o schema do BlockNote não deve entrar no bundle
    // carregado eagerly (mesma regra do editor: só client, sob demanda).
    const { blocksToMarkdown } = await import("./blocknote-schema");
    const markdown = blocksToMarkdown(note.content);
    downloadMarkdown(`${sanitizeFilename(note.title)}.md`, markdown);
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex items-start justify-between gap-1">
        <input
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            scheduleSave({ title: event.target.value });
          }}
          placeholder="Sem título"
          aria-label="Título da nota"
          className="w-full rounded-sm bg-transparent text-3xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-ring"
        />

        <div className="mt-1 flex shrink-0 items-center gap-1">
          <span className="mr-1 text-xs text-muted-foreground">{status === "saving" ? "Salvando…" : "Salvo"}</span>

          <Button
            variant="ghost"
            size="icon"
            aria-label={note.favorite ? "Remover dos favoritos" : "Favoritar"}
            onClick={() => toggleFavorite(note.id)}
          >
            <Star className={cn("h-4 w-4", note.favorite && "fill-current text-amber-500")} />
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
        onChange={(content: PartialBlock[]) => scheduleSave({ content, links: extractNoteLinks(content) })}
      />
    </div>
  );
}
