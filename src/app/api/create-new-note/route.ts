import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { createUserInDatabase } from '@/actions/user';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if user exists in the database
    let user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // If user doesn't exist, try to create them
    if (!user) {
      try {
        // Get user email from Supabase
        const supabase = await import('@/app/auth').then(mod => mod.createClient());
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        
        if (!supabaseUser || supabaseUser.id !== userId) {
          return NextResponse.json({ error: 'User authentication failed' }, { status: 401 });
        }

        // Create user in the database
        console.log('Creating user in database from API route:', { userId, email: supabaseUser.email });
        await createUserInDatabase(userId, supabaseUser.email!);
        
        // Verify user was created
        user = await prisma.user.findUnique({
          where: { id: userId }
        });
        
        if (!user) {
          return NextResponse.json({ error: 'Failed to create user in database' }, { status: 500 });
        }
      } catch (error) {
        console.error('Error creating user in database from API route:', error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
    }

    // Create a new note for this user
    const note = await prisma.note.create({
      data: {
        text: "",
        authorId: userId,
      },
    });

    return NextResponse.json({ noteId: note.id });
  } catch (error) {
    console.error('Error creating new note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 