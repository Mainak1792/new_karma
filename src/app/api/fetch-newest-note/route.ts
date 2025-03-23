import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if user exists in the database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.error('User not found in database:', userId);
      return NextResponse.json({ 
        error: 'User not found in database', 
        newestNoteId: null 
      }, { status: 404 });
    }

    // Find the newest note for this user
    const newestNote = await prisma.note.findFirst({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
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