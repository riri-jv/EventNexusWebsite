import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    const secret = process.env.RAZORPAY_SECRET_ID as string;
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      const transactions = await tx.transaction.findMany({
        where: { razorpayId: orderId },
        include: { ticketType: true },
      });

      for (const transaction of transactions) {
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

      await tx.sponsorship.updateMany({
        where: {
          AND: [
            { userId },
            { status: 'pending' },
          ],
        },
        data: { status: 'completed' },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /api/orders/verify]', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}