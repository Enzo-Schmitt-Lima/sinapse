import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

const QUESTIONS = [
  {
    question: "É grátis?",
    answer: "Sim. O Sinapse é gratuito e todos os recursos atuais estão liberados, sem plano pago.",
  },
  {
    question: "Preciso criar conta?",
    answer: "Não. É só abrir o app e começar a escrever. Sem e-mail, sem senha.",
  },
  {
    question: "Onde ficam meus dados?",
    answer:
      "No seu próprio navegador, salvos localmente no dispositivo. Nada é enviado para um servidor. Por isso, se você limpar os dados do navegador, as notas são apagadas; exporte as mais importantes de vez em quando.",
  },
  {
    question: "Funciona no celular?",
    answer:
      "Sim, a interface foi feita para telas pequenas também. Por enquanto, cada dispositivo guarda as próprias notas; a sincronização entre dispositivos está a caminho.",
  },
  {
    question: "Posso exportar minhas notas?",
    answer:
      "Sim. Qualquer nota pode ser exportada como Markdown (.md), um formato aberto que funciona no Obsidian, no Notion e em vários outros apps.",
  },
];

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-16 border-t bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading id="faq-title" eyebrow="FAQ" title="Perguntas frequentes" />
        </Reveal>

        <Reveal delay={100} className="mt-10">
          <Accordion type="single" collapsible className="rounded-xl border bg-card px-5 shadow-xs">
            {QUESTIONS.map((item, index) => (
              <AccordionItem key={item.question} value={`item-${index}`}>
                <AccordionTrigger className="text-base hover:no-underline">{item.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
