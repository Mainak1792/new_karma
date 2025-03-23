// import { getUser } from "@/auth/server";
import AskAIButton from "@/components/AskAIButton";
import NewNoteButton from "@/components/NewNoteButton";
import NoteTextInput from "@/components/NoteTextInput";
import HomeToast from "@/components/HomeToast";
import { prisma } from "@/db/prisma";
import { getUser } from "./server";
import ClientFallbackNote from "@/components/ClientFallbackNote";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function HomePage({ searchParams }: Props) {
  const noteIdParam = (await searchParams).noteId;
  const user = await getUser();

  const noteId = Array.isArray(noteIdParam)
    ? noteIdParam![0]
    : noteIdParam || "";

  let note = null;
  
  if (noteId) {
    note = await prisma.note.findUnique({
      where: { id: noteId, authorId: user?.id },
    });
  }

  // If no note is found or no noteId was provided, we'll handle creation on the client side
  const showClientFallback = !note && user;

  return (
    <div className="flex h-full flex-col items-center gap-4">
      <div className="flex w-full max-w-4xl justify-end gap-2">
        <AskAIButton user={user} />
        <NewNoteButton user={user} />
      </div>

      {showClientFallback ? (
        <ClientFallbackNote userId={user?.id} />
      ) : (
        <NoteTextInput noteId={noteId} startingNoteText={note?.text || ""} />
      )}

      <HomeToast />
    </div>
  );
}

export default HomePage;
