"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { pt } from "@blocknote/core/locales";
import type { PartialBlock } from "@blocknote/core";
import "@blocknote/shadcn/style.css";

interface BlockNoteEditorProps {
  initialContent: PartialBlock[];
  onChange: (content: PartialBlock[]) => void;
  theme: "light" | "dark";
}

export function BlockNoteEditor({ initialContent, onChange, theme }: BlockNoteEditorProps) {
  const editor = useCreateBlockNote({
    initialContent: initialContent.length > 0 ? initialContent : undefined,
    dictionary: pt,
  });

  return <BlockNoteView editor={editor} theme={theme} onChange={() => onChange(editor.document)} />;
}
