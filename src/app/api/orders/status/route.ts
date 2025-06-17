import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EventNexusError, handleApiError, requireAuth } from "@/lib/error";
import { OrderType } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { clerkUser, role } = await requireAuth();

    const { razorpayOrderId, orderType } = (await req.json()) as {
      razorpayOrderId: string;
      orderType: OrderType;
    };

    if (typeof razorpayOrderId !== "string")
      throw EventNexusError.validation(
        "Razorpay order ID",
        "razorpayOrderId",
        "Invalid Order ID"
      );

    if (
      typeof orderType !== "string" ||
      !["TICKET", "PACKAGE"].includes(orderType)
    )
      throw EventNexusError.validation(
        "Payment Order Type",
        "orderType",
        `Invalid orderType: ${orderType}`
      );

    const order = await prisma.order.findUnique({
      where: {
        razorpayOrderId,
      },
      select: {
        userId: true,
        status: true,
      },
    });

    if (!order) throw EventNexusError.notFound("Order", razorpayOrderId);

    if (clerkUser.id !== order.userId && role !== "ADMIN")
      throw new EventNexusError("FORBIDDEN");

    return NextResponse.json(
      { data: { status: order.status } },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
