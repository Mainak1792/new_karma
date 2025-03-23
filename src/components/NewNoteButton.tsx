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
      // Check database connection first
      const healthResponse = await fetch('/api/healthcheck');
      if (!healthResponse.ok) {
        console.error('Database connection issue detected');
        alert('Database connection error. Please try again later.');
        setLoading(false);
        return;
      }
      
      // Proceed with note creation
      try {
        const { note, errorMessage } = await createNoteAction(user.id);
        
        if (errorMessage) {
          console.error('Error creating note:', errorMessage);
          alert(`Failed to create note: ${errorMessage}`);
          return;
        }
        
        if (note) {
          router.push(`/?noteId=${note.id}`);
        }
      } catch (createError) {
        console.error('Error in create note action:', createError);
        alert('Failed to create note. Please try again.');
      }
    } catch (error) {
      console.error('Failed to handle note creation:', error);
      alert('An unexpected error occurred. Please try again.');
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
