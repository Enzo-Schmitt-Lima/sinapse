import { noteIdSchema } from "@/lib/note-schemas";
import { toNoteSummary } from "@/server/dto";
import { withUserRoute } from "@/server/http";
import { NoteNotFoundError, getBacklinks } from "@/server/notes";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: RouteContext<"/api/notes/[id]/backlinks">) {
  const { id } = await context.params;
  return withUserRoute(async (userId) => {
    const noteId = noteIdSchema.safeParse(id);
    if (!noteId.success) throw new NoteNotFoundError();
    return (await getBacklinks(userId, noteId.data)).map(toNoteSummary);
  });
}
