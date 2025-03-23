"use client";

import { useSearchParams } from "next/navigation";
import { Textarea } from "./ui/textarea";
import { ChangeEvent, useEffect, useState } from "react";
import useNote from "@/hooks/useNote";
import { useUser } from '@/hooks/useUser';

type Props = {
  noteId: string;
  startingNoteText: string;
};

let updateTimeout: NodeJS.Timeout;

function NoteTextInput({ noteId, startingNoteText }: Props) {
  const noteIdParam = useSearchParams().get("noteId") || "";
  const { noteText, setNoteText } = useNote();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => {
    if (noteIdParam === noteId) {
      setNoteText(startingNoteText);
    }
  }, [startingNoteText, noteIdParam, noteId, setNoteText]);

  const handleUpdateNote = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNoteText(text);
    setSaveError(null);

    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(async () => {
      if (!noteId || !user?.id) return;
      
      try {
        setIsSaving(true);
        
        // Use the API endpoint instead of the server action
        const response = await fetch('/api/notes/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            noteId,
            text,
            userId: user.id
          }),
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to save note');
        }
        
        setSaveError(null);
      } catch (error) {
        console.error('Error saving note:', error);
        setSaveError('Failed to save');
      } finally {
        setIsSaving(false);
      }
    }, 750);
  };

  return (
    <div className="relative w-full max-w-4xl flex-1">
      <Textarea
        value={noteText}
        onChange={handleUpdateNote}
        placeholder="Start writing..."
        className="h-full w-full resize-none border-0 bg-background focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      {isSaving && (
        <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
          Saving...
        </div>
      )}
      {saveError && (
        <div className="absolute bottom-4 right-4 text-xs text-destructive">
          {saveError}
        </div>
      )}
    </div>
  );
}

export default NoteTextInput;
