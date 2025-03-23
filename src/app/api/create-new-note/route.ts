import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';

export const maxDuration = 60; // Set max duration to 60 seconds for paid plans

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Don't check if user exists - just try to create the note
    // This reduces the number of database operations
    try {
      // Create a new note for this user directly
      const note = await prisma.note.create({
        data: {
          text: "",
          authorId: userId,
        },
      });

      return NextResponse.json({ noteId: note.id });
    } catch (createError: any) {
      // If this fails due to foreign key constraint (user doesn't exist)
      // Then try to get the user from auth and create them
      if (createError.code === 'P2003') {
        try {
          // Get user email from Supabase
          const supabase = await import('@/app/auth').then(mod => mod.createClient());
          const { data: { user: supabaseUser } } = await supabase.auth.getUser();
          
          if (!supabaseUser || supabaseUser.id !== userId) {
            return NextResponse.json({ error: 'User authentication failed' }, { status: 401 });
          }

          // Create user in the database
          const user = await prisma.user.create({
            data: {
              id: userId,
              email: supabaseUser.email!,
            },
          });

          // Now create the note
          const note = await prisma.note.create({
            data: {
              text: "",
              authorId: userId,
            },
          });

          return NextResponse.json({ noteId: note.id });
        } catch (userError) {
          console.error('Error creating user in database from API route:', userError);
          return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
        }
      } else {
        throw createError; // Rethrow if it's a different error
      }
    }
  } catch (error) {
    console.error('Error creating new note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 