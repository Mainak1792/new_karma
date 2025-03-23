import { createClient } from '@/app/auth';
import { createUserInDatabase } from '@/actions/user';
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

    console.log('User data from session:', { 
      id: session.user.id, 
      email: session.user.email,
      role: session.user.role,
      emailConfirmed: session.user.email_confirmed_at 
    });

    // Test database connection
    try {
      await prisma.$connect();
      console.log('Successfully connected to database in callback');
    } catch (connError) {
      console.error('Database connection error in callback:', connError);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=Database connection failed`);
    }

    // Create user in database
    console.log('Creating user in database:', { 
      userId: session.user.id, 
      email: session.user.email,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      directUrl: process.env.DIRECT_URL ? 'Set' : 'Not set'
    });
    
    const result = await createUserInDatabase(session.user.id, session.user.email!);

    if (result.errorMessage) {
      console.error('Error creating user in database:', {
        errorMessage: result.errorMessage,
        userId: session.user.id,
        email: session.user.email,
        timestamp: new Date().toISOString()
      });
      return NextResponse.redirect(`${requestUrl.origin}/login?error=Failed to create user profile`);
    }

    // Verify user was created
    const createdUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!createdUser) {
      console.error('User not found in database after creation');
      return NextResponse.redirect(`${requestUrl.origin}/login?error=Failed to verify user creation`);
    }

    console.log('User successfully created and verified in database:', createdUser);
    return NextResponse.redirect(requestUrl.origin);
  } catch (error: any) {
    console.error('Unexpected error in auth callback:', {
      error: error.message,
      stack: error.stack
    });
    return NextResponse.redirect(`${requestUrl.origin}/login?error=Unexpected error occurred`);
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      console.error('Error disconnecting from database:', e);
    }
  }
} 