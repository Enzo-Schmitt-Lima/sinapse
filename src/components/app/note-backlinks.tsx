"use client";

import Link from "next/link";
import { useBacklinks } from "@/hooks/useBacklinks";

export function NoteBacklinks({ noteId }: { noteId: string }) {
  const backlinks = useBacklinks(noteId);

  if (!backlinks || backlinks.length === 0) return null;

  return (
    <div className="mt-8 border-t pt-4">
      <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
        Backlinks · {backlinks.length}
      </p>
      <ul className="flex flex-col gap-1">
        {backlinks.map((note) => (
          <li key={note.id}>
            <Link
              href={`/app/${note.id}`}
              className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-accent/50"
            >
              <span className="truncate">{note.title || "Sem título"}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {new Date(note.updatedAt).toLocaleDateString("pt-BR")}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
