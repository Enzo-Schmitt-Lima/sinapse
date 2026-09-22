# Sinapse — guia do projeto

## Produto
App web de notas para estudantes. Mistura Notion (editor em blocos, páginas e subpáginas) com Obsidian (links [[ ]] entre notas e backlinks). Público: estudantes de ensino técnico/superior. Todo o texto da interface em português do Brasil.

## Stack
- Next.js (App Router) + TypeScript (strict) + Tailwind CSS + shadcn/ui
- Editor: BlockNote
- Persistência v1: IndexedDB via Dexie (sem backend, sem login)
- Ícones: lucide-react | Tema: next-themes (claro/escuro)
- Deploy: Vercel

## Rotas
- `/` → landing page (marketing, estática)
- `/app` → app de notas (client-side)
- `/app/[noteId]` → nota aberta

## Estrutura de pastas
- `src/app/` rotas
- `src/components/landing/` seções da landing
- `src/components/app/` componentes do app (sidebar, editor, backlinks...)
- `src/components/ui/` componentes shadcn (não editar à mão sem motivo)
- `src/lib/db.ts` schema e instância do Dexie
- `src/lib/notes.ts` funções de CRUD e regras de negócio das notas
- `src/hooks/` hooks reutilizáveis

## Modelo de dados (v1)
Note: { id: string (nanoid), title: string, content: BlockNote JSON, parentId: string | null, folder: string | null, favorite: boolean, links: string[] (ids das notas citadas), createdAt: number, updatedAt: number }

## Regras
- Componentes que usam IndexedDB ou BlockNote são client components ("use client"); o BlockNote deve ser carregado com next/dynamic e ssr: false.
- Acesso ao banco só por `src/lib/notes.ts`; componentes não chamam o Dexie direto (exceto useLiveQuery via hooks em src/hooks).
- Mobile-first e responsivo (testar em 375px).
- Acessibilidade: labels, foco visível, contraste AA, navegação por teclado.
- Não adicionar bibliotecas novas sem perguntar antes.
- Código e nomes de variáveis em inglês; textos da interface em português.
- Ao terminar cada tarefa: rodar `npm run lint` e `npm run build`, corrigir erros e fazer um commit descritivo (Conventional Commits, ex.: "feat: sidebar com pastas").

## Identidade visual
- Estilo limpo e minimalista, referência: Notion / Linear.
- Fonte: Inter (next/font). Fonte de código: JetBrains Mono.
- Cor de destaque: violeta (#7C3AED) usada com moderação; restante em tons neutros.
- Cantos arredondados médios, sombras sutis, bastante espaço em branco.
