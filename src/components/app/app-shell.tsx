"use client";

import { useState, type ReactNode } from "react";
import { Menu, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SidebarContent } from "./sidebar-content";
import { CommandPalette } from "./command-palette";
import { DatabaseGate } from "./database-gate";

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  function openSearch() {
    setMobileOpen(false);
    setSearchOpen(true);
  }

  return (
    <DatabaseGate>
      <div className="flex h-dvh overflow-hidden bg-background">
        <aside
          aria-label="Barra lateral"
          inert={collapsed}
          className={cn(
            "hidden shrink-0 flex-col border-r md:flex",
            collapsed ? "md:w-0 md:overflow-hidden md:border-r-0" : "md:w-72",
          )}
        >
          <SidebarContent onOpenSearch={openSearch} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3 md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Abrir menu">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Menu do Sinapse</SheetTitle>
                </SheetHeader>
                <SidebarContent onNavigate={() => setMobileOpen(false)} onOpenSearch={openSearch} />
              </SheetContent>
            </Sheet>
            <span className="font-semibold">Sinapse</span>
            <Button variant="ghost" size="icon" className="ml-auto" aria-label="Buscar notas" onClick={openSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </header>

          <div className="hidden h-12 shrink-0 items-center border-b px-3 md:flex">
            <Button
              variant="ghost"
              size="icon"
              aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((value) => !value)}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          </div>

          <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
        </div>

        <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
      </div>
    </DatabaseGate>
  );
}
