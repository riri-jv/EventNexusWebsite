import { EventNexusError, handleApiError, requireAuthRole } from "@/lib/error";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () => {
  try {
    const data = await prisma.eventRevenue.findMany({
      include: {
        event: {
          include: {
            organizer: true,
          },
        },
      },
    });
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
};

export const POST = async (req: NextRequest) => {
  try {
    await requireAuthRole(["ADMIN"]);

    const body = await req.json();
    const { paidCents, eventId } = body;

    if (!eventId || typeof eventId !== "string")
      throw EventNexusError.validation("Invalid event id", "eventId");

    if (!paidCents || typeof paidCents !== "number" || paidCents < 0)
      throw EventNexusError.validation("Invalid amount", "paid");

    const updated = await prisma.eventRevenue.updateMany({
      where: {
        event: {
          id: eventId,
        },
      },
      data: { paidCents },
    });

    if (updated.count === 0)
      throw EventNexusError.notFound("Event not found", "eventId");

    return NextResponse.json({ data: null });
  } catch (error) {
    return handleApiError(error);
  }
};
