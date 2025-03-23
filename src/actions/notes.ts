"use server";

import { getUser } from "@/app/server";
import { prisma } from "@/db/prisma";
import { handleError } from "@/lib/utils";
import openai from "@/openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { Note } from "@prisma/client";

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

export async function createNoteAction(userId: string) {
  try {
    console.log('Starting note creation for user:', userId);
    
    // Check if the user exists in the database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.error('Attempted to create a note for a nonexistent user:', userId);
      
      try {
        // Try to get user from Supabase
        const { getUser } = await import('@/app/server');
        const supabaseUser = await getUser();
        
        if (supabaseUser && supabaseUser.id === userId && supabaseUser.email) {
          console.log('User found in Supabase but not in database. Creating user:', {
            id: supabaseUser.id,
            email: supabaseUser.email
          });
          
          // Create user in database
          const { createUserInDatabase } = await import('@/actions/user');
          await createUserInDatabase(userId, supabaseUser.email);
        } else {
          return { note: null, errorMessage: 'User not found in authentication system' };
        }
      } catch (authError) {
        console.error('Error getting/creating user:', authError);
        return { note: null, errorMessage: 'Failed to authenticate user' };
      }
    }

    // Now create the note
    const note = await prisma.note.create({
      data: {
        text: "",
        authorId: userId,
      },
    });
    
    console.log('Successfully created note:', note.id);
    return { note, errorMessage: null };
  } catch (error) {
    console.error('Error creating note:', error);
    return { note: null, errorMessage: 'Failed to create note' };
  }
}

export async function updateNoteAction(noteId: string, text: string) {
  try {
    const user = await getUser();
    if (!user) {
      return { note: null, errorMessage: 'You must be logged in to update a note' };
    }

    // First check if the note exists and belongs to the user
    const existingNote = await prisma.note.findUnique({
      where: {
        id: noteId,
        authorId: user.id,
      },
    });

    if (!existingNote) {
      return { note: null, errorMessage: 'Note not found or you do not have permission to edit it' };
    }

    // Update the note
    const note = await prisma.note.update({
      where: { 
        id: noteId,
        authorId: user.id, // Ensure user owns the note
      },
      data: { text },
    });

    return { note, errorMessage: null };
  } catch (error) {
    console.error('Error updating note:', error);
    return { note: null, errorMessage: 'Failed to update note' };
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
