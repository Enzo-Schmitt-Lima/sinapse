import "dotenv/config";
import { defineConfig } from "prisma/config";

// Configuração do CLI do Prisma. As migrations usam a conexão direta (sem
// pooler); o app usa DATABASE_URL em src/lib/prisma.ts.
// process.env em vez de env(): o `prisma generate` do postinstall precisa
// funcionar sem as variáveis (ex.: build na Vercel antes de configurá-las).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env.DIRECT_URL },
});
