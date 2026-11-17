"use client";

import dynamic from "next/dynamic";

// Só no navegador: a seção lê o IndexedDB da v1 com o Dexie.
const LocalNotesPanel = dynamic(() => import("./local-notes-panel"), {
  ssr: false,
  loading: () => <div aria-hidden="true" className="h-40 animate-pulse rounded-lg border bg-muted/40" />,
});

export function LocalNotesSettings() {
  return <LocalNotesPanel />;
}
