import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { ConnectionError } from "@/components/app/connection-error";
import { getSessionUser } from "@/server/session";

export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const check = await getSessionUser();
  if (check.status === "unavailable") return <ConnectionError />;
  if (check.status === "signed_out") redirect("/login");

  return <AppShell user={{ id: check.userId, ...check.user }}>{children}</AppShell>;
}
