import { ChevronRight, FileText, FolderOpen, Search, Star } from "lucide-react";

const TREE = [
  { label: "Cálculo I", open: true, notes: ["Limites", "Derivadas", "Regra da cadeia"] },
  { label: "Física I", open: false, notes: [] },
  { label: "Algoritmos", open: false, notes: [] },
];

/** Prévia estática do app, feita em HTML/CSS (sem imagem). */
export function AppMockup() {
  return (
    <div
      role="img"
      aria-label="Prévia do Sinapse: barra lateral com matérias e a nota “Derivadas” aberta, com um link para a nota “Limites”."
      className="relative overflow-hidden rounded-xl border bg-card text-left shadow-2xl shadow-brand/10 ring-1 ring-black/5 dark:ring-white/5"
    >
      {/* Barra da janela */}
      <div aria-hidden="true" className="flex h-9 items-center gap-1.5 border-b bg-muted/50 px-3">
        <span className="size-2.5 rounded-full bg-foreground/15" />
        <span className="size-2.5 rounded-full bg-foreground/15" />
        <span className="size-2.5 rounded-full bg-foreground/15" />
        <span className="mx-auto hidden rounded-md bg-background/80 px-3 py-0.5 text-[11px] text-muted-foreground sm:block">
          Sinapse
        </span>
      </div>

      <div aria-hidden="true" className="flex min-h-[320px] sm:min-h-[380px]">
        {/* Sidebar */}
        <div className="hidden w-52 shrink-0 border-r bg-sidebar p-3 text-[13px] sm:block">
          <div className="flex items-center gap-2 rounded-md border bg-background px-2 py-1.5 text-muted-foreground">
            <Search className="size-3.5" />
            <span>Buscar</span>
            <kbd className="ml-auto font-mono text-[10px]">Ctrl K</kbd>
          </div>

          <p className="mt-4 px-2 text-[11px] font-medium text-muted-foreground uppercase">Favoritos</p>
          <div className="mt-1 flex items-center gap-2 rounded-md px-2 py-1">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            Resumo P1
          </div>

          <p className="mt-4 px-2 text-[11px] font-medium text-muted-foreground uppercase">Matérias</p>
          <ul className="mt-1 space-y-0.5">
            {TREE.map((folder) => (
              <li key={folder.label}>
                <div className="flex items-center gap-1.5 rounded-md px-2 py-1">
                  <ChevronRight
                    className={`size-3 text-muted-foreground ${folder.open ? "rotate-90" : ""}`}
                  />
                  <FolderOpen className="size-3.5 text-muted-foreground" />
                  {folder.label}
                </div>
                {folder.notes.length > 0 && (
                  <ul className="ml-5 space-y-0.5">
                    {folder.notes.map((note) => (
                      <li
                        key={note}
                        className={`flex items-center gap-2 rounded-md px-2 py-1 ${
                          note === "Derivadas" ? "bg-sidebar-accent font-medium" : "text-muted-foreground"
                        }`}
                      >
                        <FileText className="size-3.5" />
                        {note}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Nota */}
        <div className="flex-1 px-5 py-5 sm:px-10 sm:py-8">
          <p className="text-xs text-muted-foreground">Cálculo I / Derivadas</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Derivadas</p>

          <div className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/85">
            <p>
              A derivada mede a taxa de variação instantânea de uma função. Ela é definida a partir
              do conceito de{" "}
              <span className="inline-flex items-center gap-1 rounded-md bg-brand/10 px-1.5 py-0.5 align-baseline text-[13px] font-medium text-brand-text">
                <FileText className="size-3" />
                Limites
              </span>
              .
            </p>
            <p className="rounded-md bg-muted px-3 py-2 font-mono text-[13px]">
              f′(x) = lim<sub>h→0</sub> [f(x+h) − f(x)] / h
            </p>
            <ul className="list-disc space-y-1 pl-5 text-foreground/80">
              <li>Regra do produto</li>
              <li>
                Composição de funções, ver{" "}
                <span className="inline-flex items-center gap-1 rounded-md bg-brand/10 px-1.5 py-0.5 align-baseline text-[13px] font-medium text-brand-text">
                  <FileText className="size-3" />
                  Regra da cadeia
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-medium text-muted-foreground">Backlinks · 2</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-md border px-2 py-1">Resumo P1</span>
              <span className="rounded-md border px-2 py-1">Lista 3 — exercícios</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
