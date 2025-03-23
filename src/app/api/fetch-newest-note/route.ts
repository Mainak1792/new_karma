import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
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
      return NextResponse.json({ newestNoteId: null });
    }

    return NextResponse.json({ newestNoteId: newestNote.id });
  } catch (error) {
    console.error("Error fetching newest note:", error);
    return NextResponse.json(
      { error: "Failed to fetch newest note" },
      { status: 500 }
    );
  }
} 