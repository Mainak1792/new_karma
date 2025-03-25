import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.delete(name);
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.delete(name);
        },
      },
    }
  );

  await supabase.auth.getSession();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const isAuthRoute =
      request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/register" ||
      request.nextUrl.pathname === "/sign-up";

    // Auth redirect
    if (isAuthRoute) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        return NextResponse.redirect(
          new URL("/", request.nextUrl.origin),
        );
      }
      return supabaseResponse;
    }

    // Note management
    const { searchParams, pathname } = new URL(request.url);

    if (!searchParams.get("noteId") && pathname === "/") {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        try {
          // First try to get the newest note
          const newestNoteResponse = await fetch(
            `${request.nextUrl.origin}/api/fetch-newest-note?userId=${user.id}`,
            {
              headers: {
                'Cache-Control': 'no-cache',
              },
            },
          );

          if (!newestNoteResponse.ok) {
            console.error('Failed to fetch newest note:', await newestNoteResponse.text());
            throw new Error(`Failed to fetch newest note: ${newestNoteResponse.statusText}`);
          }

          const newestNoteData = await newestNoteResponse.json();

          if (newestNoteData.newestNoteId) {
            // If we have a note, redirect to it
            const url = request.nextUrl.clone();
            url.searchParams.set("noteId", newestNoteData.newestNoteId);
            return NextResponse.redirect(url);
          } else {
            // Otherwise create a new note
            const createNoteResponse = await fetch(
              `${request.nextUrl.origin}/api/create-new-note?userId=${user.id}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  'Cache-Control': 'no-cache',
                },
              },
            );
            
            if (!createNoteResponse.ok) {
              console.error('Failed to create new note:', await createNoteResponse.text());
              throw new Error(`Failed to create new note: ${createNoteResponse.statusText}`);
            }
            
            const createNoteData = await createNoteResponse.json();
            
            if (createNoteData.noteId) {
              const url = request.nextUrl.clone();
              url.searchParams.set("noteId", createNoteData.noteId);
              return NextResponse.redirect(url);
            }
          }
        } catch (error) {
          console.error('Error in note handling:', error);
          return supabaseResponse;
        }
      }
    }

    return supabaseResponse;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}
