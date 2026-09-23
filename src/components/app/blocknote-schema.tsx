"use client";

import { BlockNoteEditor, BlockNoteSchema, defaultInlineContentSpecs, type PartialBlock } from "@blocknote/core";
import { createReactInlineContentSpec } from "@blocknote/react";
import { NOTE_LINK_TYPE } from "@/lib/note-links";
import { NoteLinkChip } from "./note-link-chip";

const noteLink = createReactInlineContentSpec(
  {
    type: NOTE_LINK_TYPE,
    propSchema: {
      noteId: { default: "" },
      title: { default: "" },
    },
    content: "none",
  },
  {
    render: (props) => (
      <NoteLinkChip noteId={props.inlineContent.props.noteId} title={props.inlineContent.props.title} />
    ),
  },
);

export const noteSchema = BlockNoteSchema.create({
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    [NOTE_LINK_TYPE]: noteLink,
  },
});

// Editor headless (sem montar UI) só para conversões, ex.: exportar Markdown.
export function blocksToMarkdown(blocks: PartialBlock[]): string {
  const editor = BlockNoteEditor.create({ schema: noteSchema });
  return editor.blocksToMarkdownLossy(blocks);
}
