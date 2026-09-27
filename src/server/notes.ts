import "server-only";

import type { PartialBlock } from "@blocknote/core";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { buildSnippet, extractPlainText } from "@/lib/note-content";
import { extractNoteLinks } from "@/lib/note-links";
import { NOTE_LIMIT, type CreateNoteInput, type NotePatch } from "@/lib/note-schemas";

// Acesso às notas no servidor. Regras (CLAUDE.md, "Segurança"):
// - userId é sempre o 1º parâmetro e vem da sessão, nunca do cliente;
// - toda consulta filtra por id E userId;
// - nota inexistente e nota de outra pessoa geram o mesmo NoteNotFoundError.
// A entrada já chega validada pelos schemas de src/lib/note-schemas.ts.

/** Erro com mensagem que pode ser mostrada ao usuário. */
export class NoteError extends Error {}

export class NoteNotFoundError extends NoteError {
  constructor() {
    super("Nota não encontrada.");
    this.name = "NoteNotFoundError";
  }
}

export class NoteLimitError extends NoteError {
  constructor(limit: number) {
    super(`Você chegou ao limite de ${limit.toLocaleString("pt-BR")} notas. Exclua algumas para criar novas.`);
    this.name = "NoteLimitError";
  }
}

export class InvalidParentError extends NoteError {
  constructor(message = "A página pai não foi encontrada.") {
    super(message);
    this.name = "InvalidParentError";
  }
}

// Campos leves para listas (sidebar, busca, backlinks): sem `content`.
const summarySelect = {
  id: true,
  title: true,
  parentId: true,
  folder: true,
  favorite: true,
  links: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.NoteSelect;

export type NoteSummary = Prisma.NoteGetPayload<{ select: typeof summarySelect }>;

export interface NoteSearchResult {
  note: NoteSummary;
  snippet?: string;
}

/** Lança NoteLimitError se o usuário já tem `limit` notas ou mais. */
export function assertBelowNoteLimit(currentCount: number, limit = NOTE_LIMIT): void {
  if (currentCount >= limit) throw new NoteLimitError(limit);
}

// O pai precisa ser do mesmo usuário e, numa edição, não pode ser a própria
// nota nem uma subpágina dela (isso criaria um ciclo na árvore).
async function assertValidParent(userId: string, parentId: string, noteId?: string): Promise<void> {
  const parent = await prisma.note.findFirst({ where: { id: parentId, userId }, select: { id: true } });
  if (!parent) throw new InvalidParentError();
  if (!noteId) return;

  const cycleError = new InvalidParentError("Uma página não pode ficar dentro dela mesma ou de uma subpágina dela.");
  if (parentId === noteId) throw cycleError;

  const tree = await prisma.note.findMany({ where: { userId }, select: { id: true, parentId: true } });
  const parentOf = new Map(tree.map((note) => [note.id, note.parentId]));
  const visited = new Set<string>();
  let current: string | null = parentId;
  while (current && !visited.has(current)) {
    if (current === noteId) throw cycleError;
    visited.add(current);
    current = parentOf.get(current) ?? null;
  }
}

// Links [[ ]] são recalculados a partir do conteúdo e só mantêm ids de notas
// do próprio usuário; ids de outras pessoas (ou inexistentes) são descartados.
async function ownedLinkIds(userId: string, content: PartialBlock[]): Promise<string[]> {
  const candidates = extractNoteLinks(content);
  if (candidates.length === 0) return [];
  const owned = await prisma.note.findMany({
    where: { userId, id: { in: candidates } },
    select: { id: true },
  });
  const ownedIds = new Set(owned.map((note) => note.id));
  return candidates.filter((id) => ownedIds.has(id));
}

export async function listNotes(userId: string): Promise<NoteSummary[]> {
  return prisma.note.findMany({ where: { userId }, select: summarySelect, orderBy: { createdAt: "asc" } });
}

export async function getNote(userId: string, id: string) {
  const note = await prisma.note.findFirst({ where: { id, userId } });
  if (!note) throw new NoteNotFoundError();
  return note;
}

export async function createNote(userId: string, input: CreateNoteInput = {}) {
  assertBelowNoteLimit(await prisma.note.count({ where: { userId } }));
  if (input.parentId) await assertValidParent(userId, input.parentId);

  return prisma.note.create({
    data: {
      userId,
      title: input.title,
      parentId: input.parentId ?? null,
      folder: input.folder ?? null,
      content: [],
      links: [],
    },
  });
}

export async function updateNote(userId: string, id: string, patch: NotePatch) {
  if (patch.parentId) await assertValidParent(userId, patch.parentId, id);

  const data: Prisma.NoteUpdateManyMutationInput & { parentId?: string | null } = {};
  if (patch.title !== undefined) data.title = patch.title;
  if (patch.folder !== undefined) data.folder = patch.folder;
  if (patch.favorite !== undefined) data.favorite = patch.favorite;
  if (patch.parentId !== undefined) data.parentId = patch.parentId;
  if (patch.content !== undefined) {
    const content = patch.content as PartialBlock[];
    data.content = patch.content as Prisma.InputJsonValue;
    data.links = await ownedLinkIds(userId, content);
  }

  const { count } = await prisma.note.updateMany({ where: { id, userId }, data });
  if (count === 0) throw new NoteNotFoundError();
  return getNote(userId, id);
}

/** Exclui a nota e as subpáginas; devolve os ids de todas as notas excluídas. */
export async function deleteNote(userId: string, id: string): Promise<string[]> {
  const tree = await prisma.note.findMany({ where: { userId }, select: { id: true, parentId: true } });
  const childrenOf = new Map<string, string[]>();
  for (const note of tree) {
    if (!note.parentId) continue;
    const list = childrenOf.get(note.parentId) ?? [];
    list.push(note.id);
    childrenOf.set(note.parentId, list);
  }
  const deletedIds: string[] = [];
  const stack = [id];
  while (stack.length > 0) {
    const current = stack.pop()!;
    deletedIds.push(current);
    stack.push(...(childrenOf.get(current) ?? []));
  }

  // As subpáginas saem pelo onDelete: Cascade do banco.
  const { count } = await prisma.note.deleteMany({ where: { id, userId } });
  if (count === 0) throw new NoteNotFoundError();
  return deletedIds;
}

export async function toggleFavorite(userId: string, id: string): Promise<boolean> {
  const note = await prisma.note.findFirst({ where: { id, userId }, select: { favorite: true } });
  if (!note) throw new NoteNotFoundError();
  const favorite = !note.favorite;
  const { count } = await prisma.note.updateMany({ where: { id, userId }, data: { favorite } });
  if (count === 0) throw new NoteNotFoundError();
  return favorite;
}

export async function listFolders(userId: string): Promise<string[]> {
  const rows = await prisma.note.findMany({
    where: { userId, folder: { not: null } },
    select: { folder: true },
    distinct: ["folder"],
  });
  return rows
    .map((row) => row.folder)
    .filter((folder): folder is string => !!folder)
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export async function getBacklinks(userId: string, noteId: string): Promise<NoteSummary[]> {
  return prisma.note.findMany({
    where: { userId, links: { has: noteId } },
    select: summarySelect,
    orderBy: { updatedAt: "desc" },
  });
}

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/** Busca por título e pelo texto do conteúdo, só entre as notas do usuário. */
export async function searchNotes(userId: string, query: string, limit = 20): Promise<NoteSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    const recent = await prisma.note.findMany({
      where: { userId },
      select: summarySelect,
      orderBy: { updatedAt: "desc" },
      take: 8,
    });
    return recent.map((note) => ({ note }));
  }

  const needle = trimmed.toLowerCase();
  // O `contains` do Prisma não escapa % e _ (viram curingas do LIKE); por isso
  // o escape manual e a conferência no JS.
  const titleMatches = (
    await prisma.note.findMany({
      where: { userId, title: { contains: escapeLikePattern(trimmed), mode: "insensitive" } },
      select: summarySelect,
      orderBy: { updatedAt: "desc" },
      take: limit,
    })
  ).filter((note) => note.title.toLowerCase().includes(needle));

  // Pré-filtro no banco (parametrizado; o userId entra como parâmetro, não
  // como texto da consulta). O ILIKE sobre o JSON também acerta chaves e
  // atributos, então cada resultado é confirmado no texto puro logo abaixo.
  const pattern = `%${escapeLikePattern(trimmed)}%`;
  const rows = await prisma.$queryRaw<{ id: string; content: unknown }[]>`
    SELECT "id", "content" FROM "Note"
    WHERE "userId" = ${userId} AND "content"::text ILIKE ${pattern}
    ORDER BY "updatedAt" DESC
    LIMIT 50
  `;

  const titleIds = new Set(titleMatches.map((note) => note.id));
  const snippets = new Map<string, string>();
  for (const row of rows) {
    if (titleIds.has(row.id)) continue;
    const text = extractPlainText(row.content as PartialBlock[]);
    const index = text.toLowerCase().indexOf(needle);
    if (index !== -1) snippets.set(row.id, buildSnippet(text, index, trimmed.length));
  }

  const contentMatches =
    snippets.size === 0
      ? []
      : await prisma.note.findMany({
          where: { userId, id: { in: [...snippets.keys()] } },
          select: summarySelect,
          orderBy: { updatedAt: "desc" },
        });

  return [
    ...titleMatches.map((note) => ({ note })),
    ...contentMatches.map((note) => ({ note, snippet: snippets.get(note.id) })),
  ].slice(0, limit);
}
