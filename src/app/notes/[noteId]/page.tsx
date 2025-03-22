import { prisma } from "@/db/prisma";
import { getUser } from "@/app/server";
import { notFound } from "next/navigation";
import NoteEditor from "@/components/NoteEditor";

export default async function NotePage({
  params,
}: {
  params: { noteId: string };
}) {
  const user = await getUser();
  if (!user) {
    notFound();
  }

  const note = await prisma.note.findUnique({
    where: {
      id: params.noteId,
      authorId: user.id,
    },
  });

  if (!note) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <NoteEditor note={note} />
    </div>
  );
} 