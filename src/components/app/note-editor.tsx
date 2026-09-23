"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import type { PartialBlock } from "@blocknote/core";
import type { Note } from "@/lib/db";
import { updateNote, type NotePatch } from "@/lib/notes";
import { extractNoteLinks } from "@/lib/note-links";

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

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
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
        <span className="mt-2 shrink-0 text-xs text-muted-foreground">
          {status === "saving" ? "Salvando…" : "Salvo"}
        </span>
      </div>

      <BlockNoteEditor
        initialContent={note.content}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        onChange={(content: PartialBlock[]) => scheduleSave({ content, links: extractNoteLinks(content) })}
      />
    </div>
  );
}
