import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isEventOrganizerRoute = createRouteMatcher(["/event/(.*)/new"]);

export default clerkMiddleware(async (auth, req) => {
  const session = await auth();
  const role = session.sessionClaims?.metadata?.role as UserRole | null;

  const url = new URL("/", req.url);

  if (isAdminRoute(req) && role !== "ADMIN") return NextResponse.redirect(url);

  if (isEventOrganizerRoute(req) && role !== "ORGANIZER" && role !== "ADMIN")
    return NextResponse.redirect(url);
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
