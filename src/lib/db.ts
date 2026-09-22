import Dexie, { type EntityTable } from "dexie";
import type { PartialBlock } from "@blocknote/core";
import { nanoid } from "nanoid";

export interface Note {
  id: string;
  title: string;
  content: PartialBlock[];
  parentId: string | null;
  folder: string | null;
  favorite: boolean;
  links: string[];
  createdAt: number;
  updatedAt: number;
}

const WELCOME_NOTE_CONTENT: PartialBlock[] = [
  { type: "heading", props: { level: 1 }, content: "Bem-vindo ao Sinapse" },
  {
    type: "paragraph",
    content:
      "Sinapse é o seu espaço para organizar anotações de estudo com páginas conectadas, misturando o editor em blocos do Notion com os links do Obsidian.",
  },
  { type: "heading", props: { level: 2 }, content: "Como usar" },
  {
    type: "bulletListItem",
    content: "Digite / em qualquer linha para inserir blocos (títulos, listas, código e mais).",
  },
  {
    type: "bulletListItem",
    content: "Digite [[ para linkar outra nota e criar backlinks automaticamente.",
  },
  {
    type: "bulletListItem",
    content: "Use a barra lateral para criar páginas e subpáginas e organizar suas notas por pastas.",
  },
  { type: "paragraph", content: "Crie sua primeira nota e comece a estudar!" },
];

export const db = new Dexie("sinapse") as Dexie & {
  notes: EntityTable<Note, "id">;
};

db.version(1).stores({
  notes: "id, parentId, folder, favorite, updatedAt, *links",
});

db.on("populate", async () => {
  const now = Date.now();
  await db.notes.add({
    id: nanoid(),
    title: "Bem-vindo ao Sinapse",
    content: WELCOME_NOTE_CONTENT,
    parentId: null,
    folder: null,
    favorite: false,
    links: [],
    createdAt: now,
    updatedAt: now,
  });
});
