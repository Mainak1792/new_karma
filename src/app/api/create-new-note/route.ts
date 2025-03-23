import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Create a new note for the user
    const note = await prisma.note.create({
      data: {
        text: "", // Start with an empty note
        authorId: userId
      }
    });

    return NextResponse.json({ noteId: note.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating new note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
} 