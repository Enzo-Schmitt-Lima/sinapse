import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { NOTE_LIMIT, contentSchema, createNoteSchema, titleSchema, updateNoteSchema } from "@/lib/note-schemas";
import {
  InvalidParentError,
  NoteLimitError,
  NoteNotFoundError,
  assertBelowNoteLimit,
  createNote,
  deleteNote,
  getBacklinks,
  getNote,
  listFolders,
  listNotes,
  searchNotes,
  toggleFavorite,
  updateNote,
} from "./notes";

// Usuário A tenta ler, editar, excluir, usar como pai e linkar a nota do
// usuário B. Roda no branch "dev" do Neon (ver src/test/setup-db.ts).

const run = randomUUID().slice(0, 8);
const SECRET_TITLE = `Segredo de B ${run}`;
const SECRET_TEXT = `palavrasecretadeb${run}`;

function paragraph(text: string) {
  return { type: "paragraph", content: [{ type: "text", text, styles: {} }] };
}

function linkTo(noteId: string) {
  return {
    type: "paragraph",
    content: [{ type: "noteLink", props: { noteId, title: "link" } }],
  };
}

let userA: string;
let userB: string;
let noteB: string;
let folderB: string;

beforeAll(async () => {
  const [a, b] = await Promise.all([
    prisma.user.create({ data: { email: `a-${run}@sinapse.test`, name: "Teste A" } }),
    prisma.user.create({ data: { email: `b-${run}@sinapse.test`, name: "Teste B" } }),
  ]);
  userA = a.id;
  userB = b.id;

  folderB = `Matéria secreta ${run}`;
  const created = await createNote(userB, { title: SECRET_TITLE, folder: folderB });
  await updateNote(userB, created.id, { content: [paragraph(`Texto com ${SECRET_TEXT} dentro.`)] });
  noteB = created.id;
});

afterAll(async () => {
  // Apagar os usuários apaga as notas deles (onDelete: Cascade).
  await prisma.user.deleteMany({ where: { id: { in: [userA, userB].filter(Boolean) } } });
  await prisma.$disconnect();
});

async function snapshotB() {
  return prisma.note.findUniqueOrThrow({ where: { id: noteB } });
}

describe("isolamento entre usuários", () => {
  it("A não lê a nota de B", async () => {
    await expect(getNote(userA, noteB)).rejects.toBeInstanceOf(NoteNotFoundError);
  });

  it("nota de outra pessoa e nota inexistente dão o mesmo erro", async () => {
    const other = await getNote(userA, noteB).catch((error: Error) => error.message);
    const missing = await getNote(userA, "nao-existe").catch((error: Error) => error.message);
    expect(other).toBe(missing);
  });

  it("A não edita a nota de B", async () => {
    const before = await snapshotB();
    await expect(updateNote(userA, noteB, { title: "invadida" })).rejects.toBeInstanceOf(NoteNotFoundError);
    await expect(updateNote(userA, noteB, { content: [paragraph("invadida")] })).rejects.toBeInstanceOf(
      NoteNotFoundError,
    );
    expect(await snapshotB()).toEqual(before);
  });

  it("A não favorita a nota de B", async () => {
    const before = await snapshotB();
    await expect(toggleFavorite(userA, noteB)).rejects.toBeInstanceOf(NoteNotFoundError);
    expect(await snapshotB()).toEqual(before);
  });

  it("A não exclui a nota de B", async () => {
    await expect(deleteNote(userA, noteB)).rejects.toBeInstanceOf(NoteNotFoundError);
    expect(await prisma.note.count({ where: { id: noteB } })).toBe(1);
  });

  it("A não usa a nota de B como pai", async () => {
    await expect(createNote(userA, { parentId: noteB })).rejects.toBeInstanceOf(InvalidParentError);

    const own = await createNote(userA, { title: "Nota de A" });
    await expect(updateNote(userA, own.id, { parentId: noteB })).rejects.toBeInstanceOf(InvalidParentError);
    expect((await getNote(userA, own.id)).parentId).toBeNull();
    expect(await prisma.note.count({ where: { parentId: noteB } })).toBe(0);
  });

  it("links para a nota de B são descartados; links para notas de A são mantidos", async () => {
    const target = await createNote(userA, { title: "Alvo de A" });
    const source = await createNote(userA, { title: "Origem de A" });

    const saved = await updateNote(userA, source.id, { content: [linkTo(noteB), linkTo(target.id)] });
    expect(saved.links).toEqual([target.id]);

    const onlyForeign = await updateNote(userA, source.id, { content: [linkTo(noteB)] });
    expect(onlyForeign.links).toEqual([]);
  });

  it("A não vê a nota de B em listas, pastas, backlinks nem na busca", async () => {
    const ids = (await listNotes(userA)).map((note) => note.id);
    expect(ids).not.toContain(noteB);
    expect(await listFolders(userA)).not.toContain(folderB);
    expect(await getBacklinks(userA, noteB)).toEqual([]);

    expect(await searchNotes(userA, SECRET_TITLE)).toEqual([]);
    // Busca por conteúdo usa $queryRaw: é o ponto de maior risco.
    expect(await searchNotes(userA, SECRET_TEXT)).toEqual([]);
    expect(await searchNotes(userA, "")).not.toContainEqual(
      expect.objectContaining({ note: expect.objectContaining({ id: noteB }) }),
    );
  });

  it("controle: B encontra a própria nota pelo título e pelo conteúdo", async () => {
    expect((await searchNotes(userB, SECRET_TITLE)).map((result) => result.note.id)).toEqual([noteB]);
    const byContent = await searchNotes(userB, SECRET_TEXT);
    expect(byContent.map((result) => result.note.id)).toEqual([noteB]);
    expect(byContent[0].snippet).toContain(SECRET_TEXT);
  });

  it("a busca trata % e _ como texto, não como curinga", async () => {
    expect(await searchNotes(userA, "%")).toEqual([]);
    expect(await searchNotes(userA, "_")).toEqual([]);
  });
});

describe("regras da própria árvore", () => {
  it("uma página não vira subpágina de si mesma nem de uma descendente", async () => {
    const parent = await createNote(userA, { title: "Pai" });
    const child = await createNote(userA, { title: "Filha", parentId: parent.id });

    await expect(updateNote(userA, parent.id, { parentId: parent.id })).rejects.toBeInstanceOf(InvalidParentError);
    await expect(updateNote(userA, parent.id, { parentId: child.id })).rejects.toBeInstanceOf(InvalidParentError);
  });

  it("excluir a nota exclui as subpáginas e devolve os ids", async () => {
    const parent = await createNote(userA, { title: "Pai para excluir" });
    const child = await createNote(userA, { title: "Filha", parentId: parent.id });
    const grandchild = await createNote(userA, { title: "Neta", parentId: child.id });

    const deleted = await deleteNote(userA, parent.id);
    expect(new Set(deleted)).toEqual(new Set([parent.id, child.id, grandchild.id]));
    expect(await prisma.note.count({ where: { id: { in: deleted } } })).toBe(0);
  });
});

describe("validação e limites", () => {
  it("título acima de 200 caracteres é recusado com mensagem em português", () => {
    const result = titleSchema.safeParse("a".repeat(201));
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("O título pode ter no máximo 200 caracteres.");
    expect(titleSchema.parse("   ")).toBe("Sem título");
  });

  it("conteúdo acima de ~200 KB é recusado", () => {
    const result = contentSchema.safeParse([paragraph("x".repeat(210 * 1024))]);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain("grande demais");
  });

  it("campos desconhecidos (ex.: userId, links) são recusados", () => {
    expect(createNoteSchema.safeParse({ userId: userB }).success).toBe(false);
    expect(updateNoteSchema.safeParse({ links: [noteB] }).success).toBe(false);
  });

  it(`limite de ${NOTE_LIMIT} notas por usuário`, () => {
    expect(() => assertBelowNoteLimit(NOTE_LIMIT - 1)).not.toThrow();
    expect(() => assertBelowNoteLimit(NOTE_LIMIT)).toThrow(NoteLimitError);
    expect(() => assertBelowNoteLimit(3, 3)).toThrow("Você chegou ao limite de 3 notas");
  });
});
