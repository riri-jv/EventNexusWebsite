import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';


export async function POST(req: NextRequest) {
  try {

    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ message: 'Missing signature' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const expectedSignature = crypto
      .createHmac('sha256', secret as string)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'payment.captured') {
      const { order_id } = event.payload.payment.entity;

      await prisma.$transaction(async (tx) => {
        const transactions = await tx.transaction.findMany({
          where: { razorpayId: order_id },
          include: { ticketType: true },
        });

        for (const transaction of transactions) {
          if (transaction.status !== 'completed') {
            await tx.transaction.update({
              where: { id: transaction.id },
              data: { status: 'completed' },
            });

            await tx.ticketType.update({
              where: { id: transaction.ticketTypeId },
              data: {
                quantity: {
                  decrement: transaction.quantity,
                },
              },
            });
          }
        }

        await tx.sponsorship.updateMany({
          where: { status: 'pending' },
          data: { status: 'completed' },
        });
      });
    } else if (event.event === 'payment.failed') {
      const { order_id } = event.payload.payment.entity;

      await prisma.$transaction(async (tx) => {
        await tx.transaction.updateMany({
          where: { 
            razorpayId: order_id,
            status: 'pending'
          },
          data: { status: 'failed' },
        });

        await tx.sponsorship.updateMany({
          where: { status: 'pending' },
          data: { status: 'failed' },
        });
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /api/webhooks/razorpay]', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}