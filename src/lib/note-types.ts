import type { PartialBlock } from "@blocknote/core";

// Formato das notas no cliente (v2). As datas chegam como string ISO, igual
// pelas rotas GET (JSON) e pelas server actions (ver src/server/dto.ts).

export interface NoteSummary {
  id: string;
  title: string;
  parentId: string | null;
  folder: string | null;
  favorite: boolean;
  links: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Note extends NoteSummary {
  content: PartialBlock[];
}

export interface NoteSearchResult {
  note: NoteSummary;
  snippet?: string;
}

/** Ids temporários das notas criadas de forma otimista, antes da resposta do servidor. */
export const TEMP_NOTE_PREFIX = "tmp-";

export function isTempNoteId(id: string): boolean {
  return id.startsWith(TEMP_NOTE_PREFIX);
}
