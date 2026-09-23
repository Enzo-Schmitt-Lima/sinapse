"use client";

import { Star } from "lucide-react";
import { useNote } from "@/hooks/useNote";

export function NoteView({ noteId }: { noteId: string }) {
  const note = useNote(noteId);

  if (!note) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
        Nota não encontrada.
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col gap-4 px-6 py-10">
      <div className="flex items-center gap-2">
        {note.favorite && <Star className="h-4 w-4 shrink-0 fill-current text-amber-500" />}
        <h1 className="text-3xl font-semibold tracking-tight">{note.title || "Sem título"}</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Atualizado em {new Date(note.updatedAt).toLocaleString("pt-BR")}
      </p>
      <p className="text-sm text-muted-foreground">O editor de blocos será adicionado em breve.</p>
    </div>
  );
}
