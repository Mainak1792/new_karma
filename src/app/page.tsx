// import { getUser } from "@/auth/server";
import AskAIButton from "@/components/AskAIButton";
import NewNoteButton from "@/components/NewNoteButton";
import NoteTextInput from "@/components/NoteTextInput";
import HomeToast from "@/components/HomeToast";
import { getUser } from "./server";
import ClientNoteLoader from "@/components/ClientNoteLoader";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

async function HomePage({ searchParams }: Props) {
  const noteIdParam = (await searchParams).noteId;
  const user = await getUser();

  const noteId = Array.isArray(noteIdParam)
    ? noteIdParam![0]
    : noteIdParam || "";

  return (
    <div className="flex h-full flex-col items-center gap-4">
      <div className="flex w-full max-w-4xl justify-end gap-2">
        <AskAIButton user={user} />
        <NewNoteButton user={user} />
      </div>

      {user ? (
        <ClientNoteLoader noteId={noteId} userId={user.id} />
      ) : (
        <div className="flex h-[80vh] w-full items-center justify-center">
          <p className="text-muted-foreground">Please sign in to view or create notes.</p>
        </div>
      )}

      <HomeToast />
    </div>
  );
}

export default HomePage;
