"use client";

import { useCallback, useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { FilePlus, FileText, Moon, Sun } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { fetchJson, noteKeys } from "@/lib/api-client";
import type { NoteSearchResult } from "@/lib/note-types";
import { useNoteMutations } from "@/hooks/useNoteMutations";
import { useCurrentUserId } from "./query-provider";

const SEARCH_DELAY_MS = 200;

/** Valor que só muda depois de `delay` ms sem novas alterações. */
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);
  return debounced;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange: setOpen }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const userId = useCurrentUserId();
  const { createNote } = useNoteMutations();
  const debouncedQuery = useDebouncedValue(query.trim(), SEARCH_DELAY_MS);

  // Busca no servidor (só notas do usuário). keepPreviousData mantém a lista
  // anterior enquanto a nova chega, para não piscar a cada tecla.
  const { data: results = [] } = useQuery({
    queryKey: noteKeys.search(userId, debouncedQuery),
    queryFn: async () =>
      (await fetchJson<NoteSearchResult[]>(`/api/notes/search?q=${encodeURIComponent(debouncedQuery)}`)) ?? [],
    enabled: open,
    placeholderData: keepPreviousData,
    staleTime: 10_000,
  });
  const { resolvedTheme, setTheme } = useTheme();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setQuery("");
  }

  const handleNewNote = useCallback(async () => {
    setOpen(false);
    setQuery("");
    const note = await createNote();
    if (note) router.push(`/app/${note.id}`);
  }, [createNote, router, setOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      const withModifier = event.metaKey || event.ctrlKey;

      if (withModifier && event.altKey && key === "n") {
        event.preventDefault();
        void handleNewNote();
        return;
      }

      if (withModifier && key === "k") {
        event.preventDefault();
        if (open) setQuery("");
        setOpen(!open);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNewNote, open, setOpen]);

  function handleSelectNote(noteId: string) {
    handleOpenChange(false);
    router.push(`/app/${noteId}`);
  }

  function handleToggleTheme() {
    handleOpenChange(false);
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Busca do Sinapse</DialogTitle>
          <DialogDescription>Busque notas pelo título ou conteúdo, ou execute uma ação.</DialogDescription>
        </DialogHeader>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar notas ou executar uma ação..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            <CommandGroup heading="Ações">
              <CommandItem value="acao-nova-nota" onSelect={handleNewNote}>
                <FilePlus className="h-4 w-4" />
                Nova nota
              </CommandItem>
              <CommandItem value="acao-alternar-tema" onSelect={handleToggleTheme}>
                {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                Alternar tema
              </CommandItem>
            </CommandGroup>
            {results.length > 0 && (
              <CommandGroup heading={query.trim() ? "Notas" : "Notas recentes"}>
                {results.map(({ note, snippet }) => (
                  <CommandItem key={note.id} value={note.id} onSelect={() => handleSelectNote(note.id)}>
                    <FileText className="h-4 w-4 shrink-0" />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate">{note.title || "Sem título"}</span>
                      {snippet && <span className="truncate text-xs text-muted-foreground">{snippet}</span>}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
