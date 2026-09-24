# Sinapse

**Suas anotações, conectadas como o seu cérebro.**

Sinapse é um caderno digital para estudantes de ensino técnico e superior. Ele junta o editor em blocos do Notion com os links entre notas do Obsidian: você escreve em blocos, organiza por matéria e liga suas ideias com `[[links]]`. É grátis, não precisa de conta e as notas ficam no seu navegador.

## Prints

> Imagens ainda não adicionadas. Salve os prints em `docs/prints/` e troque os itens abaixo por `![descrição](docs/prints/arquivo.png)`.

| Tela | Arquivo |
| --- | --- |
| Landing page | `docs/prints/landing.png` _(em breve)_ |
| Editor com `[[links]]` e backlinks | `docs/prints/editor.png` _(em breve)_ |
| Busca global (Ctrl+K) | `docs/prints/busca.png` _(em breve)_ |
| Tema escuro no celular | `docs/prints/mobile-escuro.png` _(em breve)_ |

## Recursos

- **Editor em blocos** ([BlockNote](https://www.blocknotejs.org/)): títulos, listas, tarefas, código, tabelas e menu `/` em português.
- **Links entre notas** com `[[` e painel de **backlinks**.
- **Matérias e subpáginas** na barra lateral, com favoritos.
- **Busca global** (`Ctrl/⌘ + K`) por título e conteúdo.
- **Exportar como Markdown** (`.md`).
- **Tema claro/escuro** e layout responsivo.
- **Sem servidor:** tudo fica salvo no IndexedDB do navegador.

## Stack

- [Next.js](https://nextjs.org/) (App Router) + TypeScript (strict)
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) + [lucide-react](https://lucide.dev/)
- [BlockNote](https://www.blocknotejs.org/): editor em blocos
- [Dexie](https://dexie.org/): persistência em IndexedDB
- [next-themes](https://github.com/pacocoursey/next-themes): tema claro/escuro
- Deploy na [Vercel](https://vercel.com/)

## Como rodar localmente

Pré-requisitos: Node.js 20+ e npm.

```bash
git clone <url-do-repositorio> sinapse
cd sinapse
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) para ver a landing page e [http://localhost:3000/app](http://localhost:3000/app) para usar o app.

Outros comandos:

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Sobe o build de produção |
| `npm run lint` | ESLint |

### Variáveis de ambiente (opcional)

| Variável | Uso |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL pública do site, usada nas metatags Open Graph. Na Vercel, o domínio de produção é detectado automaticamente. |

## Estrutura

```
src/
  app/                  rotas (/, /app, /app/[noteId])
  components/landing/   seções da landing page
  components/app/       sidebar, editor, backlinks, busca...
  components/ui/        componentes shadcn/ui
  hooks/                hooks de leitura (useLiveQuery)
  lib/db.ts             schema do Dexie
  lib/notes.ts          CRUD e regras de negócio das notas
```

## Seus dados

As notas ficam **apenas no navegador e no dispositivo** onde foram criadas. Limpar os dados do site apaga as notas, então exporte as importantes em Markdown. Janelas anônimas ou navegadores que bloqueiam o armazenamento mostram um aviso em vez de abrir o app.

## Roadmap

- [x] **v1:** editor em blocos, matérias e subpáginas, `[[links]]` e backlinks, busca, favoritos, exportar Markdown, landing page
- [ ] **v2:** login e sincronização entre dispositivos com banco na nuvem ([Neon](https://neon.tech/) + [Prisma](https://www.prisma.io/))
- [ ] **v3:** flashcards gerados a partir das notas, Pomodoro integrado e visualização em grafo

---

Feito por Enzo.
