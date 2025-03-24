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

export async function POST(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    
    if (!userId) {
      console.error("No userId provided in create-new-note request");
      return NextResponse.json(
        { error: "User ID is required" },
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
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create new note
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .insert([
        {
          text: '',
          author_id: userId
        }
      ])
      .select()
      .single();

    if (noteError) {
      console.error('Error creating note:', noteError);
      return NextResponse.json(
        { error: 'Failed to create note' },
        { status: 500 }
      );
    }

    console.log(`Successfully created new note with ID: ${note.id}`);
    return NextResponse.json({ noteId: note.id });
  } catch (error) {
    console.error('Error creating new note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
} 