import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { Resend } from "resend";

import { EventNexusError, handleApiError } from "@/lib/error";
import { Event, Order, OrderItem, Package, Ticket } from "@prisma/client";
import { PublicUser, publicUserFields } from "@/types/types";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = new Resend(RESEND_API_KEY);

type OrderWithOrganizer = Order & {
  user: PublicUser;
  event: Event & {
    organizer: PublicUser;
  };
  orderItems: (OrderItem & {
    ticket?: Ticket;
    package?: Package;
  })[];
};

async function sendMail({
  to,
  subject,
  react,
  html,
}: {
  to: string;
  subject: string;
  react?: any;
  html?: string;
}) {
  if (!process.env.SEND_MAILS) return;
  console.log("sending mail to", to);
  await resend.emails.send({
    from: "Event Nexus <mail@eventnexus.in>",
    to,
    subject,
    react,
    html,
  });
}

function createEmailTemplate(content: string, title: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .email-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 30px;
        }
        .order-details {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          border-left: 4px solid #667eea;
        }
        .order-details h3 {
          margin-top: 0;
          color: #495057;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: 600;
          color: #495057;
        }
        .detail-value {
          color: #6c757d;
        }
        .success-badge {
          background: #d1edff;
          color: #0066cc;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          display: inline-block;
          margin: 20px 0;
        }
        .cta-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 8px;
          display: inline-block;
          font-weight: 600;
          margin: 20px 0;
          text-align: center;
        }
        .footer {
          background: #f8f9fa;
          padding: 20px 30px;
          text-align: center;
          color: #6c757d;
          font-size: 14px;
        }
        .divider {
          height: 1px;
          background: #e9ecef;
          margin: 20px 0;
        }
        @media (max-width: 600px) {
          body { padding: 10px; }
          .header, .content { padding: 20px; }
          .header h1 { font-size: 24px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        ${content}
      </div>
    </body>
    </html>
  `;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
  }).format(cents / 100);
}

async function packageOrderSuccessMail(order: OrderWithOrganizer) {
  const totalAmount = order.orderItems.reduce((sum, item) => {
    const price = item.package?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const content = `
    <div class="header">
      <h1>Sponsorship Confirmed!</h1>
    </div>
    <div class="content">
      <div class="success-badge">✅ Payment Successful</div>
      
      <p>Dear ${order.user.firstName || "Valued Sponsor"},</p>
      
      <p>Thank you for becoming a sponsor! Your sponsorship package has been successfully processed and you're now officially supporting this amazing event.</p>

      <div class="order-details">
        <h3>📋 Sponsorship Details</h3>
        <div class="detail-row">
          <span class="detail-label">Order ID:</span>
          <span class="detail-value">#${order.id}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Event:</span>
          <span class="detail-value">${order.event?.summary || "Event"}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Package Type:</span>
          <span class="detail-value">Sponsorship Package</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Total Amount:</span>
          <span class="detail-value"><strong>${formatCurrency(totalAmount * 100)}</strong></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <span class="detail-value"><strong>Confirmed ✅</strong></span>
        </div>
      </div>

      <p><strong>What happens next?</strong></p>
      <ul>
        <li>The event organizer will contact you within 24-48 hours</li>
        <li>You'll receive details about your sponsorship benefits</li>
        <li>Marketing materials and promotional opportunities will be discussed</li>
      </ul>

      <a href="${process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000"}/orders/${order.id}" class="cta-button">
        View Full Details
        
        <div class="divider"></div>
        
        </a>
      <p style="margin-bottom: 0;">Thank you for your support!</p>
      <p style="color: #6c757d; font-size: 14px;">The Event Nexus Team</p>
    </div>
    <div class="footer">
      <p>Questions? Reply to this email or contact our support team.</p>
      <p>© ${new Date().getFullYear()} Event Nexus. All rights reserved.</p>
    </div>
  `;

  await sendMail({
    to: order.user.email,
    subject: "Sponsorship Package Confirmed - Thank You!",
    html: createEmailTemplate(content, "Sponsorship Confirmed"),
  });
}

async function ticketOrderSuccessMail(order: OrderWithOrganizer) {
  const totalAmount = order.orderItems.reduce((sum, item) => {
    const price = item.ticket?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const totalTickets = order.orderItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const ticketDetails = order.orderItems
    .map((item) => {
      if (item.ticket) {
        return `
        <div class="detail-row">
          <span class="detail-label">${item.ticket.title} (x${item.quantity}):</span>
          <span class="detail-value">${formatCurrency(item.ticket.price * item.quantity * 100)}</span>
        </div>
      `;
      }
      return "";
    })
    .join("");

  const content = `
    <div class="header">
      <h1>Tickets Confirmed!</h1>
    </div>
    <div class="content">
      <div class="success-badge">Payment Successful</div>
      
      <p>Dear ${order.user.firstName || "Event Attendee"},</p>
      
      <p>Fantastic! Your ticket purchase has been confirmed. We can't wait to see you at the event!</p>

      <div class="order-details">
        <h3>Ticket Details</h3>
        <div class="detail-row">
          <span class="detail-label">Order ID:</span>
          <span class="detail-value">#${order.id}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Event:</span>
          <span class="detail-value">${order.event?.summary || "Event"}</span>
        </div>
        ${ticketDetails}
        <div class="divider"></div>
        <div class="detail-row">
          <span class="detail-label">Total Tickets:</span>
          <span class="detail-value"><strong>${totalTickets}</strong></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Total Amount:</span>
          <span class="detail-value"><strong>${formatCurrency(totalAmount * 100)}</strong></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <span class="detail-value"><strong>Confirmed</strong></span>
        </div>
      </div>

      <p><strong>Important Information:</strong></p>
      <ul>
        <li>Keep this email as your proof of purchase</li>
        <li>Bring a valid ID to the event</li>
        <li>Check your email for any event updates</li>
        <li>Arrive 30 minutes early for smooth entry</li>
      </ul>

      <a href="${process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000"}/orders/${order.id}" class="cta-button">
        View Tickets & Details
      </a>

      <div class="divider"></div>
      
      <p style="margin-bottom: 0;">See you at the event!</p>
      <p style="color: #6c757d; font-size: 14px;">The Event Nexus Team</p>
    </div>
    <div class="footer">
      <p>Questions? Reply to this email or contact our support team.</p>
      <p>© ${new Date().getFullYear()} Event Nexus. All rights reserved.</p>
    </div>
  `;

  await sendMail({
    to: order.user.email,
    subject: "Your Tickets Are Confirmed - See You There!",
    html: createEmailTemplate(content, "Tickets Confirmed"),
  });
}

async function someoneSponsoredYourEvent(order: OrderWithOrganizer) {
  const sponsorName =
    `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim();
  const totalAmount = order.orderItems.reduce((sum, item) => {
    const price = item.package?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const content = `
    <div class="header">
      <h1>New Sponsor Alert!</h1>
    </div>
    <div class="content">
      <div class="success-badge">Sponsorship Received</div>
      
      <p>Dear ${order.event.organizer.firstName || "Event Organizer"},</p>
      
      <p>Great news! You have a new sponsor for your event. Here are the details:</p>

      <div class="order-details">
        <h3>Sponsorship Information</h3>
        <div class="detail-row">
          <span class="detail-label">Sponsor:</span>
          <span class="detail-value"><strong>${sponsorName || "New Sponsor"}</strong></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Event:</span>
          <span class="detail-value">${order.event?.summary || "Your Event"}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Package:</span>
          <span class="detail-value">Sponsorship Package</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Sponsorship Value:</span>
          <span class="detail-value"><strong>${formatCurrency(totalAmount * 100)}</strong></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Order ID:</span>
          <span class="detail-value">#${order.id}</span>
        </div>
      </div>

      <p><strong>Next Steps:</strong></p>
      <ul>
        <li>Reach out to your sponsor within 24-48 hours</li>
        <li>Discuss sponsorship benefits and promotional opportunities</li>
        <li>Coordinate on marketing materials and event presence</li>
        <li>Keep them updated on event developments</li>
      </ul>

      <p><strong>Sponsor Contact Information:</strong><br>
      Email: ${order.user.email}</p>

      <a href="${process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000"}/dashboard/events/${order.eventId}" class="cta-button">
        Manage Your Event
      </a>

      <div class="divider"></div>
      
      <p style="margin-bottom: 0;">Congratulations on securing this sponsorship! 🎊</p>
      <p style="color: #6c757d; font-size: 14px;">The Event Nexus Team</p>
    </div>
    <div class="footer">
      <p>Questions? Reply to this email or contact our support team.</p>
      <p>© ${new Date().getFullYear()} Event Nexus. All rights reserved.</p>
    </div>
  `;

  await sendMail({
    to: order.event.organizer.email,
    subject: `New Sponsor: ${sponsorName} has sponsored your event!`,
    html: createEmailTemplate(content, "New Sponsor Alert"),
  });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature)
      throw EventNexusError.validation(
        "Missing signature",
        "x-razorpay-signature"
      );

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const expectedSignature = crypto
      .createHmac("sha256", secret as string)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature)
      throw EventNexusError.validation(
        "Invalid signature",
        "x-razorpay-signature"
      );

    const event = JSON.parse(rawBody);
    const orderId =
      event.payload.order?.entity?.id ||
      event.payload.payment?.entity?.order_id;

    console.log(`Webhook: ${event.event} for order ${orderId}`);

    switch (event.event) {
    case "order.paid":
      await handleOrderPaid(orderId);
      break;

    case "payment.failed":
      await handlePaymentFailed(orderId);
      break;

    case "order.failed":
      await handleOrderFailed(orderId);
      break;

    default:
      console.log(`Unhandled event: ${event.event}`);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    return handleApiError(error);
  }
}

async function handleOrderPaid(razorpayOrderId: string) {
  let finalOrder: OrderWithOrganizer | null = null;
  let sendSponsorshipMail = false;
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: {
        razorpayOrderId,
      },
      include: {
        orderItems: {
          include: {
            ticket: true,
            package: true,
          },
        },
        event: {
          include: {
            eventRevenue: true,
            organizer: {
              select: publicUserFields,
            },
          },
        },
        user: { select: publicUserFields },
      },
    });
    if (!order) return console.warn(`Order ${razorpayOrderId} not found`);
    if (order.status === "COMPLETED")
      return console.warn(`Order ${razorpayOrderId} already completed`);

    let revenueCents = 0;

    const updateSalesAndReservations: Promise<unknown>[] = [];

    for (const orderItem of order.orderItems) {
      if (orderItem.ticketId) {
        updateSalesAndReservations.push(
          tx.ticket.update({
            where: {
              id: orderItem.ticketId,
            },
            data: {
              sold: { increment: orderItem.quantity },
              reserved: { decrement: orderItem.quantity },
            },
          })
        );
        revenueCents += orderItem.ticket!.price * orderItem.quantity * 100;
      } else if (orderItem.packageId) {
        updateSalesAndReservations.push(
          tx.package.update({
            where: {
              id: orderItem.packageId,
            },
            data: {
              sold: { increment: orderItem.quantity },
              reserved: { decrement: orderItem.quantity },
            },
          })
        );
        revenueCents += orderItem.package!.price * orderItem.quantity * 100;
      }
    }

    await Promise.all(updateSalesAndReservations);

    await tx.order.update({
      where: { id: order.id },
      data: { status: "COMPLETED" },
    });

    const revenueField = order.type.toLowerCase() + "RevenueCents";

    await tx.eventRevenue.update({
      where: { id: order.event.eventRevenueId! },
      data: {
        [revenueField]: { increment: revenueCents },
      },
    });

    finalOrder = order as OrderWithOrganizer;

    if (order.type === "PACKAGE") {
      try {
        await tx.sponsor.create({
          data: {
            sponsorId: order.userId,
            eventId: order.eventId,
          },
        });

        sendSponsorshipMail = true;
      } catch (error: any) {
        if (
          error.code !== "P2002" /* Unique constraint violation */ ||
          !error.meta?.target?.includes("sponsorId_eventId")
        )
          throw error;
        /* Sponsor already exists so don't send an email here */
      }
    }
  });
  if (!finalOrder) return;
  if ((finalOrder as OrderWithOrganizer).type === "PACKAGE")
    packageOrderSuccessMail(finalOrder);
  else ticketOrderSuccessMail(finalOrder);

  if (sendSponsorshipMail) someoneSponsoredYourEvent(finalOrder);
}

async function handlePaymentFailed(razorpayOrderId: string) {
  await prisma.order.update({
    where: { razorpayOrderId },
    data: { status: "FAILED" },
  });
}

async function handleOrderFailed(razorpayOrderId: string) {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { razorpayOrderId },
      include: { orderItems: true },
    });

    if (!order || order.status === "EXPIRED") return;

    const updateReserved = [];
    for (const orderItem of order.orderItems) {
      if (orderItem.ticketId) {
        updateReserved.push(
          tx.ticket.update({
            where: { id: orderItem.ticketId },
            data: { reserved: { decrement: orderItem.quantity } },
          })
        );
      } else if (orderItem.packageId) {
        updateReserved.push(
          tx.package.update({
            where: { id: orderItem.packageId },
            data: { reserved: { decrement: orderItem.quantity } },
          })
        );
      }
    }

    await Promise.all(updateReserved);

    await tx.order.update({
      where: { id: order.id },
      data: { status: "EXPIRED" },
    });

    console.log(
      `Order ${razorpayOrderId} expired: released ${order.orderItems.length} order items' reservations`
    );
  });
}
