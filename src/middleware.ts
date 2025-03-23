import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
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
    request.nextUrl.pathname === "/sign-up";

  if (isAuthRoute) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      return NextResponse.redirect(
        new URL("/", request.nextUrl.origin),
      );
    }
  }

  const { searchParams, pathname } = new URL(request.url);

  if (!searchParams.get("noteId") && pathname === "/") {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      try {
        const newestNoteResponse = await fetch(
          `${request.nextUrl.origin}/api/fetch-newest-note?userId=${user.id}`,
        );
        
        if (!newestNoteResponse.ok) {
          console.error('Error fetching newest note:', await newestNoteResponse.text());
          return supabaseResponse;
        }
        
        const { newestNoteId } = await newestNoteResponse.json();

        if (newestNoteId) {
          const url = request.nextUrl.clone();
          url.searchParams.set("noteId", newestNoteId);
          return NextResponse.redirect(url);
        } else {
          const createNoteResponse = await fetch(
            `${request.nextUrl.origin}/api/create-new-note?userId=${user.id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
          
          if (!createNoteResponse.ok) {
            console.error('Error creating new note:', await createNoteResponse.text());
            return supabaseResponse;
          }
          
          const { noteId } = await createNoteResponse.json();
          const url = request.nextUrl.clone();
          url.searchParams.set("noteId", noteId);
          return NextResponse.redirect(url);
        }
      } catch (error) {
        console.error('Error in middleware:', error);
        return supabaseResponse;
      }
    }
  }

  return supabaseResponse;
}
