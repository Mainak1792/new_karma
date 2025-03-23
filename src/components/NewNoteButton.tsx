"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { createNote } from "@/actions/notes";

export default function NewNoteButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleCreateNote = async () => {
    startTransition(async () => {
      try {
        const { error, noteId } = await createNote();
        
        if (error) {
          toast.error(error);
          return;
        }
        
        if (noteId) {
          toast.success("New note created!");
          router.push(`/?noteId=${noteId}`);
        }
      } catch (err) {
        console.error("Error creating note:", err);
        toast.error("Failed to create note");
      }
    });
  };

  return (
    <Button 
      onClick={handleCreateNote} 
      disabled={isPending} 
      variant="outline" 
      size="icon"
      className="flex h-8 w-8 rounded-full"
    >
      <Plus className="h-4 w-4" />
      <span className="sr-only">New note</span>
    </Button>
  );
}
