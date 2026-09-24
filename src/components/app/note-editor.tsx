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
  const [status, setStatus] = useState<"saved" | "saving" | "error">("saved");
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
      updateNote(note.id, toSave).then(
        () => setStatus("saved"),
        (error: unknown) => {
          // Mantém o que falhou para tentar de novo na próxima alteração.
          pendingRef.current = { ...toSave, ...pendingRef.current };
          setStatus("error");
          reportError(error);
        },
      );
    }, 500);
  }

  // Descarrega alterações pendentes se a nota trocar antes do debounce disparar.
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        if (Object.keys(pendingRef.current).length > 0) {
          updateNote(note.id, pendingRef.current).catch(reportError);
        }
      }
    };
  }, [note.id]);

  async function handleExportMarkdown() {
    // Import dinâmico: o schema do BlockNote não deve entrar no bundle
    // carregado eagerly (mesma regra do editor: só client, sob demanda).
    const { blocksToMarkdown } = await import("./blocknote-schema");
    // Usa também o que ainda está no debounce, para exportar o que está na tela.
    const markdown = blocksToMarkdown(pendingRef.current.content ?? note.content);
    downloadMarkdown(`${sanitizeFilename(title)}.md`, markdown);
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
          className="w-full min-w-0 rounded-sm bg-transparent text-2xl sm:text-3xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-ring"
        />

        <div className="mt-1 flex shrink-0 items-center gap-1">
          <span
            // Só anuncia ao leitor de tela quando der erro (evita ruído a cada tecla).
            role={status === "error" ? "alert" : undefined}
            className={cn("mr-1 text-xs", status === "error" ? "text-destructive" : "text-muted-foreground")}
          >
            {status === "saving" ? "Salvando…" : status === "error" ? "Erro ao salvar" : "Salvo"}
          </span>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Favoritar"
            aria-pressed={note.favorite}
            onClick={() => toggleFavorite(note.id)}
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
        onChange={(content: PartialBlock[]) => scheduleSave({ content, links: extractNoteLinks(content) })}
      />
    </div>
  );
}
