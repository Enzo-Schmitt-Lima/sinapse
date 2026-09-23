"use client";

import Link from "next/link";
import { useNote } from "@/hooks/useNote";
import { useNotePath } from "@/hooks/useNotePath";
import { NoteBreadcrumb } from "./note-breadcrumb";
import { NoteEditor } from "./note-editor";

export function NoteView({ noteId }: { noteId: string }) {
  const note = useNote(noteId);
  const ancestors = useNotePath(note);

  if (!note) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-sm text-muted-foreground">Nota não encontrada.</p>
        <Link href="/app" className="text-sm font-medium text-primary underline underline-offset-4">
          Voltar para o Sinapse
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col gap-4 px-6 py-10">
      <NoteBreadcrumb note={note} ancestors={ancestors ?? []} />
      <NoteEditor key={note.id} note={note} />
    </div>
  );
}
