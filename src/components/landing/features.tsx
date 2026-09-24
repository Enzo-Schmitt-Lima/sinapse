import { Blocks, FolderTree, Link2, Moon, Search, WifiOff, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

const Kbd = ({ children }: { children: ReactNode }) => (
  <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[0.8em] text-foreground">
    {children}
  </kbd>
);

const FEATURES: { icon: LucideIcon; title: string; description: ReactNode }[] = [
  {
    icon: Blocks,
    title: "Editor em blocos",
    description: "Títulos, listas, tarefas, código e tabelas. Digite / e escolha o bloco, como no Notion.",
  },
  {
    icon: Link2,
    title: "Links entre notas e backlinks",
    description: (
      <>
        Digite <Kbd>[[</Kbd> para citar outra nota. Cada nota mostra quem aponta para ela.
      </>
    ),
  },
  {
    icon: FolderTree,
    title: "Organização por matéria",
    description: "Uma pasta para cada disciplina e subpáginas dentro das notas, do jeito que você pensa.",
  },
  {
    icon: Search,
    title: "Busca instantânea",
    description: (
      <>
        Aperte <Kbd>Ctrl</Kbd> <Kbd>K</Kbd> e encontre qualquer nota pelo título ou pelo conteúdo.
      </>
    ),
  },
  {
    icon: Moon,
    title: "Tema escuro",
    description: "Claro, escuro ou seguindo o sistema. Confortável para estudar de madrugada.",
  },
  {
    icon: WifiOff,
    title: "Funciona offline",
    description: "Seus dados ficam no seu navegador. Nada de servidor, nada de conta.",
  },
];

export function Features() {
  return (
    <section
      id="recursos"
      aria-labelledby="recursos-title"
      className="scroll-mt-16 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            id="recursos-title"
            eyebrow="Recursos"
            title="Tudo o que você precisa para estudar, em um só lugar"
            description="A liberdade do Notion com as conexões do Obsidian, pensado para a rotina de quem estuda."
          />
        </Reveal>

        <ul className="mt-14 grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <Reveal as="li" key={feature.title} delay={(index % 3) * 80} className="bg-background">
              <div className="group h-full p-6 transition-colors hover:bg-muted/40 sm:p-8">
                <span className="grid size-10 place-items-center rounded-lg bg-brand/10 text-brand-text">
                  <feature.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-medium">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
