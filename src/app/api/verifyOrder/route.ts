import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const generatedSignature = (
  razorpayorderId: string, 
  razorpaypaymentId: string
) => {
  const keySecret = process.env.RAZORPAY_SECRET_ID as string;

  const sig = crypto
    .createHmac("sha256", keySecret)
    .update(razorpayorderId + "|" + razorpaypaymentId)  
    .digest("hex");
  return sig;
};

export async function POST(req: NextRequest) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    await req.json();

    const signature = generatedSignature(
      razorpay_order_id,
      razorpay_payment_id
    );
    if (signature !== razorpay_signature) {
      return NextResponse.json(
        { message: "Payment verification failed", isOk: false },
        { status: 400 }
      );
    }
//Probably some db calls here to update the order status or add premium status to user 
    return NextResponse.json(
      { message: "Payment verification successful", isOk: true },
      { status: 200 }
    );
  // return NextResponse.json({ message: "Payment verification successful" }, { status: 200 });
    }