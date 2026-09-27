import "server-only";

import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Com sessões no banco, o Auth.js devolve "sem sessão" também quando não
// consegue falar com o banco (ex.: rede ou DNS fora do ar). Para não tratar
// isso como logout, quem tem cookie de sessão e não foi reconhecido passa por
// uma checagem rápida do banco.

export const SESSION_COOKIE_NAMES = ["authjs.session-token", "__Secure-authjs.session-token"];

export type SessionCheck =
  | {
      status: "ok";
      userId: string;
      user: { name: string | null; email: string | null; image: string | null };
    }
  | { status: "signed_out" }
  | { status: "unavailable" };

const PROBE_TIMEOUT_MS = 5000;

export async function isDatabaseReachable(): Promise<boolean> {
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), PROBE_TIMEOUT_MS)),
    ]);
    return true;
  } catch {
    return false;
  }
}

export async function getSessionUser(): Promise<SessionCheck> {
  const session = await auth();
  const userId = session?.user?.id;
  if (userId) {
    const { name = null, email = null, image = null } = session.user ?? {};
    return { status: "ok", userId, user: { name, email, image } };
  }

  const store = await cookies();
  const hasSessionCookie = SESSION_COOKIE_NAMES.some((name) => store.has(name));
  if (hasSessionCookie && !(await isDatabaseReachable())) return { status: "unavailable" };
  return { status: "signed_out" };
}
