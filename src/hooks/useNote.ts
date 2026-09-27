"use client";

import type { Note } from "@/lib/note-types";
import { useNoteQuery } from "./useNotes";

/**
 * `undefined` enquanto carrega, `null` se a nota não existe.
 * Separar os dois evita mostrar "não encontrada" durante o carregamento.
 */
export function useNote(id: string): Note | null | undefined {
  return useNoteQuery(id).data;
}
