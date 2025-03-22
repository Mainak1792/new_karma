import { prisma } from "@/db/prisma";
import { getUser } from "@/app/server";
import { notFound } from "next/navigation";
import NoteEditor from "@/components/NoteEditor";
import { Metadata } from "next";

type Props = {
  params: { noteId: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function NotePage({ params }: Props) {
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