import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Add CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      console.error('No userId provided in fetch-newest-note request');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // First verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.error(`User not found with ID: ${userId}`);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the newest note
    const newestNote = await prisma.note.findFirst({
      where: { authorId: userId },
      orderBy: { updatedAt: 'desc' }
    });

    if (!newestNote) {
      console.log(`No notes found for user: ${userId}`);
      return NextResponse.json({ newestNoteId: null });
    }

    console.log(`Found newest note with ID: ${newestNote.id}`);
    return NextResponse.json({ newestNoteId: newestNote.id });
  } catch (error) {
    console.error('Error fetching newest note:', error);
    return NextResponse.json(
      { error: 'Failed to fetch newest note' },
      { status: 500 }
    );
  }
} 