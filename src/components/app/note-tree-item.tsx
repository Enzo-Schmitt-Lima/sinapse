"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  FolderInput,
  MoreHorizontal,
  Plus,
  Star,
  StarOff,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Note } from "@/lib/db";
import { useChildNotes } from "@/hooks/useChildNotes";
import { useFolders } from "@/hooks/useFolders";
import { createNote, deleteNote, toggleFavorite, updateNote } from "@/lib/notes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { NewFolderDialog } from "./new-folder-dialog";

interface NoteTreeItemProps {
  note: Note;
  activeId?: string;
  depth?: number;
  onNavigate?: () => void;
}

export function NoteTreeItem({ note, activeId, depth = 0, onNavigate }: NoteTreeItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const router = useRouter();
  const children = useChildNotes(note.id);
  const folders = useFolders();
  const hasChildren = (children?.length ?? 0) > 0;
  const isActive = note.id === activeId;
  const title = note.title || "Sem título";

  async function handleNewSubpage() {
    const child = await createNote({ parentId: note.id });
    setExpanded(true);
    router.push(`/app/${child.id}`);
    onNavigate?.();
  }

  async function handleDelete() {
    const deletedIds = await deleteNote(note.id);
    setDeleteOpen(false);
    if (activeId && deletedIds.includes(activeId)) router.push("/app");
  }

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1 rounded-md pr-1 text-sm",
          isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50",
        )}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
      >
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring md:size-6",
            !hasChildren && "invisible",
          )}
          tabIndex={hasChildren ? 0 : -1}
          aria-label={expanded ? `Recolher subpáginas de ${title}` : `Expandir subpáginas de ${title}`}
          aria-expanded={hasChildren ? expanded : undefined}
        >
          {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>

        <Link
          href={`/app/${note.id}`}
          onClick={onNavigate}
          className="flex min-w-0 flex-1 items-center gap-1.5 rounded-sm py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring md:py-1.5"
          aria-current={isActive ? "page" : undefined}
        >
          <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="truncate">{title}</span>
          {note.favorite && (
            <Star className="h-3 w-3 shrink-0 fill-current text-amber-500" aria-label="Favorita" />
          )}
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 md:size-6 [@media(hover:hover)]:opacity-0"
              aria-label={`Mais opções de ${title}`}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={handleNewSubpage}>
              <Plus /> Nova subpágina
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => toggleFavorite(note.id)}>
              {note.favorite ? <StarOff /> : <Star />}
              {note.favorite ? "Remover dos favoritos" : "Favoritar"}
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <FolderInput /> Mover para matéria
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onSelect={() => updateNote(note.id, { folder: null })}>
                  Sem matéria
                </DropdownMenuItem>
                {folders?.map((folder) => (
                  <DropdownMenuItem key={folder} onSelect={() => updateNote(note.id, { folder })}>
                    {folder}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setNewFolderOpen(true)}>Nova matéria...</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
              <Trash2 /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {expanded && hasChildren && (
        <div>
          {children!.map((child) => (
            <NoteTreeItem key={child.id} note={child} activeId={activeId} depth={depth + 1} onNavigate={onNavigate} />
          ))}
        </div>
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir &quot;{title}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação exclui a nota e todas as suas subpáginas. Não é possível desfazer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <NewFolderDialog
        open={newFolderOpen}
        onOpenChange={setNewFolderOpen}
        onCreated={(folder) => updateNote(note.id, { folder })}
      />
    </div>
  );
}
