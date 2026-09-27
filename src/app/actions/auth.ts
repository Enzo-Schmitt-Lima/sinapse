"use server";

import { z } from "zod";
import { signIn, signOut } from "@/auth";

const providerSchema = z.enum(["google", "github"]);

export async function signInWithProvider(provider: string) {
  await signIn(providerSchema.parse(provider), { redirectTo: "/app" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
