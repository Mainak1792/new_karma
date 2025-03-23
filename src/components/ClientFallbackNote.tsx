'use client';

import { useEffect, useState } from 'react';
import { createNoteAction } from '@/actions/notes';
import { useRouter } from 'next/navigation';
import { Spinner } from './ui/spinner';

type Props = {
  userId: string | undefined;
};

export default function ClientFallbackNote({ userId }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function createNote() {
      if (!userId) {
        setIsLoading(false);
        setError('User not authenticated');
        return;
      }

      try {
        setIsLoading(true);
        const { note, errorMessage } = await createNoteAction(userId);
        
        if (errorMessage) {
          setError(errorMessage);
          setIsLoading(false);
          return;
        }

        if (note) {
          // Redirect to the newly created note
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

    createNote();
  }, [userId, router]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-muted-foreground">Creating a new note...</p>
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

  return null;
} 