import { EventNexusError, getRole, handleApiError } from "@/lib/error";
import { publicEventFields } from "@/types/types";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { clerkUser } = await getRole();
    const { id: eventId } = await params;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        ...publicEventFields,
        orders: {
          where: {
            userId: clerkUser?.id,
          },
          include: {
            orderItems: {
              include: {
                ticket: true,
                package: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw EventNexusError.notFound("Event", eventId);
    }

    return NextResponse.json({ data: event }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
