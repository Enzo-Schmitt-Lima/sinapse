"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { useNote } from "@/hooks/useNote";

interface NoteLinkChipProps {
  noteId: string;
  title: string;
}

export function NoteLinkChip({ noteId, title }: NoteLinkChipProps) {
  const note = useNote(noteId);
  const label = (note ? note.title : title) || "Sem título";

  if (!note) {
    return (
      <span
        contentEditable={false}
        className="inline-flex items-center gap-1 rounded-md border border-dashed px-1.5 py-0.5 align-baseline text-sm text-muted-foreground line-through"
      >
        <FileText className="h-3.5 w-3.5" />
        {label}
      </span>
    );
  }

  return (
    <Link
      href={`/app/${noteId}`}
      contentEditable={false}
      onMouseDown={(event) => event.stopPropagation()}
      className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 align-baseline text-sm font-medium text-primary no-underline hover:bg-primary/20"
    >
      <FileText className="h-3.5 w-3.5" />
      {label}
    </Link>
  );
}
