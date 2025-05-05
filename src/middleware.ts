import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isEventAttendeeRoute = createRouteMatcher(['/eventattendee(.*)'])
const isEventOrganizerRoute = createRouteMatcher(['/eventorganizer(.*)'])
const isEventSponsorRoute = createRouteMatcher(['/eventsponsor(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const session = await auth()
  const role = session.sessionClaims?.metadata?.role

  const url = new URL('/', req.url) // Redirect to home if unauthorized

  if (isAdminRoute(req) && role !== 'admin') {
    return NextResponse.redirect(url)
  }

  if (isEventAttendeeRoute(req) && role !== 'attendee') {
    return NextResponse.redirect(url)
  }

  if (isEventOrganizerRoute(req) && role !== 'organizer') {
    return NextResponse.redirect(url)
  }

  if (isEventSponsorRoute(req) && role !== 'sponsor') {
    return NextResponse.redirect(url)
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and static assets
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
