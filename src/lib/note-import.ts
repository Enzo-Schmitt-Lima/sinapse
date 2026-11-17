import type { PartialBlock } from "@blocknote/core";
import { forEachInlineItem } from "./note-content";
import { NOTE_LINK_TYPE, extractNoteLinks } from "./note-links";

// Importação das notas da v1: troca os ids locais (nanoid) por ids novos,
// remapeando parentId e os chips [[ ]] do conteúdo. Função pura (sem banco),
// usada pelo servidor dentro da transação de importação.

export interface ImportedNoteInput {
  id: string;
  title: string;
  content: Record<string, unknown>[];
  parentId: string | null;
  folder: string | null;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface RemappedNote {
  id: string;
  title: string;
  content: PartialBlock[];
  parentId: string | null;
  folder: string | null;
  favorite: boolean;
  links: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Pai ausente no lote vira raiz; um ciclo na árvore (dado corrompido) é
// quebrado tornando raiz a nota em que ele foi detectado.
function resolveParents(notes: ImportedNoteInput[]): Map<string, string | null> {
  const ids = new Set(notes.map((note) => note.id));
  const parentOf = new Map<string, string | null>(
    notes.map((note) => [note.id, note.parentId && ids.has(note.parentId) ? note.parentId : null]),
  );

  const safe = new Set<string>();
  for (const note of notes) {
    const path: string[] = [];
    const onPath = new Set<string>();
    let current: string | null = note.id;
    while (current && !safe.has(current)) {
      if (onPath.has(current)) {
        parentOf.set(current, null);
        break;
      }
      onPath.add(current);
      path.push(current);
      current = parentOf.get(current) ?? null;
    }
    for (const id of path) safe.add(id);
  }
  return parentOf;
}

/** Pais antes dos filhos, para a chave estrangeira de parentId valer em qualquer lote. */
function topologicalOrder(notes: ImportedNoteInput[], parentOf: Map<string, string | null>): ImportedNoteInput[] {
  const childrenOf = new Map<string | null, ImportedNoteInput[]>();
  for (const note of notes) {
    const parentId = parentOf.get(note.id) ?? null;
    const list = childrenOf.get(parentId) ?? [];
    list.push(note);
    childrenOf.set(parentId, list);
  }
  const ordered: ImportedNoteInput[] = [];
  const queue = [...(childrenOf.get(null) ?? [])];
  while (queue.length > 0) {
    const note = queue.shift()!;
    ordered.push(note);
    queue.push(...(childrenOf.get(note.id) ?? []));
  }
  return ordered;
}

// Copia o conteúdo e troca o noteId dos chips. Link para nota fora do lote
// fica com noteId vazio: o chip aparece como "nota excluída", como na v1.
function remapContent(content: Record<string, unknown>[], idMap: Map<string, string>): PartialBlock[] {
  const copy = structuredClone(content) as PartialBlock[];
  forEachInlineItem(copy, (item) => {
    if (typeof item === "string" || item.type !== NOTE_LINK_TYPE) return;
    const props = item.props as Record<string, unknown> | undefined;
    if (!props) return;
    const oldId = typeof props.noteId === "string" ? props.noteId : "";
    props.noteId = idMap.get(oldId) ?? "";
  });
  return copy;
}

export function remapImportedNotes(notes: ImportedNoteInput[], newId: () => string): RemappedNote[] {
  const idMap = new Map(notes.map((note) => [note.id, newId()]));
  const parentOf = resolveParents(notes);

  return topologicalOrder(notes, parentOf).map((note) => {
    const content = remapContent(note.content, idMap);
    const parentId = parentOf.get(note.id) ?? null;
    return {
      id: idMap.get(note.id)!,
      title: note.title,
      content,
      parentId: parentId ? idMap.get(parentId)! : null,
      folder: note.folder,
      favorite: note.favorite,
      links: extractNoteLinks(content),
      createdAt: new Date(note.createdAt),
      updatedAt: new Date(note.updatedAt),
    };
  });
}
