"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { listFolders } from "@/lib/notes";

export function useFolders() {
  return useLiveQuery(() => listFolders(), []);
}
