import { FolderTree, Link2, NotebookPen, type LucideIcon } from "lucide-react";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

const STEPS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: FolderTree,
    title: "Crie uma matéria",
    description: "Uma pasta para Cálculo, outra para Física… Sua estrutura, do seu jeito.",
  },
  {
    icon: NotebookPen,
    title: "Escreva suas notas",
    description: "Anote a aula em blocos, com títulos, listas, código e tabelas. Tudo salvo automaticamente.",
  },
  {
    icon: Link2,
    title: "Conecte com [[ ]]",
    description: "Ligue um conceito ao outro e revise seguindo o caminho das ideias, não a ordem das aulas.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      aria-labelledby="como-funciona-title"
      className="scroll-mt-16 border-t bg-muted/30 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            id="como-funciona-title"
            eyebrow="Como funciona"
            title="Três passos para organizar o semestre"
          />
        </Reveal>

        <div className="relative mt-14">
          {/* Linha que liga os passos no desktop */}
          <div
            aria-hidden="true"
            className="absolute top-5 right-[16.66%] left-[16.66%] hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block"
          />
          <ol className="grid gap-8 md:grid-cols-3 md:gap-6">
            {STEPS.map((step, index) => (
              <Reveal as="li" key={step.title} delay={index * 100} className="relative text-center">
                <span className="relative mx-auto grid size-10 place-items-center rounded-full border bg-background font-mono text-sm font-medium shadow-xs">
                  {index + 1}
                </span>
                <h3 className="mt-5 inline-flex items-center gap-2 font-medium">
                  <step.icon className="size-4 text-brand-text" aria-hidden="true" />
                  {step.title}
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">{step.description}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
