"use client";

import { User } from "@supabase/supabase-js";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
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
        const { note, errorMessage } = await createNoteAction(user.id);
        
        if (note) {
          router.push(`/?noteId=${note.id}&toastType=newNote`);
        } else if (errorMessage) {
          console.error("Failed to create note:", errorMessage);
          // Could add toast notification here
        }
      } catch (error) {
        console.error("Error creating note:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Button
      onClick={handleClickNewNoteButton}
      variant="secondary"
      className="w-24"
      disabled={loading}
    >
      {loading ? <Loader2 className="animate-spin" /> : "New Note"}
    </Button>
  );
}

export default NewNoteButton;
