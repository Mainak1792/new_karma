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
    async function loadOrCreateNote() {
      if (!noteId) {
        // Create a new note
        createNewNote();
        return;
      }
      
      try {
        // Load note directly from client side
        const response = await fetch(`/api/notes?noteId=${noteId}&userId=${userId}`);
        
        if (!response.ok) {
          // If note not found, create a new one
          if (response.status === 404) {
            createNewNote();
            return;
          }
          
          throw new Error('Failed to load note');
        }
        
        const data = await response.json();
        setNoteText(data.text || '');
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading note:', err);
        setError('Failed to load note');
        setIsLoading(false);
      }
    }

    async function createNewNote() {
      try {
        const { note, errorMessage } = await createNoteAction(userId);
        
        if (errorMessage) {
          setError(errorMessage);
          setIsLoading(false);
          return;
        }

        if (note) {
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

    loadOrCreateNote();
  }, [noteId, userId, router]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-muted-foreground">
            {noteId ? 'Loading note...' : 'Creating a new note...'}
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