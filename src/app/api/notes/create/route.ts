import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';

export const maxDuration = 60; // Max duration for serverless function

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // First try to create the note directly
    try {
      const note = await prisma.note.create({
        data: {
          text: "",
          authorId: userId,
        },
        select: { id: true, text: true } // Only return minimal data
      });
      
      return NextResponse.json({ 
        success: true, 
        note: note 
      });
    } catch (createError: any) {
      // Check if this is a foreign key constraint error (user doesn't exist)
      if (createError.code === 'P2003') {
        // Try to create the user first
        try {
          const { getUser } = await import('@/app/server');
          const supabaseUser = await getUser();
          
          if (!supabaseUser || supabaseUser.id !== userId) {
            return NextResponse.json({ 
              success: false, 
              error: 'User not authenticated properly' 
            }, { status: 401 });
          }
          
          // Create the user directly
          await prisma.user.create({
            data: {
              id: userId,
              email: supabaseUser.email || '',
            },
          });
          
          // Now try to create the note again
          const note = await prisma.note.create({
            data: {
              text: "",
              authorId: userId,
            },
            select: { id: true, text: true }
          });
          
          return NextResponse.json({ 
            success: true, 
            note: note 
          });
        } catch (userError) {
          console.error('Error creating user and note:', userError);
          return NextResponse.json({ 
            success: false, 
            error: 'Failed to create user and note' 
          }, { status: 500 });
        }
      }
      
      // If it's another type of error, return it
      console.error('Error creating note:', createError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create note' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Unexpected error in note creation API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error' 
    }, { status: 500 });
  }
} 