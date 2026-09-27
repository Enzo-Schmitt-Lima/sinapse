import "server-only";

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getSessionUser } from "./session";
import { NoteError, NoteNotFoundError } from "./notes";

// Respostas das rotas GET de notas. Regras (CLAUDE.md, "Segurança"):
// - toda resposta, inclusive de erro, sai com Cache-Control: private, no-store;
// - o userId vem só da sessão;
// - "não existe" e "é de outra pessoa" dão exatamente o mesmo 404.

const NO_STORE_HEADERS = { "Cache-Control": "private, no-store" };
export const NOT_FOUND_BODY = { error: new NoteNotFoundError().message };

export function jsonNoStore(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: NO_STORE_HEADERS });
}

export async function withUserRoute(run: (userId: string) => Promise<unknown>): Promise<NextResponse> {
  const session = await getSessionUser();
  if (session.status === "unavailable") {
    // Banco inacessível: 503 (o cliente tenta de novo), não 401 (que manda para o login).
    return jsonNoStore({ error: "Sem conexão com o servidor. Tente novamente em instantes." }, 503);
  }
  if (session.status === "signed_out") {
    return jsonNoStore({ error: "Sua sessão expirou. Entre novamente." }, 401);
  }
  const { userId } = session;

  try {
    return jsonNoStore(await run(userId));
  } catch (error) {
    if (error instanceof NoteNotFoundError) return jsonNoStore(NOT_FOUND_BODY, 404);
    if (error instanceof ZodError) {
      return jsonNoStore({ error: error.issues[0]?.message ?? "Dados inválidos." }, 400);
    }
    if (error instanceof NoteError) return jsonNoStore({ error: error.message }, 400);
    console.error("[notes route]", error);
    return jsonNoStore({ error: "Algo deu errado. Tente novamente." }, 500);
  }
}
