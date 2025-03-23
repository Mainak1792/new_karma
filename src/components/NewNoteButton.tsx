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
      return;
    }
    
    setLoading(true);
    
    try {
      // First, check if the user already has notes
      const response = await fetch(`/api/notes/user/${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.notes && data.notes.length > 0) {
          // If user has existing notes, create a new blank one
          const { note, errorMessage } = await createNoteAction(user.id);
          
          if (errorMessage) {
            console.error('Error creating note:', errorMessage);
            return;
          }
          
          if (note) {
            router.push(`/?noteId=${note.id}`);
          }
        } else {
          // If no notes exist, create the first one
          const { note, errorMessage } = await createNoteAction(user.id);
          
          if (errorMessage) {
            console.error('Error creating note:', errorMessage);
            return;
          }
          
          if (note) {
            router.push(`/?noteId=${note.id}`);
          }
        }
      } else {
        // If API call fails, fall back to direct note creation
        const { note, errorMessage } = await createNoteAction(user.id);
        
        if (errorMessage) {
          console.error('Error creating note:', errorMessage);
          return;
        }
        
        if (note) {
          router.push(`/?noteId=${note.id}`);
        }
      }
    } catch (error) {
      console.error('Failed to handle note creation:', error);
    } finally {
      setLoading(false);
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
