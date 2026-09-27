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

export type CreateNoteInput = z.output<typeof createNoteSchema>;
export type NotePatch = z.output<typeof updateNoteSchema>;
