import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Mesmos nomes de src/server/session.ts (lá o módulo é server-only com Prisma).
const SESSION_COOKIE_NAMES = ["authjs.session-token", "__Secure-authjs.session-token"];

// Checagem otimista de sessão. A proteção definitiva fica no servidor
// (src/app/app/layout.tsx e, depois, em cada server action).
export default auth((request) => {
  const isLoggedIn = Boolean(request.auth);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/app") && !isLoggedIn) {
    // Com cookie de sessão, "sem sessão" pode ser o banco fora do ar: o layout
    // de /app decide (tela de conexão ou login) em vez de deslogar aqui.
    const hasSessionCookie = SESSION_COOKIE_NAMES.some((name) => request.cookies.has(name));
    if (hasSessionCookie) return;
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }
  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/app", request.nextUrl));
  }
});

export const config = {
  matcher: ["/app/:path*", "/login"],
};
