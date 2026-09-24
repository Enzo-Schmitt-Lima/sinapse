import { FileStack, MessageCircle, NotebookPen, type LucideIcon } from "lucide-react";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

const PAINS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: NotebookPen,
    title: "Caderno e Word",
    description: "Ideias presas em páginas e arquivos que não conversam entre si. Achar algo vira garimpo.",
  },
  {
    icon: MessageCircle,
    title: "Fotos no WhatsApp",
    description: "A foto do quadro some entre figurinhas e áudios do grupo da turma.",
  },
  {
    icon: FileStack,
    title: "PDFs soltos",
    description: "Slides e apostilas espalhados pela pasta Downloads, sem ligação com o que você estudou.",
  },
];

export function Problem() {
  return (
    <section aria-labelledby="problema-title" className="border-t bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            id="problema-title"
            eyebrow="O problema"
            title="Suas anotações estão espalhadas"
            description="Cada matéria em um lugar diferente. Na hora da prova, o que você precisa nunca está onde deveria."
          />
        </Reveal>

        <ul className="mt-12 grid gap-4 sm:grid-cols-3">
          {PAINS.map((pain, index) => (
            <Reveal as="li" key={pain.title} delay={index * 80}>
              <div className="h-full rounded-xl border bg-card p-6 shadow-xs">
                <span className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground">
                  <pain.icon className="size-4.5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-medium">{pain.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{pain.description}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
