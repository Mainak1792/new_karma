import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error(`User not found with ID: ${userId}`);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the newest note
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('id')
      .eq('author_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (notesError) {
      console.error('Error fetching notes:', notesError);
      return NextResponse.json(
        { error: 'Failed to fetch notes' },
        { status: 500 }
      );
    }

    if (!notes || notes.length === 0) {
      console.log(`No notes found for user: ${userId}`);
      return NextResponse.json({ newestNoteId: null });
    }

    console.log(`Found newest note with ID: ${notes[0].id}`);
    return NextResponse.json({ newestNoteId: notes[0].id });
  } catch (error) {
    console.error('Error fetching newest note:', error);
    return NextResponse.json(
      { error: 'Failed to fetch newest note' },
      { status: 500 }
    );
  }
} 