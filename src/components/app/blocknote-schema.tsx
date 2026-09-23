"use client";

import { BlockNoteSchema, defaultInlineContentSpecs } from "@blocknote/core";
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
