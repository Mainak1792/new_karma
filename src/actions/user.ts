"use server";

import { createClient } from "@/app/auth";
import { handleError } from "@/lib/utils";
import { prisma } from "@/db/prisma";

export const createUserInDatabase = async (userId: string, email: string) => {
  try {
    console.log('Starting user creation in database:', { 
      userId, 
      email,
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      directUrl: process.env.DIRECT_URL ? 'Set' : 'Not set'
    });
    
    // Test database connection with a simple query
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('Database connection verified before user creation');
    } catch (connError: any) {
      console.error('Database connection error:', {
        error: connError.message,
        code: connError.code,
        meta: connError.meta,
        timestamp: new Date().toISOString()
      });
      return { errorMessage: 'Failed to connect to database' };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (existingUser) {
      console.log('User already exists in database:', existingUser);
      return { errorMessage: null };
    }

    // Create user and initial note within a transaction
    const result = await prisma.$transaction(async (tx) => {
      console.log('Starting transaction for user creation with initial note');
      
      // Create user
      const newUser = await tx.user.create({
        data: {
          id: userId,
          email,
        },
      });
      console.log('User created in transaction:', newUser);
      
      // Create initial note for the user
      const initialNote = await tx.note.create({
        data: {
          text: "Welcome to your notes app! Start writing here...",
          authorId: userId,
        },
      });
      console.log('Initial note created in transaction:', initialNote.id);
      
      return { user: newUser, note: initialNote };
    });
    
    console.log('User and initial note successfully created:', {
      userId: result.user.id,
      noteId: result.note.id
    });
    
    return { 
      errorMessage: null,
      noteId: result.note.id 
    };
  } catch (error: any) {
    console.error('Error creating user in database:', {
      error: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return { errorMessage: 'A user with this email already exists' };
    }
    
    return { errorMessage: error.message || 'Failed to create user in database' };
  }
};

export const loginAction = async (email: string, password: string) => {
  try {
    const { auth } = await createClient();

    const { error } = await auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const logOutAction = async () => {
  try {
    const { auth } = await createClient();

    const { error } = await auth.signOut();
    if (error) throw error;

    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const signUpAction = async (email: string, password: string): Promise<{ errorMessage: string | null }> => {
  try {
    const { auth } = await createClient();
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                   process.env.VERCEL_URL ? 
                   `https://${process.env.VERCEL_URL}` : 
                   'http://localhost:3000';

    const { data, error } = await auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    });
    if (error) throw error;

    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};