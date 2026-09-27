import type { NextRequest } from "next/server";
import { searchQuerySchema } from "@/lib/note-schemas";
import { toSearchResults } from "@/server/dto";
import { withUserRoute } from "@/server/http";
import { searchNotes } from "@/server/notes";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  return withUserRoute(async (userId) => {
    const query = searchQuerySchema.parse(request.nextUrl.searchParams.get("q") ?? "");
    return toSearchResults(await searchNotes(userId, query));
  });
}
