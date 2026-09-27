import { toNoteSummary } from "@/server/dto";
import { withUserRoute } from "@/server/http";
import { listNotes } from "@/server/notes";

export const dynamic = "force-dynamic";

export function GET() {
  return withUserRoute(async (userId) => (await listNotes(userId)).map(toNoteSummary));
}
