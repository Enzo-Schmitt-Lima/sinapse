import { withUserRoute } from "@/server/http";
import { listFolders } from "@/server/notes";

export const dynamic = "force-dynamic";

export function GET() {
  return withUserRoute((userId) => listFolders(userId));
}
