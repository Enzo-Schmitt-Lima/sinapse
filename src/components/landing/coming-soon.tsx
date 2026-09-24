import { Layers, RefreshCw, Timer, Waypoints, type LucideIcon } from "lucide-react";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

const UPCOMING: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Layers,
    title: "Flashcards",
    description: "Gere cartões de revisão direto das suas notas.",
  },
  {
    icon: Timer,
    title: "Pomodoro integrado",
    description: "Ciclos de foco e pausa sem sair do caderno.",
  },
  {
    icon: Waypoints,
    title: "Visualização em grafo",
    description: "Veja o mapa das conexões entre as suas ideias.",
  },
  {
    icon: RefreshCw,
    title: "Sincronização",
    description: "Suas notas no celular e no computador.",
  },
];

export function ComingSoon() {
  return (
    <section aria-labelledby="em-breve-title" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            id="em-breve-title"
            eyebrow="Em breve"
            title="O Sinapse está só começando"
            description="Novidades que estão a caminho."
          />
        </Reveal>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {UPCOMING.map((item, index) => (
            <Reveal as="li" key={item.title} delay={index * 80}>
              <div className="h-full rounded-xl border border-dashed p-5">
                <div className="flex items-center justify-between">
                  <item.icon className="size-5 text-muted-foreground" aria-hidden="true" />
                  <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand-text">
                    Em breve
                  </span>
                </div>
                <h3 className="mt-4 font-medium">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
