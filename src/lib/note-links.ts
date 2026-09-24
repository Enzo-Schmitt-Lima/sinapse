import type { PartialBlock } from "@blocknote/core";
import { forEachInlineItem } from "./note-content";

export const NOTE_LINK_TYPE = "noteLink";

export function extractNoteLinks(blocks: PartialBlock[]): string[] {
  const ids = new Set<string>();
  forEachInlineItem(blocks, (item) => {
    if (typeof item === "string" || item.type !== NOTE_LINK_TYPE) return;
    const props = item.props as { noteId?: unknown } | undefined;
    if (typeof props?.noteId === "string" && props.noteId) ids.add(props.noteId);
  });
  return [...ids];
}
