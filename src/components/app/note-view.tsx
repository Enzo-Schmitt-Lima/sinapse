"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Note, NoteSummary } from "@/lib/note-types";
import { useNotePath } from "@/hooks/useNotePath";
import { useNoteQuery, useNoteSummary } from "@/hooks/useNotes";
import { getNoteAutosaver } from "@/hooks/useAutosave";
import { Button } from "@/components/ui/button";
import { useCurrentUserId } from "./query-provider";
import { NoteBreadcrumb } from "./note-breadcrumb";
import { NoteEditor } from "./note-editor";
import { NoteBacklinks } from "./note-backlinks";

function EditorSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-4">
      <div className="h-4 w-full animate-pulse rounded bg-muted" />
      <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
      <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
    </div>
  );
}

function NoteSkeleton({ summary, ancestors }: { summary?: NoteSummary | null; ancestors?: NoteSummary[] }) {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando nota"
      className="mx-auto flex max-w-3xl flex-col gap-4 px-4 pb-24 pt-6 sm:px-6 sm:pb-32 sm:pt-10"
    >
      {summary ? (
        <>
          <NoteBreadcrumb note={summary} ancestors={ancestors ?? []} />
          {/* O título já vem da lista da sidebar: só o conteúdo fica em skeleton. */}
          <p className="text-2xl font-semibold tracking-tight sm:text-3xl">{summary.title || "Sem título"}</p>
        </>
      ) : (
        <div className="h-9 w-2/3 animate-pulse rounded-md bg-muted" />
      )}
      <EditorSkeleton />
    </div>
  );
}

export function NoteView({ noteId }: { noteId: string }) {
  const noteQuery = useNoteQuery(noteId);
  const summary = useNoteSummary(noteId);
  const note = noteQuery.data;
  const ancestors = useNotePath(note ?? summary ?? null);

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

  if (note === undefined) {
    if (noteQuery.isError) {
      return (
        <div role="alert" className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
          <h1 className="text-lg font-medium">Não foi possível abrir a nota</h1>
          <p className="text-sm text-muted-foreground">{noteQuery.error.message}</p>
          <Button variant="outline" onClick={() => void noteQuery.refetch()}>
            Tentar de novo
          </Button>
        </div>
      );
    }
    return <NoteSkeleton summary={summary} ancestors={ancestors} />;
  }

  return <LoadedNote note={note} ancestors={ancestors ?? []} />;
}

function LoadedNote({ note, ancestors }: { note: Note; ancestors: NoteSummary[] }) {
  const userId = useCurrentUserId();
  const saver = getNoteAutosaver(userId, note.id);

  // Se esta nota ainda tem alterações a caminho do servidor (ex.: saiu e voltou
  // rápido), espera terminar para abrir o editor já com a versão salva.
  const [ready, setReady] = useState(() => !saver.hasUnsaved());
  useEffect(() => {
    if (ready) return;
    let active = true;
    void saver.flush().then(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, [ready, saver]);

  // Outra aba/navegador salvou esta nota (updatedAt mais novo que o último
  // salvo aqui) e não há nada pendente nesta aba: reabre o editor com o
  // conteúdo novo. Havendo pendência local, ela vence (último a salvar vence).
  const [editorVersion, setEditorVersion] = useState(note.updatedAt);
  const [seenUpdatedAt, setSeenUpdatedAt] = useState(note.updatedAt);
  if (note.updatedAt !== seenUpdatedAt) {
    setSeenUpdatedAt(note.updatedAt);
    if (note.updatedAt !== saver.lastSavedUpdatedAt && !saver.hasUnsaved()) setEditorVersion(note.updatedAt);
  }

  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col gap-4 px-4 pb-24 pt-6 sm:px-6 sm:pb-32 sm:pt-10">
      <NoteBreadcrumb note={note} ancestors={ancestors} />
      {ready ? (
        <NoteEditor key={`${note.id}:${editorVersion}`} note={note} ownerId={userId} />
      ) : (
        <EditorSkeleton />
      )}
      <NoteBacklinks noteId={note.id} />
    </div>
  );
}
