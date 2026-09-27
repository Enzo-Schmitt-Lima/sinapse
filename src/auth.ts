import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// Sessões ficam no banco (padrão quando há adapter). O proxy do Next 16 roda
// em Node.js, então o adapter do Prisma pode ser usado nele sem separar uma
// configuração para o Edge.
// As credenciais vêm de AUTH_GOOGLE_ID/SECRET e AUTH_GITHUB_ID/SECRET.
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google, GitHub],
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
