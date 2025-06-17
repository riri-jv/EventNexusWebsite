import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";
import { OrderType } from "@prisma/client";
import { EventNexusError, handleApiError, requireAuth } from "@/lib/error";

if (
  !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
  !process.env.RAZORPAY_SECRET_ID
) {
  throw new Error("Missing Razorpay credentials");
}

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_ID,
});

export async function POST(req: NextRequest) {
  try {
    const { clerkUser, role } = await requireAuth();

    const {
      eventId,
      items: checkoutItems,
      orderType,
    } = (await req.json()) as {
      eventId: string;
      items: {
        id: string;
        quantity: number;
      }[];
      orderType: OrderType;
    };

    if (typeof eventId !== "string")
      throw EventNexusError.validation("Invalid event ID", "id");

    if (
      typeof orderType !== "string" ||
      !["PACKAGE", "TICKET"].includes(orderType)
    ) {
      throw EventNexusError.validation("Invalid order type", "orderType");
    }

    const isTicket = orderType === "TICKET";

    if (!isTicket && role !== "SPONSOR")
      throw new EventNexusError(
        "FORBIDDEN_ROLE",
        "You need to be registered as a sponsor to purchase packages."
      );

    const user = await prisma.user.findUnique({
      where: { id: clerkUser.id },
    });

    if (!user) throw new EventNexusError("USER_SYNC_ERROR", null, clerkUser.id);

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        tickets: true,
        packages: true,
        organizer: true,
      },
    });

    if (!event) throw EventNexusError.notFound("Event", eventId);

    if (event.organizerId === clerkUser.id)
      throw new EventNexusError(
        "FORBIDDEN",
        "Organizer cannot buy tickets to or sponsor their own event"
      );

    /* delete expired orders to free reserved tickets */
    await prisma.$transaction(async (tx) => {
      const currentTime = new Date();

      const expiredOrders = await tx.order.findMany({
        where: {
          eventId: event.id,
          type: orderType,
          status: "RESERVED",
          expiresAt: { lt: currentTime },
        },
        include: { orderItems: true },
      });

      const ordersToDelete: Promise<any>[] = [];
      for (const { orderItems } of expiredOrders) {
        for (const { ticketId, packageId, quantity } of orderItems) {
          if (ticketId) {
            ordersToDelete.push(
              tx.ticket.update({
                where: { id: ticketId },
                data: { reserved: { decrement: quantity } },
              })
            );
          } else if (packageId) {
            ordersToDelete.push(
              tx.package.update({
                where: { id: packageId },
                data: { reserved: { decrement: quantity } },
              })
            );
          }
        }
      }
      await Promise.all(ordersToDelete);
      await tx.order.updateMany({
        where: {
          eventId: event.id,
          type: orderType,
          status: "RESERVED",
          expiresAt: { lt: currentTime },
        },
        data: { status: "EXPIRED" },
      });
    });

    let totalAmountCents = 0;
    const orderItemsData: {
      ticketId?: string;
      packageId?: string;
      quantity: number;
    }[] = [];

    const { razorpayOrder, order } = await prisma.$transaction(async (tx) => {
      for (const checkoutItem of checkoutItems) {
        if (orderType === "TICKET") {
          const ticket = await tx.ticket.findUnique({
            where: {
              id: checkoutItem.id,
              eventId: event.id,
            },
          });
          if (!ticket)
            throw EventNexusError.notFound("Ticket", checkoutItem.id);
          const available = ticket.quantity - ticket.sold - ticket.reserved;
          if (available < checkoutItem.quantity) {
            throw new EventNexusError("INSUFFICIENT_STOCK", {
              requested: checkoutItem.quantity,
              available: available,
              id: ticket.id,
              title: ticket.title,
              type: "TICKET",
            });
          }

          totalAmountCents += Math.round(
            ticket.price * checkoutItem.quantity * 100
          );
          orderItemsData.push({
            ticketId: checkoutItem.id,
            quantity: checkoutItem.quantity,
          });
        } else {
          const pkg = await tx.package.findUnique({
            where: {
              id: checkoutItem.id,
              eventId: event.id,
            },
          });

          if (!pkg) throw EventNexusError.notFound("Package", checkoutItem.id);

          const available = pkg.quantity - pkg.sold - pkg.reserved;
          if (available < checkoutItem.quantity)
            throw new EventNexusError("INSUFFICIENT_STOCK", {
              requested: checkoutItem.quantity,
              available,
              id: pkg.id,
              title: pkg.title,
              type: "PACKAGE",
            });

          totalAmountCents += Math.round(
            pkg.price * checkoutItem.quantity * 100
          );
          orderItemsData.push({
            packageId: checkoutItem.id,
            quantity: checkoutItem.quantity,
          });
        }
      }

      const razorpayOrder = await razorpay.orders.create({
        amount: totalAmountCents,
        currency: "INR",
        notes: {
          eventId: event.id,
          userId: user.id,
          type: orderType,
          itemCount: checkoutItems.length.toString(),
        },
      });

      const orderItemsToReserve = [];
      for (const orderItem of orderItemsData) {
        if (orderType === "TICKET") {
          orderItemsToReserve.push(
            tx.ticket.update({
              where: {
                id: orderItem.ticketId,
              },
              data: {
                reserved: {
                  increment: orderItem.quantity,
                },
              },
            })
          );
        } else {
          orderItemsToReserve.push(
            tx.package.update({
              where: {
                id: orderItem.packageId,
              },
              data: {
                reserved: {
                  increment: orderItem.quantity,
                },
              },
            })
          );
        }
      }

      await Promise.all(orderItemsToReserve);

      const order = await tx.order.create({
        data: {
          razorpayOrderId: razorpayOrder.id,
          status: "RESERVED",
          totalAmountCents,
          type: orderType,
          userId: user.id,
          eventId: event.id,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // two times the razorpay expiration duration
          orderItems: {
            create: orderItemsData,
          },
        },
        include: {
          orderItems: {
            include: {
              ticket: {
                select: {
                  title: true,
                  price: true,
                  id: true,
                },
              },
              package: {
                select: {
                  title: true,
                  price: true,
                  id: true,
                },
              },
            },
          },
        },
      });
      return { razorpayOrder, order };
    });
    return NextResponse.json({
      data: {
        id: razorpayOrder.id,
        amountCents: razorpayOrder.amount,
        expiresAt: order.expiresAt,
        items: order.orderItems.map((orderItem) => ({
          title: orderItem.ticket?.title || orderItem.package?.title,
          quantity: orderItem.quantity,
          price: orderItem.ticket?.price || orderItem.package?.price,
        })),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
