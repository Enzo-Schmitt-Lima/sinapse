"use client";

import { FileText, Plus } from "lucide-react";
import {
  SuggestionMenuController,
  useComponentsContext,
  useCreateBlockNote,
  type DefaultReactSuggestionItem,
  type SuggestionMenuProps,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { pt } from "@blocknote/core/locales";
import type { PartialBlock } from "@blocknote/core";
import "@blocknote/shadcn/style.css";
import type { NoteSummary } from "@/lib/note-types";
import { NOTE_LINK_TYPE } from "@/lib/note-links";
import { noteSchema } from "./blocknote-schema";

type NoteEditorInstance = ReturnType<typeof useCreateBlockNote<{ schema: typeof noteSchema }>>;

function insertNoteLink(editor: NoteEditorInstance, noteId: string, title: string) {
  editor.insertInlineContent([
    { type: NOTE_LINK_TYPE, props: { noteId, title: title || "Sem título" } },
    " ",
  ]);
}

type SearchNotes = (query: string) => Promise<NoteSummary[]>;
type CreateNote = (title: string) => Promise<{ id: string; title: string } | null>;

async function getNoteLinkItems(
  editor: NoteEditorInstance,
  query: string,
  searchNotes: SearchNotes,
  createNote: CreateNote,
): Promise<DefaultReactSuggestionItem[]> {
  let notes: NoteSummary[];
  try {
    notes = await searchNotes(query);
  } catch {
    // Sem conexão: o menu mostra "Nenhuma nota encontrada" em vez de travar.
    return [];
  }

  if (notes.length === 0 && query.trim()) {
    return [
      {
        title: `Criar nota "${query.trim()}"`,
        icon: <Plus className="h-4 w-4" />,
        onItemClick: async () => {
          const note = await createNote(query.trim());
          if (note) insertNoteLink(editor, note.id, note.title);
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

// Menu de sugestão próprio (em vez do padrão do BlockNote) porque o renderer
// padrão usa item.title como key da lista — com dois "Sem título" ele gera
// aviso de key duplicada no React. Aqui a key é o índice, sempre único.
function NoteLinkSuggestionMenu({
  items,
  loadingState,
  selectedIndex,
  onItemClick,
}: SuggestionMenuProps<DefaultReactSuggestionItem>) {
  const components = useComponentsContext();
  if (!components) return null;
  const { SuggestionMenu } = components;

  return (
    <SuggestionMenu.Root id="bn-suggestion-menu" className="bn-suggestion-menu">
      {(loadingState === "loading-initial" || loadingState === "loading") && (
        <SuggestionMenu.Loader className="bn-suggestion-menu-loader" />
      )}
      {items.map((item, index) => (
        <SuggestionMenu.Item
          key={index}
          className="bn-suggestion-menu-item"
          item={item}
          id={`bn-suggestion-menu-item-${index}`}
          isSelected={index === selectedIndex}
          onClick={() => onItemClick?.(item)}
        />
      ))}
      {items.length === 0 && (loadingState === "loading" || loadingState === "loaded") && (
        <SuggestionMenu.EmptyItem className="bn-suggestion-menu-item">
          Nenhuma nota encontrada
        </SuggestionMenu.EmptyItem>
      )}
    </SuggestionMenu.Root>
  );
}

interface BlockNoteEditorProps {
  initialContent: PartialBlock[];
  onChange: (content: PartialBlock[]) => void;
  theme: "light" | "dark";
  /** Busca no servidor (só notas do usuário) para as sugestões do [[. */
  searchNotes: SearchNotes;
  createNote: CreateNote;
}

export function BlockNoteEditor({ initialContent, onChange, theme, searchNotes, createNote }: BlockNoteEditorProps) {
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
      <SuggestionMenuController
        triggerCharacter="[["
        getItems={(query) => getNoteLinkItems(editor, query, searchNotes, createNote)}
        suggestionMenuComponent={NoteLinkSuggestionMenu}
      />
    </BlockNoteView>
  );
}
