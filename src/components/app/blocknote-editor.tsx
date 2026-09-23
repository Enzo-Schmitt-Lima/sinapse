"use client";

import { FileText, Plus } from "lucide-react";
import { SuggestionMenuController, useCreateBlockNote, type DefaultReactSuggestionItem } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { pt } from "@blocknote/core/locales";
import type { PartialBlock } from "@blocknote/core";
import "@blocknote/shadcn/style.css";
import { createNote, searchNotes } from "@/lib/notes";
import { NOTE_LINK_TYPE } from "@/lib/note-links";
import { noteSchema } from "./blocknote-schema";

type NoteEditorInstance = ReturnType<typeof useCreateBlockNote<{ schema: typeof noteSchema }>>;

function insertNoteLink(editor: NoteEditorInstance, noteId: string, title: string) {
  editor.insertInlineContent([
    { type: NOTE_LINK_TYPE, props: { noteId, title: title || "Sem título" } },
    " ",
  ]);
}

async function getNoteLinkItems(
  editor: NoteEditorInstance,
  query: string,
): Promise<DefaultReactSuggestionItem[]> {
  const notes = await searchNotes(query);

  if (notes.length === 0 && query.trim()) {
    return [
      {
        title: `Criar nota "${query.trim()}"`,
        icon: <Plus className="h-4 w-4" />,
        onItemClick: async () => {
          const note = await createNote({ title: query.trim() });
          insertNoteLink(editor, note.id, note.title);
        },
      },
    ];
  }

  return notes.map((note) => ({
    title: note.title || "Sem título",
    subtext: note.folder ?? undefined,
    icon: <FileText className="h-4 w-4" />,
    onItemClick: () => insertNoteLink(editor, note.id, note.title),
  }));
}

interface BlockNoteEditorProps {
  initialContent: PartialBlock[];
  onChange: (content: PartialBlock[]) => void;
  theme: "light" | "dark";
}

export function BlockNoteEditor({ initialContent, onChange, theme }: BlockNoteEditorProps) {
  const editor = useCreateBlockNote({
    schema: noteSchema,
    initialContent: initialContent.length > 0 ? initialContent : undefined,
    dictionary: pt,
  });

  return (
    <BlockNoteView
      editor={editor}
      theme={theme}
      // editor.document é tipado pelo schema customizado (inclui noteLink);
      // guardamos o conteúdo das notas como PartialBlock[] genérico.
      onChange={() => onChange(editor.document as PartialBlock[])}
    >
      <SuggestionMenuController triggerCharacter="[[" getItems={(query) => getNoteLinkItems(editor, query)} />
    </BlockNoteView>
  );
}
