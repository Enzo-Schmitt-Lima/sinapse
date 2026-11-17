import { describe, expect, it } from "vitest";
import { extractNoteLinks } from "./note-links";
import { remapImportedNotes, type ImportedNoteInput } from "./note-import";

function chip(noteId: string) {
  return { type: "noteLink", props: { noteId, title: "link" } };
}

function note(id: string, parentId: string | null, content: Record<string, unknown>[] = []): ImportedNoteInput {
  return { id, title: id, content, parentId, folder: null, favorite: false, createdAt: 1, updatedAt: 2 };
}

function sequentialIds() {
  let next = 0;
  return () => `novo-${++next}`;
}

describe("remapImportedNotes", () => {
  it("remapeia subpáginas em vários níveis e devolve pais antes dos filhos", () => {
    const input = [note("neta", "filha"), note("filha", "raiz"), note("raiz", null)];
    const result = remapImportedNotes(input, sequentialIds());
    const byTitle = new Map(result.map((item) => [item.title, item]));

    expect(result.map((item) => item.title)).toEqual(["raiz", "filha", "neta"]);
    expect(byTitle.get("raiz")!.parentId).toBeNull();
    expect(byTitle.get("filha")!.parentId).toBe(byTitle.get("raiz")!.id);
    expect(byTitle.get("neta")!.parentId).toBe(byTitle.get("filha")!.id);
    expect(result.every((item) => item.id.startsWith("novo-"))).toBe(true);
  });

  it("troca o noteId dos chips em parágrafos, blocos filhos, links e tabelas", () => {
    const content = [
      { type: "paragraph", content: [{ type: "text", text: "ver " }, chip("b")] },
      { type: "paragraph", content: [], children: [{ type: "paragraph", content: [chip("c")] }] },
      {
        type: "table",
        content: { type: "tableContent", rows: [{ cells: [[chip("b")], { type: "tableCell", content: [chip("c")] }] }] },
      },
    ];
    const input = [note("a", null, content), note("b", null), note("c", "b")];
    const original = structuredClone(input);
    const result = remapImportedNotes(input, sequentialIds());
    const ids = new Map(result.map((item) => [item.title, item.id]));
    const a = result.find((item) => item.title === "a")!;

    expect(new Set(extractNoteLinks(a.content))).toEqual(new Set([ids.get("b"), ids.get("c")]));
    expect(new Set(a.links)).toEqual(new Set([ids.get("b"), ids.get("c")]));
    // A entrada não é alterada.
    expect(input).toEqual(original);
  });

  it("link para nota fora da importação vira chip de nota excluída (noteId vazio)", () => {
    const result = remapImportedNotes([note("a", null, [{ type: "paragraph", content: [chip("sumiu")] }])], sequentialIds());
    const block = result[0].content[0] as unknown as { content: { props: { noteId: string } }[] };
    expect(block.content[0].props.noteId).toBe("");
    expect(result[0].links).toEqual([]);
  });

  it("pai ausente vira raiz e ciclos são quebrados", () => {
    const result = remapImportedNotes(
      [note("orfa", "nao-existe"), note("x", "y"), note("y", "x")],
      sequentialIds(),
    );
    expect(result).toHaveLength(3);
    expect(result.find((item) => item.title === "orfa")!.parentId).toBeNull();
    const roots = result.filter((item) => item.parentId === null).map((item) => item.title);
    expect(roots).toContain("orfa");
    expect(roots.filter((title) => title === "x" || title === "y")).toHaveLength(1);
  });

  it("converte as datas da v1 (ms) para Date", () => {
    const [result] = remapImportedNotes([{ ...note("a", null), createdAt: 1_700_000_000_000 }], sequentialIds());
    expect(result.createdAt).toEqual(new Date(1_700_000_000_000));
  });
});
