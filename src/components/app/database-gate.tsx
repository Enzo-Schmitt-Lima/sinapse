"use client";

import { useEffect, useState, type ReactNode } from "react";
import { openDatabase } from "@/lib/notes";
import { ErrorScreen } from "./error-screen";

type GateState = { status: "opening" } | { status: "ready" } | { status: "error"; error: unknown };

/** Só renderiza o app depois que o IndexedDB abriu; se falhar, explica o motivo. */
export function DatabaseGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GateState>({ status: "opening" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    openDatabase().then(
      () => !cancelled && setState({ status: "ready" }),
      (error: unknown) => !cancelled && setState({ status: "error", error }),
    );
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  if (state.status === "error") {
    return (
      <ErrorScreen
        className="min-h-dvh"
        error={state.error}
        onRetry={() => {
          setState({ status: "opening" });
          setAttempt((value) => value + 1);
        }}
      />
    );
  }

  if (state.status === "opening") {
    return <div className="h-dvh bg-background" aria-busy="true" aria-label="Carregando o Sinapse" />;
  }

  return children;
}
