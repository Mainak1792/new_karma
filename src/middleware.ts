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
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        try {
          const response = await fetch(
            `${request.nextUrl.origin}/api/fetch-newest-note?userId=${user.id}`,
            { signal: controller.signal }
          );
          
          const data = await response.json();
          clearTimeout(timeoutId);
          
          if (data.newestNoteId) {
            const url = request.nextUrl.clone();
            url.searchParams.set("noteId", data.newestNoteId);
            return NextResponse.redirect(url);
          } else {
            return supabaseResponse;
          }
        } catch (fetchError) {
          console.error('Error fetching newest note:', fetchError);
          clearTimeout(timeoutId);
          return supabaseResponse;
        }
      } catch (error) {
        console.error('Error in middleware:', error);
        return supabaseResponse;
      }
    }
  }

  return supabaseResponse;
}
