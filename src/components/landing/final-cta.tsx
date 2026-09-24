import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "./reveal";

export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-2xl border bg-card px-6 py-14 text-center shadow-sm sm:px-12 sm:py-20">
            <div
              aria-hidden="true"
              className="absolute -top-24 left-1/2 -z-10 h-64 w-[560px] max-w-full -translate-x-1/2 rounded-full bg-brand/15 blur-3xl"
            />
            <h2 id="cta-title" className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Comece a conectar suas ideias hoje.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
              Abra o Sinapse e crie sua primeira nota em segundos. Sem cadastro, sem instalação.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 bg-brand text-brand-foreground shadow-md shadow-brand/20 hover:bg-brand/90"
            >
              <Link href="/app">
                Abrir o Sinapse
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
