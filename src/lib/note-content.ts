import type { PartialBlock } from "@blocknote/core";

type InlineItem = Record<string, unknown>;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// Percorre o conteúdo inline de um bloco: lista simples, links (que têm
// `content` próprio) e tabelas (`tableContent` → linhas → células).
function walkInlineContent(content: unknown, visit: (item: InlineItem | string) => void) {
  if (typeof content === "string") {
    visit(content);
    return;
  }
  if (Array.isArray(content)) {
    for (const item of content) {
      if (typeof item === "string") {
        visit(item);
      } else if (isObject(item)) {
        visit(item);
        if (item.type === "link") walkInlineContent(item.content, visit);
      }
    }
    return;
  }
  if (isObject(content) && content.type === "tableContent" && Array.isArray(content.rows)) {
    for (const row of content.rows) {
      if (!isObject(row) || !Array.isArray(row.cells)) continue;
      for (const cell of row.cells) {
        walkInlineContent(isObject(cell) && !Array.isArray(cell) ? cell.content : cell, visit);
      }
    }
  }
}

/** Chama `visit` para cada item inline de todos os blocos (incluindo filhos). */
export function forEachInlineItem(blocks: unknown, visit: (item: InlineItem | string) => void) {
  if (!Array.isArray(blocks)) return;
  for (const block of blocks) {
    if (!isObject(block)) continue;
    walkInlineContent(block.content, visit);
    forEachInlineItem(block.children, visit);
  }
}

export function extractPlainText(blocks: PartialBlock[]): string {
  const parts: string[] = [];
  forEachInlineItem(blocks, (item) => {
    if (typeof item === "string") parts.push(item);
    else if (typeof item.text === "string") parts.push(item.text);
  });
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function buildSnippet(text: string, matchIndex: number, matchLength: number, radius = 40): string {
  const start = Math.max(0, matchIndex - radius);
  const end = Math.min(text.length, matchIndex + matchLength + radius);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return `${prefix}${text.slice(start, end)}${suffix}`;
}
