"use server";

import { createClient } from "@/app/auth";
import { handleError } from "@/lib/utils";
import { prisma } from "@/db/prisma";

export const createUserInDatabase = async (userId: string, email: string) => {
  try {
    console.log('Starting user creation in database:', { userId, email });
    
    // Test database connection
    try {
      await prisma.$connect();
      console.log('Successfully connected to database');
    } catch (connError) {
      console.error('Database connection error:', connError);
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

    // Create user with explicit transaction
    const user = await prisma.$transaction(async (tx) => {
      console.log('Starting transaction for user creation');
      const newUser = await tx.user.create({
        data: {
          id: userId,
          email,
        },
      });
      console.log('User created in transaction:', newUser);
      return newUser;
    });
    
    console.log('User successfully created in database:', user);
    return { errorMessage: null };
  } catch (error: any) {
    console.error('Error creating user in database:', {
      error: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return { errorMessage: 'A user with this email already exists' };
    }
    
    return { errorMessage: error.message || 'Failed to create user in database' };
  } finally {
    // Ensure we disconnect properly
    try {
      await prisma.$disconnect();
    } catch (e) {
      console.error('Error disconnecting from database:', e);
    }
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

    const { data, error } = await auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });
    if (error) throw error;

    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};