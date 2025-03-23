import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';

export const maxDuration = 60; // Set max duration to 60 seconds for paid plans

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Skip checking if the user exists to reduce database operations
    // Directly find the newest note for this user
    const newestNote = await prisma.note.findFirst({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true }, // Only select the ID field for efficiency
    });

    return NextResponse.json({ 
      newestNoteId: newestNote?.id || null 
    });
  } catch (error) {
    console.error('Error fetching newest note:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      newestNoteId: null 
    }, { status: 500 });
  }
} 