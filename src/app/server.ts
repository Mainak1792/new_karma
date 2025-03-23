import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            console.error('Error setting cookie:', error);
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            console.error('Error removing cookie:', error);
          }
        },
      },
    }
  );

  return client;
}

export async function getUser() {
  try {
    const supabase = await createClient();
    
    // First try to get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError.message);
      return null;
    }

    if (!session) {
      console.log('No active session found');
      return null;
    }

    // If we have a session, get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError.message);
      return null;
    }

    if (!user) {
      console.log('No user found in session');
      return null;
    }

    // Check if user exists in the database
    try {
      const { prisma } = await import('@/db/prisma');
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id }
      });

      // If user doesn't exist in the database, create them
      if (!dbUser && user.email) {
        console.log('User exists in Supabase but not in database. Creating user:', { 
          id: user.id, 
          email: user.email 
        });
        
        const { createUserInDatabase } = await import('@/actions/user');
        await createUserInDatabase(user.id, user.email);
        
        // Verify the user was created
        const createdUser = await prisma.user.findUnique({
          where: { id: user.id }
        });
        
        if (!createdUser) {
          console.error('Failed to create user in database after authentication');
        } else {
          console.log('Successfully created user in database:', createdUser);
        }
      }
    } catch (dbError) {
      console.error('Error checking/creating user in database:', dbError);
      // Continue even if database operation fails, as authentication succeeded
    }

    return user;
  } catch (error) {
    console.error('Unexpected error in getUser:', error);
    return null;
  }
}