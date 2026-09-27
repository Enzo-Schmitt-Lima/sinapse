"use server";

import { ZodError } from "zod";
import { createNoteSchema, noteIdSchema, updateNoteSchema } from "@/lib/note-schemas";
import type { Note } from "@/lib/note-types";
import { toNote } from "@/server/dto";
import { getSessionUser } from "@/server/session";
import * as notes from "@/server/notes";

// Server actions de ESCRITA das notas (as leituras são rotas GET em
// src/app/api/notes, que rodam em paralelo; actions chamadas pelo cliente são
// enfileiradas pelo Next). Cada uma: confere a sessão, valida a entrada com
// zod (schema.parse dentro de withUser, depois da sessão) e só então chama
// src/server/notes.ts com o userId DA SESSÃO. Nenhuma action recebe userId.

// "unavailable" = banco inacessível: o cliente pode tentar de novo (o autosave tenta).
export type ActionErrorCode = "unauthorized" | "unavailable" | "not_found" | "invalid" | "limit" | "unexpected";

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string; code: ActionErrorCode };

async function withUser<T>(run: (userId: string) => Promise<T>): Promise<ActionResult<T>> {
  const session = await getSessionUser();
  if (session.status === "unavailable") {
    return { ok: false, error: "Sem conexão com o servidor. Tente novamente em instantes.", code: "unavailable" };
  }
  if (session.status === "signed_out") {
    return { ok: false, error: "Sua sessão expirou. Entre novamente.", code: "unauthorized" };
  }
  const { userId } = session;

  try {
    return { ok: true, data: await run(userId) };
  } catch (error) {
    if (error instanceof ZodError) {
      return { ok: false, error: error.issues[0]?.message ?? "Dados inválidos.", code: "invalid" };
    }
    if (error instanceof notes.NoteNotFoundError) return { ok: false, error: error.message, code: "not_found" };
    if (error instanceof notes.NoteLimitError) return { ok: false, error: error.message, code: "limit" };
    if (error instanceof notes.NoteError) return { ok: false, error: error.message, code: "invalid" };
    console.error("[notes action]", error);
    return { ok: false, error: "Algo deu errado. Tente novamente.", code: "unexpected" };
  }
}

export async function createNoteAction(input: unknown = {}): Promise<ActionResult<Note>> {
  return withUser(async (userId) => toNote(await notes.createNote(userId, createNoteSchema.parse(input))));
}

export async function updateNoteAction(id: unknown, patch: unknown): Promise<ActionResult<Note>> {
  return withUser(async (userId) =>
    toNote(await notes.updateNote(userId, noteIdSchema.parse(id), updateNoteSchema.parse(patch))),
  );
}

export async function deleteNoteAction(id: unknown): Promise<ActionResult<string[]>> {
  return withUser(async (userId) => notes.deleteNote(userId, noteIdSchema.parse(id)));
}

export async function toggleFavoriteAction(id: unknown): Promise<ActionResult<boolean>> {
  return withUser(async (userId) => notes.toggleFavorite(userId, noteIdSchema.parse(id)));
}
