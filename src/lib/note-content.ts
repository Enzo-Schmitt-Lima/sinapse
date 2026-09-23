import type { PartialBlock } from "@blocknote/core";

function collectTextFromInlineContent(content: unknown, parts: string[]) {
  if (typeof content === "string") {
    parts.push(content);
    return;
  }
  if (!Array.isArray(content)) return;
  for (const item of content) {
    if (item && typeof item === "object" && typeof (item as { text?: unknown }).text === "string") {
      parts.push((item as { text: string }).text);
    }
  }
}

function collectTextFromBlocks(blocks: unknown, parts: string[]) {
  if (!Array.isArray(blocks)) return;
  for (const block of blocks) {
    if (!block || typeof block !== "object") continue;
    collectTextFromInlineContent((block as { content?: unknown }).content, parts);
    collectTextFromBlocks((block as { children?: unknown }).children, parts);
  }
}

export function extractPlainText(blocks: PartialBlock[]): string {
  const parts: string[] = [];
  collectTextFromBlocks(blocks, parts);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function buildSnippet(text: string, matchIndex: number, matchLength: number, radius = 40): string {
  const start = Math.max(0, matchIndex - radius);
  const end = Math.min(text.length, matchIndex + matchLength + radius);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return `${prefix}${text.slice(start, end)}${suffix}`;
}
