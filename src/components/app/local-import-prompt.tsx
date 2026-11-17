"use client";

import { useState } from "react";
import { formatNoteCount, useLocalImport } from "@/hooks/useLocalImport";
import { dismissImport, isImportDismissed } from "@/lib/local-import";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "./app-toast";

// Aviso após o login para quem tem notas da v1 neste navegador. Carregado com
// next/dynamic (ssr: false) pelo AppShell, para o Dexie ficar fora do bundle.
export default function LocalImportPrompt() {
  const { localCount, importedAt, runImport } = useLocalImport();
  const showToast = useToast();
  const [dismissed, setDismissed] = useState(isImportDismissed);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = !dismissed && importedAt === null && !!localCount;

  function handleDismiss() {
    if (importing) return;
    dismissImport();
    setDismissed(true);
  }

  async function handleImport() {
    setImporting(true);
    setError(null);
    const outcome = await runImport();
    setImporting(false);
    if (outcome.ok) {
      showToast(`${formatNoteCount(outcome.imported)} ${outcome.imported === 1 ? "importada" : "importadas"} para sua conta.`);
    } else {
      setError(outcome.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleDismiss()}>
      <DialogContent showCloseButton={!importing}>
        <DialogHeader>
          <DialogTitle>Notas deste navegador</DialogTitle>
          <DialogDescription>
            Encontramos {formatNoteCount(localCount ?? 0)} {localCount === 1 ? "salva" : "salvas"} neste navegador.
            Deseja importá-las para sua conta?
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          As notas locais continuam aqui depois da importação. Você pode limpá-las em Configurações.
        </p>
        {error && (
          <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" disabled={importing} onClick={handleDismiss}>
            Agora não
          </Button>
          <Button type="button" disabled={importing} onClick={() => void handleImport()}>
            {importing ? "Importando…" : "Importar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
