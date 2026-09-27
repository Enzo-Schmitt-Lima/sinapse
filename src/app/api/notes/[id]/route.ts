import { noteIdSchema } from "@/lib/note-schemas";
import { toNote } from "@/server/dto";
import { withUserRoute } from "@/server/http";
import { NoteNotFoundError, getNote } from "@/server/notes";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: RouteContext<"/api/notes/[id]">) {
  const { id } = await context.params;
  return withUserRoute(async (userId) => {
    // Id malformado recebe o mesmo 404 de uma nota inexistente.
    const noteId = noteIdSchema.safeParse(id);
    if (!noteId.success) throw new NoteNotFoundError();
    return toNote(await getNote(userId, noteId.data));
  });
}
