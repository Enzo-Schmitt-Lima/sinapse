# Sinapse — guia do projeto

## Produto
App web de notas para estudantes. Mistura Notion (editor em blocos, páginas e subpáginas) com Obsidian (links [[ ]] entre notas e backlinks). Público: estudantes de ensino técnico/superior. Todo o texto da interface em português do Brasil.

## Stack
- Next.js (App Router) + TypeScript (strict) + Tailwind CSS + shadcn/ui
- Editor: BlockNote
- Persistência v2: PostgreSQL (Neon) + Prisma ORM
- Autenticação: Auth.js (NextAuth), provedores Google e GitHub, adapter do Prisma
- Dexie (IndexedDB) apenas como fonte para importar as notas locais da v1
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
- `prisma/schema.prisma` schema do banco (Prisma)
- `src/auth.ts` configuração do Auth.js
- `src/lib/prisma.ts` cliente Prisma (singleton)
- `src/server/notes.ts` funções de acesso às notas, todas recebendo o userId da sessão
- `src/app/actions/` server actions

## Modelo de dados (v1)
Note: { id: string (nanoid), title: string, content: BlockNote JSON, parentId: string | null, folder: string | null, favorite: boolean, links: string[] (ids das notas citadas), createdAt: number, updatedAt: number }

## Regras
- Componentes que usam IndexedDB ou BlockNote são client components ("use client"); o BlockNote deve ser carregado com next/dynamic e ssr: false.
- Acesso ao banco só por `src/lib/notes.ts`; componentes não chamam o Dexie direto (exceto useLiveQuery via hooks em src/hooks).
- Mobile-first e responsivo (testar em 375px).
- Acessibilidade: labels, foco visível, contraste AA, navegação por teclado.
- Não adicionar bibliotecas novas sem perguntar antes. Exceção: zod pode ser instalado. Para cache/sincronização no cliente, propor uma opção antes de instalar.
- Código e nomes de variáveis em inglês; textos da interface em português.
- Ao terminar cada tarefa: rodar `npm run lint` e `npm run build`, corrigir erros e fazer um commit descritivo (Conventional Commits, ex.: "feat: sidebar com pastas").

## Segurança (obrigatória)
- Toda leitura e escrita de notas acontece no servidor (Server Actions ou Route Handlers), nunca direto do navegador para o banco.
- O userId vem SEMPRE da sessão obtida no servidor (`auth()`). Nunca aceitar userId vindo do cliente, de formulário, de URL ou de parâmetro.
- Toda consulta de nota filtra por id E userId. Buscar uma nota só por id é proibido.
- Se a nota não existe ou pertence a outra pessoa, a resposta é a mesma: "não encontrada" (404). Nunca revelar que a nota existe.
- Toda entrada do usuário é validada com zod antes de tocar no banco (tipos, tamanho do título, tamanho do conteúdo).
- Links [[ ]] só podem apontar para notas do próprio usuário; ids de outras pessoas são descartados ao salvar.
- Segredos só em variáveis de ambiente; o `.env` nunca vai para o git.

## Identidade visual
- Estilo limpo e minimalista, referência: Notion / Linear.
- Fonte: Inter (next/font). Fonte de código: JetBrains Mono.
- Cor de destaque: violeta (#7C3AED) usada com moderação; restante em tons neutros.
- Cantos arredondados médios, sombras sutis, bastante espaço em branco.
