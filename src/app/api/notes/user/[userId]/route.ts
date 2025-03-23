import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';

export const maxDuration = 60; // Max duration for serverless function

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if user exists in the database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch all notes for the user, sorted by most recent first
    const notes = await prisma.note.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        text: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({ 
      notes
    });
  } catch (error) {
    console.error('Error fetching user notes:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch notes', 
      notes: [] 
    }, { status: 500 });
  }
} 