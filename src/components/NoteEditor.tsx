'use client';

import { useEffect, useState } from 'react';
import { Textarea } from './ui/textarea';
import { updateNoteAction } from '@/actions/notes';
import { Note } from '@prisma/client';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type Props = {
  note: Note;
  onUpdate?: (note: Note) => void;
};

export default function NoteEditor({ note, onUpdate }: Props) {
  const [text, setText] = useState(note.text);
  const [isSaving, setIsSaving] = useState(false);
  const debouncedText = useDebounce(text, 1000); // Auto-save after 1 second of no changes
  const router = useRouter();

  const saveNote = async () => {
    if (text !== note.text && !isSaving) {
      setIsSaving(true);
      try {
        const { note: updatedNote, errorMessage } = await updateNoteAction(note.id, text);
        if (errorMessage) {
          console.error('Error saving note:', errorMessage);
          toast.error(errorMessage);
          if (errorMessage.includes('not found')) {
            // If note doesn't exist, redirect to home
            router.push('/');
          }
          return;
        }
        if (updatedNote && onUpdate) {
          onUpdate(updatedNote);
          toast.success('Note saved');
        }
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Handle Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault(); // Prevent browser's save dialog
        saveNote();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [text, note.id, note.text, onUpdate]);

  // Auto-save on debounced text change
  useEffect(() => {
    if (debouncedText !== note.text) {
      saveNote();
    }
  }, [debouncedText, note.id, note.text, onUpdate]);

  return (
    <div className="relative">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[500px] resize-none border-none focus-visible:ring-0"
        placeholder="Start writing your note... (Press Ctrl+S to save)"
      />
      <div className="absolute bottom-4 right-4 text-sm text-muted-foreground">
        {isSaving ? 'Saving...' : 'Press Ctrl+S to save'}
      </div>
    </div>
  );
} 