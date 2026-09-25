"use client";

import Link from "next/link";
import { useNote } from "@/hooks/useNote";
import { useNotePath } from "@/hooks/useNotePath";
import { NoteBreadcrumb } from "./note-breadcrumb";
import { NoteEditor } from "./note-editor";
import { NoteBacklinks } from "./note-backlinks";

export function NoteView({ noteId }: { noteId: string }) {
  const note = useNote(noteId);
  const ancestors = useNotePath(note);

  if (note === undefined) {
    return (
      <div aria-busy="true" aria-label="Carregando nota" className="mx-auto max-w-3xl space-y-4 px-4 py-6 sm:px-6 sm:py-10">
        <div className="h-9 w-2/3 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (note === null) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <h1 className="text-lg font-medium">Nota não encontrada</h1>
        <p className="text-sm text-muted-foreground">Ela pode ter sido excluída ou o link está incorreto.</p>
        <Link href="/app" className="rounded-sm text-sm font-medium text-primary underline underline-offset-4">
          Voltar para o Sinapse
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col gap-4 px-4 pb-24 pt-6 sm:px-6 sm:pb-32 sm:pt-10">
      <NoteBreadcrumb note={note} ancestors={ancestors ?? []} />
      <NoteEditor key={note.id} note={note} />
      <NoteBacklinks noteId={note.id} />
    </div>
  );
}
