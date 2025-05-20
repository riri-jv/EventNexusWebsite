import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_SECRET_ID as string,
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { eventId, items } = body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        ticketTypes: true,
        sponsorshipTypes: true,
      },
    });

    if (!event) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    // Calculate total amount and validate items
    let totalAmount = 0;
    const tickets: any[] = [];
    const sponsorships: any[] = [];

    for (const item of items) {
      if (item.type === 'ticket') {
        const ticketType = event.ticketTypes.find(t => t.id === item.id);
        if (!ticketType) {
          return NextResponse.json({ message: 'Invalid ticket type' }, { status: 400 });
        }
        if (ticketType.quantity < (item.quantity || 1)) {
          return NextResponse.json({ message: 'Not enough tickets available' }, { status: 400 });
        }
        totalAmount += ticketType.price * (item.quantity || 1);
        tickets.push({
          ticketTypeId: item.id,
          quantity: item.quantity || 1,
          fees: 0, // You can calculate fees here if needed
          currency: ticketType.currency,
          status: 'pending',
        });
      } else {
        const sponsorshipType = event.sponsorshipTypes.find(s => s.id === item.id);
        if (!sponsorshipType) {
          return NextResponse.json({ message: 'Invalid sponsorship type' }, { status: 400 });
        }
        totalAmount += sponsorshipType.price;
        sponsorships.push({
          sponsorshipTypeId: item.id,
          status: 'pending',
        });
      }
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // Razorpay expects amount in smallest currency unit
      currency: 'INR', // You might want to make this dynamic based on the event's currency
      notes: {
        eventId,
        userId: user.id,
      },
    });

    // Create transactions and sponsorships in database
    await prisma.$transaction(async (tx) => {
      for (const ticket of tickets) {
        await tx.transaction.create({
          data: {
            ...ticket,
            eventId,
            userId: user.id,
            razorpayId: order.id,
          },
        });
      }

      for (const sponsorship of sponsorships) {
        await tx.sponsorship.create({
          data: {
            ...sponsorship,
            eventId,
            userId: user.id,
          },
        });
      }
    });

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('[POST /api/orders/create]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}