import { NoteView } from "@/components/app/note-view";

export default async function NotePage(props: PageProps<"/app/[noteId]">) {
  const { noteId } = await props.params;
  return <NoteView noteId={noteId} />;
}
