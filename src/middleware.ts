import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })

    // Handle auth routes
    if (request.nextUrl.pathname.startsWith('/auth')) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        return NextResponse.redirect(new URL('/', request.url))
      }
      return res
    }

    // Handle root path
    if (request.nextUrl.pathname === '/') {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      // Get user's newest note
      try {
        const response = await fetch(`${request.nextUrl.origin}/api/fetch-newest-note?userId=${session.user.id}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          console.error('Failed to fetch newest note:', await response.text())
          return res
        }

        const data = await response.json()
        if (!data.newestNoteId) {
          // Create new note if none exists
          const createResponse = await fetch(`${request.nextUrl.origin}/api/create-new-note?userId=${session.user.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
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

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/', '/auth/:path*']
}
