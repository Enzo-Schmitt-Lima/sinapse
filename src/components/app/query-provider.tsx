"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider, focusManager } from "@tanstack/react-query";
import { discardSaversNotOwnedBy, flushAllSavers, hasUnsavedChanges } from "@/hooks/useAutosave";

// O TanStack Query 5 só considera a troca de aba (visibilitychange). Com duas
// janelas ou dois navegadores lado a lado, as duas continuam "visíveis"; por
// isso também contamos foco/saída de foco da janela para recarregar os dados.
if (typeof window !== "undefined") {
  focusManager.setEventListener((setFocused) => {
    const onVisibility = () => setFocused(document.visibilityState !== "hidden");
    const onFocus = () => setFocused(true);
    const onBlur = () => setFocused(false);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  });
}

const CurrentUserIdContext = createContext<string | null>(null);

/** Id do usuário da sessão (vindo do servidor). Usado nas chaves do cache. */
export function useCurrentUserId(): string {
  const userId = useContext(CurrentUserIdContext);
  if (!userId) throw new Error("useCurrentUserId precisa estar dentro de QueryProvider");
  return userId;
}

export function QueryProvider({ userId, children }: { userId: string; children: ReactNode }) {
  // Um QueryClient por aba. refetchOnWindowFocus "always" (mesmo dentro do
  // staleTime) sincroniza duas abas ou dois navegadores ao voltar o foco;
  // mutations não repetem (o autosave repete).
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 2, refetchOnWindowFocus: "always" },
          mutations: { retry: 0 },
        },
      }),
  );

  // Pendências de salvamento de outra sessão nunca são enviadas.
  useEffect(() => {
    discardSaversNotOwnedBy(userId);
  }, [userId]);

  // Não perder texto: salva ao esconder a aba e pede confirmação ao fechar
  // se ainda houver algo pendente.
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "hidden") void flushAllSavers();
    }
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!hasUnsavedChanges()) return;
      void flushAllSavers();
      event.preventDefault();
    }
    function handleOnline() {
      void flushAllSavers();
    }
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("online", handleOnline);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <CurrentUserIdContext.Provider value={userId}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </CurrentUserIdContext.Provider>
  );
}
