"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

export function useFavorites() {
  return useLiveQuery(async () => {
    // IndexedDB não indexa valores boolean, então filtramos em vez de usar where("favorite").
    const notes = await db.notes.filter((note) => note.favorite).sortBy("updatedAt");
    return notes.reverse();
  }, []);
}
