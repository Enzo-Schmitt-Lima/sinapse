"use client";

import { useCallback, useEffect, useState } from "react";
import type { PartialBlock } from "@blocknote/core";
import { updateNoteAction, type ActionResult } from "@/app/actions/notes";
import type { Note } from "@/lib/note-types";

// Salvamento automático das notas.
// - Debounce de 800 ms; um envio por vez por nota (a versão mais nova sempre
//   vai por último, sem resposta velha sobrescrevendo a nova).
// - Se falhar, a versão pendente fica guardada (mesclada com o que for
//   digitado depois) e o envio é repetido em 2 s, 5 s, 10 s e 30 s, ao voltar
//   a conexão ou pelo botão "tentar de novo".
// - Cada pendência pertence a um usuário; pendências de outra sessão são
//   descartadas, nunca enviadas (ver QueryProvider e o logout).
// - Os salvadores vivem fora do React (registro abaixo), para continuarem
//   tentando mesmo depois que o editor da nota sai da tela.

export interface AutosavePatch {
  title?: string;
  content?: PartialBlock[];
}

export type AutosaveStatus =
  | { state: "saved" }
  | { state: "saving" }
  | { state: "error"; message: string; willRetry: boolean };

type SaveResult = ActionResult<Note> | { ok: false; error: string; code: "network" };

const DEBOUNCE_MS = 800;
const RETRY_DELAYS_MS = [2_000, 5_000, 10_000, 30_000];
const NETWORK_ERROR = "Erro ao salvar";

function sameStatus(a: AutosaveStatus, b: AutosaveStatus): boolean {
  if (a.state !== b.state) return false;
  if (a.state === "error" && b.state === "error") return a.message === b.message && a.willRetry === b.willRetry;
  return true;
}

class NoteAutosaver {
  status: AutosaveStatus = { state: "saved" };
  /** updatedAt da última versão que ESTA aba salvou (para não remontar o editor por causa dela). */
  lastSavedUpdatedAt: string | null = null;
  private onSaved: ((note: Note) => void) | null = null;

  private pending: AutosavePatch | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private inFlight: Promise<void> | null = null;
  private attempt = 0;
  private discarded = false;
  private listeners = new Set<(status: AutosaveStatus) => void>();

  constructor(
    readonly ownerId: string,
    readonly noteId: string,
  ) {}

  /** Callback chamado após cada salvamento (atualiza o cache do TanStack Query). */
  setOnSaved(callback: (note: Note) => void) {
    this.onSaved = callback;
  }

  subscribe(listener: (status: AutosaveStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  hasUnsaved(): boolean {
    return this.pending !== null || this.inFlight !== null;
  }

  schedule(patch: AutosavePatch) {
    if (this.discarded) return;
    this.pending = { ...this.pending, ...patch };
    this.clearRetry();
    this.setStatus({ state: "saving" });
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => void this.flush(), DEBOUNCE_MS);
  }

  /** Envia agora o que estiver pendente (espera um envio em andamento terminar). */
  async flush(): Promise<void> {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = null;
    this.clearRetry();
    while (this.inFlight) await this.inFlight;
    if (!this.pending || this.discarded) return;

    const toSave = this.pending;
    this.pending = null;
    this.setStatus({ state: "saving" });
    this.inFlight = this.send(toSave).finally(() => {
      this.inFlight = null;
    });
    await this.inFlight;
  }

  retryNow() {
    this.attempt = 0;
    void this.flush();
  }

  /** Descarta pendências e para as tentativas (logout / outra sessão). */
  discard() {
    this.discarded = true;
    this.pending = null;
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.clearRetry();
    this.listeners.clear();
    this.onSaved = null;
  }

  private async send(toSave: AutosavePatch) {
    let result: SaveResult;
    try {
      result = await updateNoteAction(this.noteId, toSave);
    } catch {
      result = { ok: false, error: NETWORK_ERROR, code: "network" };
    }
    if (this.discarded) return;

    if (result.ok) {
      this.attempt = 0;
      this.lastSavedUpdatedAt = result.data.updatedAt;
      this.onSaved?.(result.data);
      if (!this.pending && !this.debounceTimer) this.setStatus({ state: "saved" });
      return;
    }

    // Guarda o que falhou; o que foi digitado depois tem prioridade.
    this.pending = { ...toSave, ...this.pending };
    const permanent = result.code === "invalid" || result.code === "not_found" || result.code === "unauthorized";
    if (permanent) {
      this.setStatus({ state: "error", message: result.error, willRetry: false });
      return;
    }
    this.setStatus({ state: "error", message: NETWORK_ERROR, willRetry: true });
    const delay = RETRY_DELAYS_MS[Math.min(this.attempt, RETRY_DELAYS_MS.length - 1)];
    this.attempt += 1;
    this.retryTimer = setTimeout(() => void this.flush(), delay);
  }

  private clearRetry() {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = null;
  }

  private setStatus(status: AutosaveStatus) {
    // Mesmo estado → nada muda. Sem isso, cada tecla gerava um objeto novo e
    // re-renderizava o editor, que respondia com outro onChange (loop).
    if (sameStatus(this.status, status)) return;
    this.status = status;
    for (const listener of this.listeners) listener(status);
  }
}

const savers = new Map<string, NoteAutosaver>();

function saverKey(ownerId: string, noteId: string) {
  return `${ownerId}:${noteId}`;
}

export function getNoteAutosaver(ownerId: string, noteId: string): NoteAutosaver {
  const key = saverKey(ownerId, noteId);
  let saver = savers.get(key);
  if (!saver) {
    saver = new NoteAutosaver(ownerId, noteId);
    savers.set(key, saver);
  }
  return saver;
}

export function hasUnsavedChanges(): boolean {
  return [...savers.values()].some((saver) => saver.hasUnsaved());
}

export async function flushAllSavers(): Promise<void> {
  await Promise.all([...savers.values()].map((saver) => saver.flush()));
}

export function discardAllSavers() {
  for (const saver of savers.values()) saver.discard();
  savers.clear();
}

export function discardSaversNotOwnedBy(ownerId: string) {
  for (const [key, saver] of savers) {
    if (saver.ownerId !== ownerId) {
      saver.discard();
      savers.delete(key);
    }
  }
}

/** Liga o editor de uma nota ao salvador dela. */
export function useAutosave(ownerId: string, noteId: string, onSaved: (note: Note) => void) {
  const saver = getNoteAutosaver(ownerId, noteId);
  const [status, setStatus] = useState<AutosaveStatus>(saver.status);

  useEffect(() => {
    saver.setOnSaved(onSaved);
  }, [saver, onSaved]);

  useEffect(() => {
    const unsubscribe = saver.subscribe(setStatus);
    return () => {
      unsubscribe();
      // Trocou de nota ou saiu do editor: envia o que faltar na hora.
      void saver.flush();
    };
  }, [saver]);

  const schedule = useCallback((patch: AutosavePatch) => saver.schedule(patch), [saver]);
  const retry = useCallback(() => saver.retryNow(), [saver]);

  return { status, schedule, retry, saver };
}
