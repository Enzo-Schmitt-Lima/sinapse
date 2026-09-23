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
      <FileText className="h-10 w-10 text-muted-foreground" />
      <div className="space-y-1">
        <h2 className="text-lg font-medium">Nenhuma nota aberta</h2>
        <p className="text-sm text-muted-foreground">Escolha uma nota na barra lateral ou crie a primeira.</p>
      </div>
      <Button onClick={handleCreate}>Criar primeira nota</Button>
    </div>
  );
}
