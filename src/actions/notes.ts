"use server";

import { getUser } from "@/app/server";
import { prisma } from "@/db/prisma";
import { handleError } from "@/lib/utils";
import openai from "@/openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { Note } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getNotesAction(userId: string) {
  try {
    const notes = await prisma.note.findMany({
      where: {
        authorId: userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    return { notes, errorMessage: null };
  } catch (error) {
    console.error('Error fetching notes:', error);
    return { notes: [], errorMessage: 'Failed to fetch notes' };
  }
}

export async function createNote() {
  try {
    const user = await getUser();
    
    if (!user) {
      console.error("Failed to create note: No authenticated user");
      return { error: "You must be logged in to create notes", noteId: null };
    }
    
    console.log("Creating note for user:", user.id);
    
    const note = await prisma.note.create({
      data: {
        text: "", // Start with an empty note
        authorId: user.id
      }
    });
    
    console.log("Note created successfully:", note.id);
    revalidatePath("/");
    
    return { 
      error: null,
      noteId: note.id 
    };
  } catch (error) {
    console.error("Error creating note:", error);
    return { 
      error: "Failed to create note. Please try again later.", 
      noteId: null 
    };
  }
}

export async function updateNote(noteId: string, text: string) {
  try {
    const user = await getUser();
    
    if (!user) {
      return { success: false, error: "You must be logged in to update notes" };
    }
    
    // Verify the note belongs to the user
    const note = await prisma.note.findUnique({
      where: {
        id: noteId,
        authorId: user.id
      }
    });
    
    if (!note) {
      return { success: false, error: "Note not found or you don't have permission to update it" };
    }
    
    await prisma.note.update({
      where: {
        id: noteId
      },
      data: {
        text,
        updatedAt: new Date()
      }
    });
    
    revalidatePath("/");
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error updating note:", error);
    return { 
      success: false, 
      error: "Failed to update note. Please try again later." 
    };
  }
}

export const deleteNoteAction = async (noteId: string) => {
  try {
    const user = await getUser();
    if (!user) throw new Error("You must be logged in to delete a note");

    await prisma.note.delete({
      where: { id: noteId, authorId: user.id },
    });

    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const askAIAboutNotesAction = async (
  newQuestions: string[],
  responses: string[],
) => {
  const user = await getUser();
  if (!user) throw new Error("You must be logged in to ask AI questions");

  const notes = await prisma.note.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
    select: { text: true, createdAt: true, updatedAt: true },
  });

  if (notes.length === 0) {
    return "You don't have any notes yet.";
  }

  const formattedNotes = notes
    .map((note) =>
      `
      Text: ${note.text}
      Created at: ${note.createdAt}
      Last updated: ${note.updatedAt}
      `.trim(),
    )
    .join("\n");

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "developer",
      content: `
          You are a helpful assistant that answers questions about a user's notes. 
          Assume all questions are related to the user's notes. 
          Make sure that your answers are not too verbose and you speak succinctly. 
          Your responses MUST be formatted in clean, valid HTML with proper structure. 
          Use tags like <p>, <strong>, <em>, <ul>, <ol>, <li>, <h1> to <h6>, and <br> when appropriate. 
          Do NOT wrap the entire response in a single <p> tag unless it's a single paragraph. 
          Avoid inline styles, JavaScript, or custom attributes.
          
          Rendered like this in JSX:
          <p dangerouslySetInnerHTML={{ __html: YOUR_RESPONSE }} />
    
          Here are the user's notes:
          ${formattedNotes}
          `,
    },
  ];

  for (let i = 0; i < newQuestions.length; i++) {
    messages.push({ role: "user", content: newQuestions[i] });
    if (responses.length > i) {
      messages.push({ role: "assistant", content: responses[i] });
    }
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
  });

  return completion.choices[0].message.content || "A problem has occurred";
};
