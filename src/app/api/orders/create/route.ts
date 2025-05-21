import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import Razorpay from 'razorpay';

if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET_ID) {
  throw new Error('Missing Razorpay credentials');
}

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_ID,
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { eventId, items, type } = body;

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

    let totalAmount = 0;
    const tickets: { ticketTypeId: string; quantity: number; status: string }[] = [];
    const sponsorships: { sponsorshipTypeId: string; status: string }[] = [];

    if (type === 'ticket') {
      for (const item of items) {
        const ticketType = event.ticketTypes.find(t => t.id === item.id);
        if (!ticketType) {
          return NextResponse.json({ message: 'Invalid ticket type' }, { status: 400 });
        }
        if (ticketType.quantity < item.quantity) {
          return NextResponse.json({ message: 'Not enough tickets available' }, { status: 400 });
        }
        totalAmount += ticketType.price * item.quantity;
        tickets.push({
          ticketTypeId: item.id,
          quantity: item.quantity,
          status: 'pending',
        });
      }
    } else {
      for (const item of items) {
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

    const order = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      notes: {
        eventId,
        userId: user.id,
      },
    });

    await prisma.$transaction(async (tx) => {
      for (const ticket of tickets) {
        await tx.transaction.create({
          data: {
            ...ticket,
            eventId,
            userId: user.id,
            razorpayId: order.id,
            fees: 0,
            currency: 'INR',
          },
        });
      }

      for (const sponsorship of sponsorships) {
        await tx.sponsorship.create({
          data: {
            sponsorshipTypeId: sponsorship.sponsorshipTypeId,
            status: sponsorship.status,
            eventId,
            userId: user.id,
            razorpayId: order.id,
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
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}