import { createClient } from '@/app/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  try {
    if (!code) {
      console.error('No code provided in callback');
      return NextResponse.redirect(`${requestUrl.origin}/login?error=No authentication code provided`);
    }

    console.log('Auth callback received with code:', code);
    const supabase = await createClient();

    // Exchange the code for a session
    const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      console.error('Auth callback error:', sessionError);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=Authentication failed`);
    }

    if (!session?.user) {
      console.error('No user data in session');
      return NextResponse.redirect(`${requestUrl.origin}/login?error=No user data received`);
    }

    // Ensure email is verified
    if (!session.user.email_confirmed_at) {
      console.error('Email not verified');
      return NextResponse.redirect(`${requestUrl.origin}/login?error=Please verify your email first`);
    }

    console.log('User data from session:', { 
      id: session.user.id, 
      email: session.user.email,
      emailConfirmed: session.user.email_confirmed_at 
    });

    // Check if user already exists in database
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!existingUser) {
      // Create user if they don't exist
      try {
        console.log('Creating new user in database:', {
          id: session.user.id,
          email: session.user.email
        });

        const newUser = await prisma.user.create({
          data: {
            id: session.user.id,
            email: session.user.email!,
          },
        });
        console.log('Created new user in database:', newUser);
      } catch (createError: any) {
        console.error('Error creating user in database:', {
          error: createError.message,
          code: createError.code,
          meta: createError.meta
        });
        
        if (createError.code === 'P2002') {
          // If error is due to unique constraint, user probably exists
          console.log('User likely exists, proceeding with redirect');
        } else {
          return NextResponse.redirect(`${requestUrl.origin}/login?error=Failed to create user profile`);
        }
      }
    } else {
      console.log('User already exists in database:', existingUser);
    }

    // Verify user exists after creation attempt
    const finalCheck = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!finalCheck) {
      console.error('Failed to verify user creation');
      return NextResponse.redirect(`${requestUrl.origin}/login?error=Failed to verify user creation`);
    }

    console.log('User verified in database:', finalCheck);
    return NextResponse.redirect(requestUrl.origin);
  } catch (error: any) {
    console.error('Unexpected error in auth callback:', {
      error: error.message,
      stack: error.stack
    });
    return NextResponse.redirect(`${requestUrl.origin}/login?error=Unexpected error occurred`);
  }
} 