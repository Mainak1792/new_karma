import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const note = await prisma.note.create({
      data: {
        text: '',
        authorId: userId,
      },
      select: { id: true }
    });

    return NextResponse.json({ noteId: note.id });
  } catch (error) {
    console.error('Error creating new note:', error);
    return NextResponse.json({ error: 'Failed to create new note' }, { status: 500 });
  }
} 