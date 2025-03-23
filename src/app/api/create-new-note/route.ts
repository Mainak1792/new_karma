import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

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
    console.log("Create new note request received");
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      console.error("Create note error: User ID is required");
      return NextResponse.json(
        { error: "User ID is required" },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    console.log("Creating new note for user:", userId);

    // Create a new note for the user
    const note = await db.note.create({
      data: {
        text: "", // Start with an empty note
        authorId: userId
      }
    });

    console.log("Successfully created new note:", note.id);
    return NextResponse.json(
      { noteId: note.id },
      { 
        status: 201,
        headers: corsHeaders
      }
    );
  } catch (error) {
    console.error("Error creating new note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
} 