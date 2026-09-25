import { nanoid } from "nanoid";
import type { PartialBlock } from "@blocknote/core";
import { db, type Note } from "./db";
import { buildSnippet, extractPlainText } from "./note-content";

// Abre o banco explicitamente para detectar cedo navegadores sem IndexedDB
// (ex.: modo privado) e mostrar uma mensagem amigável.
export async function openDatabase(): Promise<void> {
  if (typeof indexedDB === "undefined") {
    throw Object.assign(new Error("IndexedDB indisponível"), { name: "MissingAPIError" });
  }
  await db.open();
}

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

// Retorna os ids de todas as notas excluídas (a nota + subpáginas em
// qualquer profundidade), para que quem chamou saiba se precisa navegar
// para fora de uma nota que acabou de ser removida.
export async function deleteNote(id: string): Promise<string[]> {
  const children = await db.notes.where("parentId").equals(id).toArray();
  const deletedDescendantIds = await Promise.all(children.map((child) => deleteNote(child.id)));
  await db.notes.delete(id);
  return [id, ...deletedDescendantIds.flat()];
}

export async function toggleFavorite(id: string): Promise<void> {
  const note = await db.notes.get(id);
  if (!note) return;
  await db.notes.put({ ...note, favorite: !note.favorite, updatedAt: Date.now() });
}

export async function listFolders(): Promise<string[]> {
  // Sem orderBy("folder").uniqueKeys(): no Safari/iOS o cursor "nextunique" falha
  // com "UnknownError: Unable to open cursor" (principalmente com o índice vazio).
  const notes = await db.notes.toArray();
  const folders = new Set(notes.map((note) => note.folder).filter((folder): folder is string => !!folder));
  return [...folders].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export async function searchNotes(query: string, limit = 8): Promise<Note[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return db.notes.orderBy("updatedAt").reverse().limit(limit).toArray();
  }
  const matches = await db.notes.filter((note) => note.title.toLowerCase().includes(trimmed)).toArray();
  return matches.sort((a, b) => a.title.localeCompare(b.title, "pt-BR")).slice(0, limit);
}

export interface NoteSearchResult {
  note: Note;
  snippet?: string;
}

// Busca por título e pelo texto do conteúdo (não indexado, varre as notas).
// Adequado para um app local com poucas centenas de notas.
export async function searchAllNotes(query: string, limit = 20): Promise<NoteSearchResult[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const notes = await db.notes.toArray();
  const titleMatches: NoteSearchResult[] = [];
  const contentMatches: NoteSearchResult[] = [];

  for (const note of notes) {
    if (note.title.toLowerCase().includes(trimmed)) {
      titleMatches.push({ note });
      continue;
    }
    const text = extractPlainText(note.content);
    const index = text.toLowerCase().indexOf(trimmed);
    if (index !== -1) {
      contentMatches.push({ note, snippet: buildSnippet(text, index, trimmed.length) });
    }
  }

  const sortByRecency = (a: NoteSearchResult, b: NoteSearchResult) => b.note.updatedAt - a.note.updatedAt;
  return [...titleMatches.sort(sortByRecency), ...contentMatches.sort(sortByRecency)].slice(0, limit);
}
