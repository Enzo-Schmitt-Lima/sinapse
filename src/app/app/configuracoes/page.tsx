import type { Metadata } from "next";
import { LocalNotesSettings } from "@/components/app/local-notes-settings";

export const metadata: Metadata = { title: "Configurações" };

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 px-4 py-8 md:px-8 md:py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
      <LocalNotesSettings />
    </div>
  );
}
