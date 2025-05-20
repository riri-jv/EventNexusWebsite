import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { userId } = await auth();

    const { id: eventId } = await params;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        ticketTypes: true,
        sponsorshipTypes: true,
        organizer: true,
        sponsorships: userId
          ? {
            where: {
              userId: userId,
            },
            include: {
              sponsorshipType: true,
            }
          }
          : false,
        transactions: userId
          ? {
            where: {
              userId: userId,
            },
            include: {
              ticketType: true,
            }
          }
          : false,
      },
    });

  if (!event) {
    return NextResponse.json({ message: 'Event not found' }, { status: 404 });
  }

  return NextResponse.json(event, { status: 200 });
} catch (error) {
  console.error('[GET /api/events/[id]]', error);
  return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
}
}
