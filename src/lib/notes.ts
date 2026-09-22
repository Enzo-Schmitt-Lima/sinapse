import { nanoid } from "nanoid";
import type { PartialBlock } from "@blocknote/core";
import { db, type Note } from "./db";

export interface CreateNoteInput {
  title?: string;
  parentId?: string | null;
  folder?: string | null;
}

export async function createNote({
  title = "Sem título",
  parentId = null,
  folder = null,
}: CreateNoteInput = {}): Promise<Note> {
  const now = Date.now();
  const note: Note = {
    id: nanoid(),
    title,
    content: [],
    parentId,
    folder,
    favorite: false,
    links: [],
    createdAt: now,
    updatedAt: now,
  };
  await db.notes.add(note);
  return note;
}

export interface NotePatch {
  title?: string;
  content?: PartialBlock[];
  parentId?: string | null;
  folder?: string | null;
  favorite?: boolean;
  links?: string[];
}

// Usa put() (registro completo) em vez de update(): o UpdateSpec do Dexie
// aplica Required<T> sobre a linha inteira, o que trava o TypeScript no tipo
// recursivo do PartialBlock (BlockNote) dentro de `content`.
export async function updateNote(id: string, patch: NotePatch): Promise<void> {
  const existing = await db.notes.get(id);
  if (!existing) return;
  await db.notes.put({ ...existing, ...patch, updatedAt: Date.now() });
}

export async function deleteNote(id: string): Promise<void> {
  const children = await db.notes.where("parentId").equals(id).toArray();
  await Promise.all(children.map((child) => deleteNote(child.id)));
  await db.notes.delete(id);
}

export async function toggleFavorite(id: string): Promise<void> {
  const note = await db.notes.get(id);
  if (!note) return;
  await db.notes.put({ ...note, favorite: !note.favorite, updatedAt: Date.now() });
}

export async function getNote(id: string): Promise<Note | undefined> {
  return db.notes.get(id);
}

export async function listFolders(): Promise<string[]> {
  const keys = await db.notes.orderBy("folder").uniqueKeys();
  return keys.filter((key): key is string => typeof key === "string");
}
