import Dexie from "dexie";
import { db, type Note as LocalNote } from "./db";

// Notas da v1 guardadas no IndexedDB deste navegador. Único uso do Dexie na
// v2 (CLAUDE.md): detectar, importar para a conta e limpar.

const LOCAL_DB_NAME = "sinapse";
const WELCOME_TITLE = "Bem-vindo ao Sinapse";
const IMPORT_DONE_KEY = "sinapse:v1-import-done";
const IMPORT_DISMISSED_KEY = "sinapse:v1-import-dismissed";

/** Limite do corpo da server action é 4 MB; sobra margem para o envelope. */
export const IMPORT_MAX_BYTES = 3.8 * 1024 * 1024;

export type ImportPayloadNote = Omit<LocalNote, "links">;

// db.open() num navegador sem o banco criaria um banco novo (com a nota de
// boas-vindas do populate). Por isso a checagem vem antes de qualquer acesso.
export async function hasLocalDatabase(): Promise<boolean> {
  try {
    if (typeof indexedDB === "undefined") return false;
    return await Dexie.exists(LOCAL_DB_NAME);
  } catch {
    return false;
  }
}

function isUntouchedWelcome(note: LocalNote): boolean {
  return note.title === WELCOME_TITLE && note.updatedAt === note.createdAt;
}

/** Notas locais que valem importar (sem a nota de boas-vindas nunca editada). */
export async function readLocalNotes(): Promise<LocalNote[]> {
  if (!(await hasLocalDatabase())) return [];
  const notes = await db.notes.toArray();
  return notes.filter((note) => !isUntouchedWelcome(note));
}

/** Formato aceito pela importação: sem `links` (o servidor recalcula). */
export function toImportPayload(notes: LocalNote[]): ImportPayloadNote[] {
  return notes.map((note) => ({
    id: note.id,
    title: note.title ?? "",
    content: Array.isArray(note.content) ? note.content : [],
    parentId: note.parentId ?? null,
    folder: note.folder?.trim() ? note.folder : null,
    favorite: !!note.favorite,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  }));
}

export function payloadBytes(notes: ImportPayloadNote[]): number {
  return new TextEncoder().encode(JSON.stringify({ notes })).length;
}

/** Apaga o banco local inteiro (não só as notas, para não recriar o populate). */
export async function clearLocalNotes(): Promise<void> {
  db.close();
  await Dexie.delete(LOCAL_DB_NAME);
}

export function getImportDoneAt(): number | null {
  try {
    const value = Number(localStorage.getItem(IMPORT_DONE_KEY));
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

export function markImportDone(): void {
  try {
    localStorage.setItem(IMPORT_DONE_KEY, String(Date.now()));
  } catch {
    // Sem armazenamento: o aviso pode voltar, mas nada se perde.
  }
}

/** "Agora não" vale só para esta aba; o aviso volta no próximo login. */
export function isImportDismissed(): boolean {
  try {
    return sessionStorage.getItem(IMPORT_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissImport(): void {
  try {
    sessionStorage.setItem(IMPORT_DISMISSED_KEY, "1");
  } catch {
    // Ignora: sem armazenamento, o aviso só volta ao recarregar.
  }
}
