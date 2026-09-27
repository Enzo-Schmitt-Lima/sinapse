import "server-only";

import type { PartialBlock } from "@blocknote/core";
import type { Note, NoteSearchResult, NoteSummary } from "@/lib/note-types";
import type { NoteSearchResult as ServerSearchResult, NoteSummary as ServerNoteSummary } from "./notes";

// Converte o que vem do Prisma (datas como Date) para o formato do cliente
// (datas ISO), para rotas GET e server actions responderem igual.

export function toNoteSummary(note: ServerNoteSummary): NoteSummary {
  return {
    id: note.id,
    title: note.title,
    parentId: note.parentId,
    folder: note.folder,
    favorite: note.favorite,
    links: note.links,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}

export function toNote(note: ServerNoteSummary & { content: unknown }): Note {
  return { ...toNoteSummary(note), content: (note.content ?? []) as PartialBlock[] };
}

export function toSearchResults(results: ServerSearchResult[]): NoteSearchResult[] {
  return results.map(({ note, snippet }) => ({ note: toNoteSummary(note), snippet }));
}
