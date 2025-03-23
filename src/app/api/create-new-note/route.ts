import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      console.error("Create note error: User ID is required");
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

    // Create a new note for the user
    const note = await prisma.note.create({
      data: {
        text: "", // Start with an empty note
        authorId: userId
      }
    });

    console.log("Successfully created new note:", note.id);
    return NextResponse.json({ noteId: note.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating new note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
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