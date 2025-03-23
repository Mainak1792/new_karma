"use client";

import { User } from "@supabase/supabase-js";
import { Button } from "./ui/button";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createNoteAction } from "@/actions/notes";

type Props = {
  user: User | null;
};

function NewNoteButton({ user }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClickNewNoteButton = async () => {
    if (!user) {
      router.push("/login");
    } else {
      setLoading(true);
      
      try {
        // Use the actual user ID from Supabase
        const { note, errorMessage } = await createNoteAction(user.id);
        
        if (errorMessage) {
          console.error('Error creating note:', errorMessage);
          // Show error to user if needed
        } else if (note) {
          router.push(`/?noteId=${note.id}`);
        }
      } catch (error) {
        console.error('Failed to create note:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Button
      onClick={handleClickNewNoteButton}
      variant="outline"
      className="gap-2 px-4"
      disabled={loading}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
      New Note
    </Button>
  );
}

export default NewNoteButton;
