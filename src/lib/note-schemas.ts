import { z } from "zod";

// Validação da entrada das notas (v2). Usada pelas server actions antes de
// qualquer acesso ao banco; também pode ser usada no cliente para avisar cedo.
// As mensagens são escritas aqui porque as padrão do zod vêm em inglês.

export const NOTE_TITLE_MAX = 200;
export const NOTE_CONTENT_MAX_BYTES = 200 * 1024;
export const NOTE_FOLDER_MAX = 100;
export const NOTE_SEARCH_MAX = 200;
/** Máximo de notas por usuário (protege o limite gratuito do banco). */
export const NOTE_LIMIT = 2000;
export const DEFAULT_NOTE_TITLE = "Sem título";

const INVALID_DATA = "Dados inválidos.";

function jsonByteLength(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value)).length;
}

export const noteIdSchema = z
  .string({ error: "Nota inválida." })
  .min(1, "Nota inválida.")
  .max(64, "Nota inválida.");

export const titleSchema = z
  .string({ error: "Título inválido." })
  .trim()
  .max(NOTE_TITLE_MAX, `O título pode ter no máximo ${NOTE_TITLE_MAX} caracteres.`)
  .transform((title) => title || DEFAULT_NOTE_TITLE);

export const contentSchema = z
  .array(z.record(z.string(), z.unknown()), { error: "Conteúdo inválido." })
  .refine(
    (blocks) => jsonByteLength(blocks) <= NOTE_CONTENT_MAX_BYTES,
    "Esta nota ficou grande demais (limite de ~200 KB). Divida o conteúdo em subpáginas.",
  );

export const folderSchema = z
  .string({ error: "Matéria inválida." })
  .trim()
  .min(1, "O nome da matéria não pode ficar vazio.")
  .max(NOTE_FOLDER_MAX, `O nome da matéria pode ter no máximo ${NOTE_FOLDER_MAX} caracteres.`)
  .nullable();

export const parentIdSchema = noteIdSchema.nullable();

// strictObject: campos desconhecidos (ex.: userId, links) são rejeitados.
export const createNoteSchema = z.strictObject(
  {
    title: titleSchema.optional(),
    parentId: parentIdSchema.optional(),
    folder: folderSchema.optional(),
  },
  { error: INVALID_DATA },
);

export const updateNoteSchema = z.strictObject(
  {
    title: titleSchema.optional(),
    content: contentSchema.optional(),
    parentId: parentIdSchema.optional(),
    folder: folderSchema.optional(),
    favorite: z.boolean({ error: INVALID_DATA }).optional(),
  },
  { error: INVALID_DATA },
);

export const searchQuerySchema = z
  .string({ error: "Busca inválida." })
  .max(NOTE_SEARCH_MAX, `A busca pode ter no máximo ${NOTE_SEARCH_MAX} caracteres.`);

// Importação das notas da v1 (IndexedDB). O id é o local (nanoid), usado só
// para remapear pais e links; `links` não é aceito: o servidor recalcula.
// Datas em milissegundos, como a v1 guardava.
const MIN_TIMESTAMP = Date.UTC(2020, 0, 1);
const timestampSchema = z
  .number({ error: INVALID_DATA })
  .int(INVALID_DATA)
  .min(MIN_TIMESTAMP, INVALID_DATA)
  .refine((value) => value <= Date.now() + 24 * 60 * 60 * 1000, INVALID_DATA);

export const importedNoteSchema = z.strictObject(
  {
    id: noteIdSchema,
    title: titleSchema,
    content: contentSchema,
    parentId: parentIdSchema,
    folder: folderSchema,
    favorite: z.boolean({ error: INVALID_DATA }),
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
  },
  { error: INVALID_DATA },
);

export const importNotesSchema = z
  .strictObject(
    {
      notes: z
        .array(importedNoteSchema, { error: INVALID_DATA })
        .min(1, "Não há notas para importar.")
        .max(NOTE_LIMIT, `Dá para importar no máximo ${NOTE_LIMIT.toLocaleString("pt-BR")} notas.`),
    },
    { error: INVALID_DATA },
  )
  .refine(({ notes }) => new Set(notes.map((note) => note.id)).size === notes.length, INVALID_DATA);

export type CreateNoteInput = z.output<typeof createNoteSchema>;
export type NotePatch = z.output<typeof updateNoteSchema>;
export type ImportNotesInput = z.output<typeof importNotesSchema>;
