import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const newestNote = await prisma.note.findFirst({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true }
    });

    return NextResponse.json({ newestNoteId: newestNote?.id || null });
  } catch (error) {
    console.error('Error fetching newest note:', error);
    return NextResponse.json({ error: 'Failed to fetch newest note' }, { status: 500 });
  }
} 