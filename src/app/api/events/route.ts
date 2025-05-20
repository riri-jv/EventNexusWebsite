import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server'; 
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import {
  eventOverviewSchema,
  eventLogisticsSchema,
  ticketTypeSchema,
  sponsorshipTypeSchema,
} from '@/lib/schemas/events';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const events = await prisma.event.findMany({
      include: {
        ticketTypes: true,
        sponsorshipTypes: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error('[GET /api/events]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

const formSchema = eventOverviewSchema
  .merge(eventLogisticsSchema)
  .extend({
    ticketTypes: z.array(ticketTypeSchema),
    sponsorshipTypes: z.array(sponsorshipTypeSchema),
  });


export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = formSchema.safeParse(body);

    if (!parsed.success) {
      console.log(parsed.data);
      return NextResponse.json({ message: 'Validation failed', errors: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const newEvent = await prisma.event.create({
      data: {
        summary: data.summary,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        location: data.location,
        locationURL: data.locationURL,
        organizer: {
          connect: { id: user.id },
        },
        ticketTypes: {
          create: data.ticketTypes.map((t) => ({
            name: t.name,
            price: t.price,
            currency: t.currency,
            quantity: t.quantity,
          })),
        },
        sponsorshipTypes: {
          create: data.sponsorshipTypes.map((s) => ({
            name: s.name,
            benefits: s.benefits.split(',').map(b => b.trim()),
            price: s.price,
            currency: s.currency,
          })),
        },
      },
    });

    return NextResponse.json({ eventId: newEvent.id }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/events]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
