"use client";

import { useState } from "react";
import { formatNoteCount, useLocalImport } from "@/hooks/useLocalImport";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

// Seção "Notas deste navegador" da página de configurações: status, importar
// de novo (para quem clicou "Agora não") e limpar as notas locais da v1.
export default function LocalNotesPanel() {
  const { localCount, importedAt, runImport, clear } = useLocalImport();
  const [busy, setBusy] = useState<"import" | "clear" | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function handleImport() {
    setBusy("import");
    setMessage(null);
    const outcome = await runImport();
    setBusy(null);
    setMessage(
      outcome.ok
        ? {
            kind: "ok",
            text: `${formatNoteCount(outcome.imported)} ${outcome.imported === 1 ? "importada" : "importadas"} para sua conta.`,
          }
        : { kind: "error", text: outcome.error },
    );
  }

  async function handleClear() {
    setBusy("clear");
    setMessage(null);
    try {
      await clear();
      setMessage({ kind: "ok", text: "As notas locais deste navegador foram apagadas." });
    } catch {
      setMessage({ kind: "error", text: "Não foi possível limpar as notas locais. Feche outras abas do Sinapse e tente de novo." });
    } finally {
      setBusy(null);
    }
  }

  const loading = localCount === undefined;
  const hasLocal = !!localCount;

  return (
    <section aria-labelledby="local-notes-title" className="space-y-4 rounded-lg border p-4 md:p-6">
      <div className="space-y-1">
        <h2 id="local-notes-title" className="text-base font-medium">
          Notas deste navegador (versão anterior)
        </h2>
        <p className="text-sm text-muted-foreground">
          A primeira versão do Sinapse guardava as notas só neste navegador. Elas não fazem parte da sua conta até
          serem importadas.
        </p>
      </div>

      <p className="text-sm" aria-live="polite">
        {loading
          ? "Verificando…"
          : hasLocal
            ? `${formatNoteCount(localCount)} ${localCount === 1 ? "salva" : "salvas"} neste navegador.`
            : "Não há notas da versão anterior neste navegador."}
        {!loading && importedAt !== null && ` Importadas para a conta em ${formatDate(importedAt)}.`}
      </p>

      {message && (
        <p
          role={message.kind === "error" ? "alert" : "status"}
          className={
            message.kind === "error"
              ? "rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              : "rounded-md border bg-muted/50 px-3 py-2 text-sm"
          }
        >
          {message.text}
        </p>
      )}

      {hasLocal && (
        <div className="flex flex-col gap-2 sm:flex-row">
          {importedAt === null && (
            <Button type="button" disabled={busy !== null} onClick={() => void handleImport()}>
              {busy === "import" ? "Importando…" : "Importar agora"}
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" disabled={busy !== null}>
                {busy === "clear" ? "Limpando…" : "Limpar notas locais"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Limpar notas locais?</AlertDialogTitle>
                <AlertDialogDescription>
                  {importedAt === null
                    ? "Estas notas ainda NÃO foram importadas para sua conta. Se você limpar agora, elas serão perdidas para sempre."
                    : "Isso apaga as notas guardadas só neste navegador. As notas da sua conta não são afetadas."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className={importedAt === null ? "bg-destructive text-white hover:bg-destructive/90" : undefined}
                  onClick={() => void handleClear()}
                >
                  Limpar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </section>
  );
}
