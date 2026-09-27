"use client";

import { useState } from "react";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown, LogOut } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { discardAllSavers, flushAllSavers } from "@/hooks/useAutosave";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface SessionUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

function initials(user: SessionUser) {
  const source = user.name ?? user.email ?? "?";
  const parts = source.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "")).toUpperCase() || "?";
}

function Avatar({ user }: { user: SessionUser }) {
  if (user.image) {
    return <Image src={user.image} alt="" width={28} height={28} className="size-7 shrink-0 rounded-full" />;
  }
  return (
    <span
      aria-hidden="true"
      className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium text-muted-foreground"
    >
      {initials(user)}
    </span>
  );
}

const FLUSH_TIMEOUT_MS = 3000;

export function UserMenu({ user }: { user: SessionUser }) {
  const displayName = user.name ?? user.email ?? "Conta";
  const queryClient = useQueryClient();
  const [signingOut, setSigningOut] = useState(false);

  // Nada da sessão pode sobrar para a próxima pessoa no mesmo navegador:
  // tenta salvar o que está pendente (ainda é desta sessão), descarta o resto,
  // limpa o cache e recarrega a página do zero.
  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    await Promise.race([flushAllSavers(), new Promise((resolve) => setTimeout(resolve, FLUSH_TIMEOUT_MS))]);
    discardAllSavers();
    queryClient.clear();
    try {
      await signOutAction();
    } finally {
      // Navegação completa de propósito: descarta toda a memória da aba.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Conta de ${displayName}`}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm outline-none hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-accent/50"
      >
        <Avatar user={user} />
        <span className="min-w-0 flex-1 truncate font-medium">{displayName}</span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium">{displayName}</p>
          {user.email && user.email !== displayName && (
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" disabled={signingOut} onSelect={() => void handleSignOut()}>
          <LogOut aria-hidden="true" />
          {signingOut ? "Saindo…" : "Sair"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
