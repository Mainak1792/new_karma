'use client';

import { useEffect, useState } from 'react';
import { createNoteAction } from '@/actions/notes';
import { useRouter } from 'next/navigation';
import { Spinner } from './ui/spinner';
import NoteTextInput from './NoteTextInput';
import { prisma } from '@/db/prisma';

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
        setIsLoading(true);
        
        // Load note directly from client side with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
        
        try {
          const response = await fetch(`/api/notes?noteId=${noteId}&userId=${userId}`, {
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
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
        } catch (fetchError: any) {
          // If timeout occurred or other network issue
          if (fetchError.name === 'AbortError') {
            console.error('Fetch request timed out');
            createNewNote(); // Try creating a new note instead
          } else {
            throw fetchError;
          }
        }
      } catch (err) {
        console.error('Error loading note:', err);
        setError('Failed to load note');
        setIsLoading(false);
      }
    }

    async function createNewNote() {
      try {
        console.log('Creating new note for user:', userId);
        
        // Try using the API endpoint first
        try {
          console.log('Attempting to create note via API for user:', userId);
          const response = await fetch('/api/notes/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
          });
          
          const data = await response.json();
          
          if (!response.ok || !data.success) {
            console.error('API note creation failed:', data.error);
            throw new Error(data.error || 'Failed to create note via API');
          }
          
          console.log('Successfully created note via API:', data.note.id);
          router.push(`/?noteId=${data.note.id}`);
          return;
        } catch (apiError) {
          console.error('Error creating note via API, falling back to server action:', apiError);
          // Fall back to server action
        }
        
        // Fallback: use server action
        const { note, errorMessage } = await createNoteAction(userId);
        
        if (errorMessage) {
          console.error('Error from createNoteAction:', errorMessage);
          setError(errorMessage);
          setIsLoading(false);
          return;
        }

        if (note) {
          console.log('Note created successfully via server action:', note.id);
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