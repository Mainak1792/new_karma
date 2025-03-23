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

export async function GET(request: NextRequest) {
  try {
    console.log("Fetch newest note request received");
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      console.error("Fetch note error: User ID is required");
      return NextResponse.json(
        { error: "User ID is required" },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    console.log("Fetching newest note for user:", userId);

    // Test database connection first
    try {
      await prisma.$connect();
      console.log("Database connected successfully");
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        { error: "Database connection failed" },
        { 
          status: 500,
          headers: corsHeaders
        }
      );
    }

    // Find the newest note for the user
    const newestNote = await prisma.note.findFirst({
      where: {
        authorId: userId
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    if (!newestNote) {
      console.log("No notes found for user:", userId);
      return NextResponse.json(
        { newestNoteId: null },
        { headers: corsHeaders }
      );
    }

    console.log("Found newest note:", newestNote.id);
    return NextResponse.json(
      { newestNoteId: newestNote.id },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error fetching newest note:", error);
    return NextResponse.json(
      { error: "Failed to fetch newest note" },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  } finally {
    try {
      await prisma.$disconnect();
      console.log("Database disconnected successfully");
    } catch (e) {
      console.error("Error disconnecting from database:", e);
    }
  }
} 