"use client";

import { useState } from "react";
import { Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const SHORTCUTS: { keys: string[]; description: string }[] = [
  { keys: ["Ctrl/⌘", "K"], description: "Busca global" },
  { keys: ["Ctrl/⌘", "Alt", "N"], description: "Nova nota" },
];

export function ShortcutsDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Atalhos de teclado">
          <Keyboard className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atalhos</DialogTitle>
          <DialogDescription>Atalhos de teclado disponíveis no Sinapse.</DialogDescription>
        </DialogHeader>
        <ul className="flex flex-col gap-3">
          {SHORTCUTS.map((shortcut) => (
            <li key={shortcut.description} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{shortcut.description}</span>
              <span className="flex items-center gap-1">
                {shortcut.keys.map((key, index) => (
                  <span key={key} className="flex items-center gap-1">
                    {index > 0 && <span className="text-xs text-muted-foreground">+</span>}
                    <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">{key}</kbd>
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
