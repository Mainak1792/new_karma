'use server';

import { createServerClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function loginAction(email: string, password: string) {
    try {
        console.log('Attempting login with:', { email });
        
        const cookieStore = await cookies();
        const supabase = createServerClient();

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        
        if (error) {
            console.error('Login error:', error);
            throw error;
        }

        // Set the auth cookie
        if (data.session) {
            cookieStore.set('sb-auth-token', data.session.access_token, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 1 week
            });
        }
        
        console.log('Login successful:', { userId: data.user?.id });
        return { success: true, user: data.user };
    } catch (error: any) {
        console.error('Login error:', error);
        return { 
            error: error.message || 'Failed to login. Please try again.',
            details: error
        };
    }
}

export async function registerAction(email: string, password: string) {
    try {
        console.log('Attempting registration with:', { email });
        
        const supabase = createServerClient();

        // Validate email and password
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
            },
        });
        
        if (error) {
            console.error('Registration error:', error);
            throw error;
        }

        if (!data.user?.id) {
            throw new Error('Failed to get user ID from Supabase');
        }
        
        console.log('Creating user in database with ID:', data.user.id);
        
        // Create user in Prisma database
        const dbUser = await prisma.user.create({
            data: {
                id: data.user.id,
                email: email,
            },
        });
        
        console.log('User created in database:', dbUser);
        
        return { 
            success: true, 
            user: data.user,
            message: 'Please check your email to verify your account.'
        };
    } catch (error: any) {
        console.error('Registration error:', error);
        
        // Handle specific error types
        if (error.message.includes('fetch failed')) {
            return {
                error: 'Connection error. Please check your internet connection and try again.',
                details: error
            };
        }
        
        return { 
            error: error.message || 'Failed to register. Please try again.',
            details: error
        };
    }
} 