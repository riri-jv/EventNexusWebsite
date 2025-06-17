import { EventNexusError, handleApiError } from "@/lib/error";
import { prisma } from "@/lib/prisma";
import { publicUserFields, publicEventFields } from "@/types/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    const profile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...publicUserFields,
        role: true,
        eventsOrganized: {
          select: publicEventFields,
        },
        sponsoredEvents: {
          select: {
            event: {
              select: publicEventFields,
            },
          },
        },
      },
    });

    if (!profile || profile.role === "ATTENDEE")
      throw EventNexusError.notFound("Profile", userId);

    if (profile.role === "ADMIN") profile.role = "ORGANIZER";

    return NextResponse.json({ data: profile }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
