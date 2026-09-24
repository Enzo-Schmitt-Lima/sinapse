"use client";

import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createNote } from "@/lib/notes";

export function EmptyState() {
  const router = useRouter();

  async function handleCreate() {
    const note = await createNote();
    router.push(`/app/${note.id}`);
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <FileText className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
      <div className="space-y-1">
        <h1 className="text-lg font-medium">Nenhuma nota aberta</h1>
        <p className="text-sm text-muted-foreground">Escolha uma nota na barra lateral ou crie uma nova.</p>
      </div>
      <Button onClick={handleCreate}>Nova nota</Button>
    </div>
  );
}
