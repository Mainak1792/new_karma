import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';

export const maxDuration = 60; // Max duration for serverless function

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('noteId');
    const userId = searchParams.get('userId');

    if (!noteId || !userId) {
      return NextResponse.json({ error: 'Note ID and User ID are required' }, { status: 400 });
    }

    // Fetch the note with minimal data
    const note = await prisma.note.findUnique({
      where: { 
        id: noteId,
        authorId: userId 
      },
      select: { 
        text: true,
        id: true
      }
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 });
  }
} 