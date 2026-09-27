"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

// A landing é estática; a sessão é consultada no navegador para não tornar a
// página dinâmica. Enquanto carrega, mostra "Abrir o app", que também serve
// para quem não entrou (o /app redireciona para o login).
export function HeaderAuthButton() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    getSession()
      .then((session) => {
        if (active) setLoggedIn(Boolean(session?.user));
      })
      .catch(() => {
        if (active) setLoggedIn(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loggedIn === false) {
    return (
      <Button asChild size="sm" className="bg-brand text-brand-foreground hover:bg-brand/90">
        <Link href="/login">Entrar</Link>
      </Button>
    );
  }

  return (
    <Button asChild size="sm" className="bg-brand text-brand-foreground hover:bg-brand/90">
      <Link href="/app">
        Abrir o app
        <ArrowRight aria-hidden="true" />
      </Link>
    </Button>
  );
}
