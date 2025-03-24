import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

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
      console.error("Create note error: User ID is required");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // First verify user exists
    try {
      // Try to verify/create user first
      const verifyResponse = await fetch(`${request.nextUrl.origin}/api/verify-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          email: '', // This will be updated when we get the user from Supabase
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Failed to verify user');
      }

      const { user } = await verifyResponse.json();
      if (!user) {
        throw new Error('User verification failed');
      }

      // Create a new note for the verified user
      const note = await prisma.note.create({
        data: {
          text: "",
          authorId: userId,
        },
      });

      console.log("Successfully created new note:", note.id);
      return NextResponse.json({ noteId: note.id }, { status: 201 });
    } catch (error: any) {
      console.error("Error creating note:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create note" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in create-new-note:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
} 