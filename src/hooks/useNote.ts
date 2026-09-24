"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

/**
 * `undefined` enquanto carrega, `null` se a nota não existe.
 * Separar os dois evita mostrar "não encontrada" durante o carregamento.
 */
export function useNote(id: string | undefined) {
  return useLiveQuery(async () => (id ? ((await db.notes.get(id)) ?? null) : null), [id]);
}
