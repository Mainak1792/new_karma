'use client';

import { Button } from "./button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { createNoteAction } from "@/actions/notes";
import { toast } from "sonner";

type Props = {
  userId: string;
};

export default function NewNoteButton({ userId }: Props) {
  const router = useRouter();

  const handleCreateNote = async () => {
    try {
      const { note, errorMessage } = await createNoteAction(userId);
      if (errorMessage) {
        toast.error(errorMessage);
        return;
      }
      if (note) {
        toast.success('New note created');
        router.push(`/notes/${note.id}`);
      }
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    }
  };

  return (
    <Button
      onClick={handleCreateNote}
      variant="ghost"
      className="w-full justify-start gap-2"
    >
      <Plus className="h-4 w-4" />
      New Note
    </Button>
  );
} 