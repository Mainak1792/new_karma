import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })

    // Handle auth routes
    if (request.nextUrl.pathname.startsWith('/auth') || 
        request.nextUrl.pathname === '/login' || 
        request.nextUrl.pathname === '/register') {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        return NextResponse.redirect(new URL('/', request.url))
      }
      return res
    }

    // Handle root path and note routes
    if (request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/notes/')) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      // Only handle note creation/fetching on root path
      if (request.nextUrl.pathname === '/') {
        try {
          // Get user's newest note
          const response = await fetch(`${request.nextUrl.origin}/api/fetch-newest-note?userId=${user.id}`, {
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'no-store'
          })

          if (!response.ok) {
            console.error('Failed to fetch newest note:', await response.text())
            return res
          }

          const data = await response.json()
          if (!data.newestNoteId) {
            // Create new note if none exists
            const createResponse = await fetch(`${request.nextUrl.origin}/api/create-new-note?userId=${user.id}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              cache: 'no-store'
            })

            if (!createResponse.ok) {
              console.error('Failed to create new note:', await createResponse.text())
              return res
            }

            const createData = await createResponse.json()
            return NextResponse.redirect(new URL(`/notes/${createData.noteId}`, request.url))
          }

          return NextResponse.redirect(new URL(`/notes/${data.newestNoteId}`, request.url))
        } catch (error) {
          console.error('Error in note handling:', error)
          return res
        }
      }
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/', '/auth/:path*', '/login', '/register', '/notes/:path*']
}
