import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Checagem otimista de sessão. A proteção definitiva fica no servidor
// (src/app/app/layout.tsx e, depois, em cada server action).
export default auth((request) => {
  const isLoggedIn = Boolean(request.auth);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/app") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }
  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/app", request.nextUrl));
  }
});

export const config = {
  matcher: ["/app/:path*", "/login"],
};
