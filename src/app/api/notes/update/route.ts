import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';

export const maxDuration = 60; // Max duration for serverless function

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { noteId, text, userId } = body;

    if (!noteId || !userId) {
      return NextResponse.json({ error: 'Note ID and User ID are required' }, { status: 400 });
    }

    // Update the note with minimal processing
    try {
      const note = await prisma.note.update({
        where: { 
          id: noteId,
          authorId: userId 
        },
        data: { text },
        select: { id: true } // Only return the ID to minimize data transfer
      });
      
      return NextResponse.json({ success: true, noteId: note.id });
    } catch (updateError: any) {
      // Handle foreign key constraints (note doesn't exist or doesn't belong to user)
      if (updateError.code === 'P2025') {
        return NextResponse.json({ error: 'Note not found or you do not have permission to edit it' }, { status: 404 });
      }
      throw updateError;
    }
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
} 