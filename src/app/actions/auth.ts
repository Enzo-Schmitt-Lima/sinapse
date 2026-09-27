"use server";

import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { signIn, signOut } from "@/auth";

const providerSchema = z.enum(["google", "github"]);

export interface SignInState {
  error: string | null;
}

// Usada com useActionState na página de login. O redirect para o provedor é
// um erro interno do Next (unstable_rethrow o deixa passar); qualquer outra
// falha (ex.: banco ou rede fora do ar) vira mensagem na própria página.
export async function signInWithProvider(_previous: SignInState, formData: FormData): Promise<SignInState> {
  const provider = providerSchema.safeParse(formData.get("provider"));
  if (!provider.success) return { error: "Forma de login inválida." };

  try {
    await signIn(provider.data, { redirectTo: "/app" });
  } catch (error) {
    unstable_rethrow(error);
    console.error("[login]", error);
    return { error: "Não foi possível conectar ao servidor. Verifique sua internet e tente de novo." };
  }
  return { error: null };
}

// Sem redirecionar no servidor: o cliente limpa o cache e as pendências antes
// e depois faz uma navegação completa (ver user-menu.tsx).
export async function signOutAction() {
  await signOut({ redirect: false });
}
