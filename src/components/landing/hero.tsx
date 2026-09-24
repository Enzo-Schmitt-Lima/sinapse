import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppMockup } from "./app-mockup";
import { Reveal } from "./reveal";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      {/* Fundo: grade sutil + brilho violeta */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_40%,transparent_100%)] opacity-60"
      />
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -z-10 h-[420px] w-[720px] max-w-full -translate-x-1/2 rounded-full bg-brand/15 blur-3xl"
      />

      <div className="mx-auto max-w-6xl px-4 pt-32 pb-16 sm:px-6 sm:pt-40 sm:pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
            Grátis, sem cadastro
          </p>
          <h1
            id="hero-title"
            className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl"
          >
            Suas anotações, <span className="text-brand-text">conectadas</span> como o seu cérebro.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
            Um caderno digital para estudantes: escreva em blocos, organize por matéria e ligue suas
            ideias com{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em] text-foreground">
              [[links]]
            </code>
            . Grátis e direto no navegador.
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button
              asChild
              size="lg"
              className="bg-brand text-brand-foreground shadow-md shadow-brand/20 hover:bg-brand/90"
            >
              <Link href="/app">
                Começar agora
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#recursos">Ver recursos</a>
            </Button>
          </div>
        </div>

        <Reveal delay={150} className="mx-auto mt-14 max-w-5xl sm:mt-20">
          <AppMockup />
        </Reveal>
      </div>
    </section>
  );
}
