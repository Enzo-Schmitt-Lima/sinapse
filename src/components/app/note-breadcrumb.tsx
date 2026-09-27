import Link from "next/link";
import type { NoteSummary } from "@/lib/note-types";

interface NoteBreadcrumbProps {
  note: Pick<NoteSummary, "title" | "folder">;
  ancestors: NoteSummary[];
}

export function NoteBreadcrumb({ note, ancestors }: NoteBreadcrumbProps) {
  if (!note.folder && ancestors.length === 0) return null;

  return (
    <nav aria-label="Caminho da nota" className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
      {note.folder && (
        <>
          <span>{note.folder}</span>
          <span aria-hidden="true">/</span>
        </>
      )}
      {ancestors.map((ancestor) => (
        <span key={ancestor.id} className="flex items-center gap-1.5">
          <Link href={`/app/${ancestor.id}`} className="rounded-sm underline-offset-4 hover:text-foreground hover:underline">
            {ancestor.title || "Sem título"}
          </Link>
          <span aria-hidden="true">/</span>
        </span>
      ))}
      <span aria-current="page" className="truncate text-foreground">{note.title || "Sem título"}</span>
    </nav>
  );
}
