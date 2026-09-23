import type { PartialBlock } from "@blocknote/core";

export const NOTE_LINK_TYPE = "noteLink";

function collectFromInlineContent(content: unknown, ids: Set<string>) {
  if (!Array.isArray(content)) return;
  for (const item of content) {
    if (item && typeof item === "object" && (item as { type?: unknown }).type === NOTE_LINK_TYPE) {
      const noteId = (item as { props?: { noteId?: unknown } }).props?.noteId;
      if (typeof noteId === "string" && noteId) ids.add(noteId);
    }
  }
}

function collectFromBlocks(blocks: unknown, ids: Set<string>) {
  if (!Array.isArray(blocks)) return;
  for (const block of blocks) {
    if (!block || typeof block !== "object") continue;
    collectFromInlineContent((block as { content?: unknown }).content, ids);
    collectFromBlocks((block as { children?: unknown }).children, ids);
  }
}

export function extractNoteLinks(blocks: PartialBlock[]): string[] {
  const ids = new Set<string>();
  collectFromBlocks(blocks, ids);
  return [...ids];
}
