import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginButtons } from "@/components/app/login-buttons";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Logo, LogoMark } from "@/components/landing/logo";

export const metadata: Metadata = {
  title: "Entrar",
};

// Códigos de erro que o Auth.js coloca em /login?error=...
const ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "Este e-mail já está ligado a outra forma de login. Entre com o provedor que você usou da primeira vez.",
  AccessDenied: "O acesso foi negado. Tente novamente.",
  Configuration: "O login está indisponível no momento. Tente novamente mais tarde.",
};
const DEFAULT_ERROR = "Não foi possível entrar. Tente novamente.";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const session = await auth();
  if (session?.user) redirect("/app");

  const { error } = await searchParams;
  const errorCode = typeof error === "string" ? error : undefined;
  const errorMessage = errorCode ? (ERROR_MESSAGES[errorCode] ?? DEFAULT_ERROR) : null;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center text-center">
            <LogoMark className="size-11 rounded-xl text-lg" />
            <h1 className="mt-5 text-2xl font-semibold tracking-tight">Entrar no Sinapse</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Suas anotações, conectadas e salvas na nuvem.
            </p>
          </div>

          <LoginButtons initialError={errorMessage} />

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Ainda não conhece?{" "}
            <Link
              href="/"
              className="rounded-sm font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              Ver como funciona
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
