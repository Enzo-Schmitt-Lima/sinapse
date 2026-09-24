"use client";

import Link from "next/link";
import { useBacklinks } from "@/hooks/useBacklinks";

export function NoteBacklinks({ noteId }: { noteId: string }) {
  const backlinks = useBacklinks(noteId);

  if (!backlinks || backlinks.length === 0) return null;

  return (
    <section aria-labelledby="backlinks-title" className="mt-8 border-t pt-4">
      <h2 id="backlinks-title" className="mb-2 text-xs font-medium uppercase text-muted-foreground">
        Backlinks · {backlinks.length}
      </h2>
      <ul className="flex flex-col gap-1">
        {backlinks.map((note) => (
          <li key={note.id}>
            <Link
              href={`/app/${note.id}`}
              className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm outline-none hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring md:py-1.5"
            >
              <span className="truncate">{note.title || "Sem título"}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {new Date(note.updatedAt).toLocaleDateString("pt-BR")}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
