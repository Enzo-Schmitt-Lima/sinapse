"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { FilePlus, FileText, Moon, Sun } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { createNote, searchAllNotes, searchNotes, type NoteSearchResult } from "@/lib/notes";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NoteSearchResult[]>([]);
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setQuery("");
  }

  const handleNewNote = useCallback(async () => {
    const note = await createNote();
    setOpen(false);
    setQuery("");
    router.push(`/app/${note.id}`);
  }, [router]);

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
        setOpen((value) => {
          if (value) setQuery("");
          return !value;
        });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNewNote]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      const found = query.trim()
        ? await searchAllNotes(query)
        : (await searchNotes("")).map((note): NoteSearchResult => ({ note }));
      if (!cancelled) setResults(found);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, query]);

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
      <DialogHeader className="sr-only">
        <DialogTitle>Busca do Sinapse</DialogTitle>
        <DialogDescription>Busque notas pelo título ou conteúdo, ou execute uma ação.</DialogDescription>
      </DialogHeader>
      <DialogContent className="overflow-hidden p-0">
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
