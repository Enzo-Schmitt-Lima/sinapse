"use server";

import { ZodError } from "zod";
import { auth } from "@/auth";
import {
  createNoteSchema,
  noteIdSchema,
  searchQuerySchema,
  updateNoteSchema,
} from "@/lib/note-schemas";
import * as notes from "@/server/notes";

// Server actions das notas. Cada uma: confere a sessão, valida a entrada com
// zod (schema.parse dentro de withUser, depois da sessão) e só então chama
// src/server/notes.ts com o userId DA SESSÃO. Nenhuma action recebe userId.

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

const SESSION_EXPIRED = "Sua sessão expirou. Entre novamente.";
const UNEXPECTED = "Algo deu errado. Tente novamente.";

async function withUser<T>(run: (userId: string) => Promise<T>): Promise<ActionResult<T>> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: SESSION_EXPIRED };

  try {
    return { ok: true, data: await run(userId) };
  } catch (error) {
    if (error instanceof ZodError) {
      return { ok: false, error: error.issues[0]?.message ?? "Dados inválidos." };
    }
    if (error instanceof notes.NoteError) return { ok: false, error: error.message };
    console.error("[notes action]", error);
    return { ok: false, error: UNEXPECTED };
  }
}

export async function listNotesAction() {
  return withUser(async (userId) => notes.listNotes(userId));
}

export async function getNoteAction(id: unknown) {
  return withUser(async (userId) => notes.getNote(userId, noteIdSchema.parse(id)));
}

export async function createNoteAction(input: unknown = {}) {
  return withUser(async (userId) => notes.createNote(userId, createNoteSchema.parse(input)));
}

export async function updateNoteAction(id: unknown, patch: unknown) {
  return withUser(async (userId) => notes.updateNote(userId, noteIdSchema.parse(id), updateNoteSchema.parse(patch)));
}

export async function deleteNoteAction(id: unknown) {
  return withUser(async (userId) => notes.deleteNote(userId, noteIdSchema.parse(id)));
}

export async function toggleFavoriteAction(id: unknown) {
  return withUser(async (userId) => notes.toggleFavorite(userId, noteIdSchema.parse(id)));
}

export async function listFoldersAction() {
  return withUser(async (userId) => notes.listFolders(userId));
}

export async function getBacklinksAction(noteId: unknown) {
  return withUser(async (userId) => notes.getBacklinks(userId, noteIdSchema.parse(noteId)));
}

export async function searchNotesAction(query: unknown) {
  return withUser(async (userId) => notes.searchNotes(userId, searchQuerySchema.parse(query)));
}
