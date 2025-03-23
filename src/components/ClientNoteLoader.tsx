'use client';

import { useEffect, useState } from 'react';
import { createNoteAction } from '@/actions/notes';
import { useRouter } from 'next/navigation';
import { Spinner } from './ui/spinner';
import NoteTextInput from './NoteTextInput';

type Props = {
  noteId: string;
  userId: string;
};

export default function ClientNoteLoader({ noteId, userId }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function loadOrFetchNotes() {
      try {
        setIsLoading(true);
        
        // If a specific noteId is provided, fetch that note
        if (noteId) {
          console.log('Fetching specific note:', noteId);
          const response = await fetch(`/api/notes?noteId=${noteId}&userId=${userId}`);
          
          if (response.ok) {
            const data = await response.json();
            setNoteText(data.text || '');
            setIsLoading(false);
            return;
          } else if (response.status !== 404) {
            // If there's an error other than 404, show it
            const error = await response.json();
            throw new Error(error.error || 'Failed to load note');
          }
          // If 404, continue to fetch user's notes
        }
        
        // Fetch the user's notes
        console.log('Fetching user notes');
        const response = await fetch(`/api/notes/user/${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch notes');
        }
        
        const data = await response.json();
        const notes = data.notes || [];
        
        if (notes.length > 0) {
          // If user has notes, redirect to the most recent one
          const mostRecentNote = notes[0]; // Assuming notes are sorted by date desc
          console.log('Found existing note, redirecting to:', mostRecentNote.id);
          router.push(`/?noteId=${mostRecentNote.id}`);
        } else {
          // If no notes found, create one
          console.log('No notes found, creating initial note');
          createNewNote();
        }
      } catch (err) {
        console.error('Error loading notes:', err);
        setError('Failed to load notes');
        setIsLoading(false);
      }
    }

    async function createNewNote() {
      try {
        const { note, errorMessage } = await createNoteAction(userId);
        
        if (errorMessage) {
          console.error('Error creating note:', errorMessage);
          setError(errorMessage);
          setIsLoading(false);
          return;
        }

        if (note) {
          console.log('Note created successfully:', note.id);
          router.push(`/?noteId=${note.id}`);
        } else {
          setError('Failed to create note');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error creating note:', err);
        setError('An unexpected error occurred');
        setIsLoading(false);
      }
    }

    loadOrFetchNotes();
  }, [noteId, userId, router]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-muted-foreground">
            {noteId ? 'Loading note...' : 'Fetching your notes...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-red-500">Error: {error}</p>
          <button 
            className="rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <NoteTextInput noteId={noteId} startingNoteText={noteText} />;
} 