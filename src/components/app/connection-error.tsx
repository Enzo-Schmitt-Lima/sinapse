"use client";

import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Banco inacessível (rede/DNS): a sessão continua válida, só falta conexão. */
export function ConnectionError() {
  return (
    <div role="alert" className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background p-8 text-center">
      <WifiOff className="size-10 text-muted-foreground" aria-hidden="true" />
      <div className="space-y-1">
        <h1 className="text-lg font-medium">Não foi possível conectar ao servidor</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Verifique sua conexão com a internet. Suas notas estão salvas; é só tentar de novo em instantes.
        </p>
      </div>
      <Button onClick={() => window.location.reload()}>Tentar de novo</Button>
    </div>
  );
}
