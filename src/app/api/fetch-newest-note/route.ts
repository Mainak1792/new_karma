import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      console.error("Fetch note error: User ID is required");
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Test database connection first
    try {
      await prisma.$connect();
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
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
      return NextResponse.json({ newestNoteId: null });
    }

    console.log("Found newest note:", newestNote.id);
    return NextResponse.json({ newestNoteId: newestNote.id });
  } catch (error) {
    console.error("Error fetching newest note:", error);
    return NextResponse.json(
      { error: "Failed to fetch newest note" },
      { status: 500 }
    );
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      console.error("Error disconnecting from database:", e);
    }
  }
} 