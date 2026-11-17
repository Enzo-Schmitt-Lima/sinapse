"use client";

import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { importNotesAction } from "@/app/actions/notes";
import { noteKeys } from "@/lib/api-client";
import {
  IMPORT_MAX_BYTES,
  clearLocalNotes,
  getImportDoneAt,
  markImportDone,
  payloadBytes,
  readLocalNotes,
  toImportPayload,
} from "@/lib/local-import";
import { useCurrentUserId } from "@/components/app/query-provider";

export type ImportOutcome = { ok: true; imported: number } | { ok: false; error: string };

interface LocalImportState {
  /** `undefined` enquanto lê o IndexedDB. */
  localCount: number | undefined;
  importedAt: number | null;
}

/** Estado das notas da v1 neste navegador e as ações de importar e limpar. */
export function useLocalImport() {
  const userId = useCurrentUserId();
  const queryClient = useQueryClient();
  const [state, setState] = useState<LocalImportState>({ localCount: undefined, importedAt: null });

  const refresh = useCallback(async () => {
    const notes = await readLocalNotes().catch(() => []);
    setState({ localCount: notes.length, importedAt: getImportDoneAt() });
  }, []);

  useEffect(() => {
    // Lê o IndexedDB (assíncrono) e só então atualiza o estado.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const runImport = useCallback(async (): Promise<ImportOutcome> => {
    let payload;
    try {
      payload = toImportPayload(await readLocalNotes());
    } catch {
      return { ok: false, error: "Não foi possível ler as notas deste navegador." };
    }
    if (payload.length === 0) return { ok: false, error: "Não há notas para importar." };
    if (payloadBytes(payload) > IMPORT_MAX_BYTES) {
      return {
        ok: false,
        error: "Suas notas locais somam mais de 4 MB e não cabem numa importação só. Nada foi importado.",
      };
    }

    let result;
    try {
      result = await importNotesAction({ notes: payload });
    } catch {
      return { ok: false, error: "Sem conexão com o servidor. Nada foi importado; tente novamente." };
    }
    if (!result.ok) return { ok: false, error: result.error };

    markImportDone();
    await queryClient.invalidateQueries({ queryKey: noteKeys.list(userId) });
    await queryClient.invalidateQueries({ queryKey: noteKeys.backlinksAll(userId) });
    await refresh();
    return { ok: true, imported: result.data.imported };
  }, [queryClient, refresh, userId]);

  const clear = useCallback(async () => {
    await clearLocalNotes();
    await refresh();
  }, [refresh]);

  return { ...state, runImport, clear };
}

export function formatNoteCount(count: number): string {
  return count === 1 ? "1 nota" : `${count.toLocaleString("pt-BR")} notas`;
}
