"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FolderPlus, Plus, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Note } from "@/lib/db";
import { useChildNotes } from "@/hooks/useChildNotes";
import { useFavorites } from "@/hooks/useFavorites";
import { createNote } from "@/lib/notes";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { NoteTreeItem } from "./note-tree-item";
import { NewFolderDialog } from "./new-folder-dialog";
import { ThemeToggle } from "./theme-toggle";

interface SidebarContentProps {
  onNavigate?: () => void;
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  const params = useParams<{ noteId?: string }>();
  const activeId = typeof params.noteId === "string" ? params.noteId : undefined;
  const router = useRouter();
  const rootNotes = useChildNotes(null);
  const favorites = useFavorites();
  const [newFolderOpen, setNewFolderOpen] = useState(false);

  const { folderGroups, unfiled } = useMemo(() => {
    const groups = new Map<string, Note[]>();
    const rest: Note[] = [];
    for (const note of rootNotes ?? []) {
      if (note.folder) {
        const list = groups.get(note.folder) ?? [];
        list.push(note);
        groups.set(note.folder, list);
      } else {
        rest.push(note);
      }
    }
    return {
      folderGroups: [...groups.entries()].sort(([a], [b]) => a.localeCompare(b, "pt-BR")),
      unfiled: rest,
    };
  }, [rootNotes]);

  async function handleNewNote() {
    const note = await createNote();
    router.push(`/app/${note.id}`);
    onNavigate?.();
  }

  async function handleCreateFolder(folder: string) {
    const note = await createNote({ folder });
    router.push(`/app/${note.id}`);
    onNavigate?.();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 p-3">
        <span className="text-lg font-semibold tracking-tight">Sinapse</span>
        <Button size="icon" variant="ghost" onClick={handleNewNote} aria-label="Nova nota">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        {favorites && favorites.length > 0 && (
          <div className="mb-4">
            <p className="px-2 py-1 text-xs font-medium uppercase text-muted-foreground">Favoritos</p>
            <div>
              {favorites.map((note) => (
                <Link
                  key={note.id}
                  href={`/app/${note.id}`}
                  onClick={onNavigate}
                  aria-current={note.id === activeId ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-1.5 truncate rounded-md px-2 py-1.5 text-sm",
                    note.id === activeId ? "bg-accent text-accent-foreground" : "hover:bg-accent/50",
                  )}
                >
                  <Star className="h-3.5 w-3.5 shrink-0 fill-current text-amber-500" />
                  <span className="truncate">{note.title || "Sem título"}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <div className="flex items-center justify-between px-2 py-1">
            <p className="text-xs font-medium uppercase text-muted-foreground">Matérias</p>
            <Button
              size="icon"
              variant="ghost"
              className="h-5 w-5"
              onClick={() => setNewFolderOpen(true)}
              aria-label="Nova matéria"
            >
              <FolderPlus className="h-3.5 w-3.5" />
            </Button>
          </div>
          {folderGroups.length === 0 ? (
            <p className="px-2 py-1 text-xs text-muted-foreground">Nenhuma matéria ainda.</p>
          ) : (
            folderGroups.map(([folder, notes]) => (
              <div key={folder} className="mb-1">
                <p className="truncate px-2 py-1 text-xs font-medium text-foreground/80">{folder}</p>
                {notes.map((note) => (
                  <NoteTreeItem key={note.id} note={note} activeId={activeId} onNavigate={onNavigate} />
                ))}
              </div>
            ))
          )}
        </div>

        <Separator className="my-2" />

        <div className="mb-2">
          <p className="px-2 py-1 text-xs font-medium uppercase text-muted-foreground">Páginas</p>
          {unfiled.length === 0 ? (
            <p className="px-2 py-1 text-xs text-muted-foreground">Nenhuma página ainda.</p>
          ) : (
            unfiled.map((note) => (
              <NoteTreeItem key={note.id} note={note} activeId={activeId} onNavigate={onNavigate} />
            ))
          )}
        </div>
      </ScrollArea>

      <Separator />
      <div className="flex items-center justify-between p-3">
        <span className="text-xs text-muted-foreground">Tema</span>
        <ThemeToggle />
      </div>

      <NewFolderDialog open={newFolderOpen} onOpenChange={setNewFolderOpen} onCreated={handleCreateFolder} />
    </div>
  );
}
