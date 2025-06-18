import { Webhook } from "svix";
import { WebhookEvent, clerkClient } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { PublicUserRole } from "@/types/types";

const roles: PublicUserRole[] = ["ATTENDEE", "ORGANIZER", "SPONSOR"];

export async function POST(req: Request) {
  const secret = process.env.SIGNING_SECRET;
  if (!secret) return new Response("Missing secret", { status: 500 });

  const wh = new Webhook(secret);
  const body = await req.text();
  const headerPayload = await headers();

  const event = wh.verify(body, {
    "svix-id": headerPayload.get("svix-id")!,
    "svix-timestamp": headerPayload.get("svix-timestamp")!,
    "svix-signature": headerPayload.get("svix-signature")!,
  }) as WebhookEvent;

  if (event.type === "user.created") {
    const { id, email_addresses, first_name, last_name, unsafe_metadata } =
      event.data;
    let role = unsafe_metadata.role as PublicUserRole;
    if (typeof role !== "string" || !roles.includes(role)) role = "ATTENDEE";

    const email = email_addresses[0]?.email_address;
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      console.warn(
        "duplicate user. you may have forgotten to delete the user in mongodb"
      );
      return new Response();
    }

    await prisma.user.upsert({
      where: { id },
      update: {},
      create: {
        id,
        email,
        firstName: first_name ?? "",
        lastName: last_name ?? "",
        role,
        imageUrl: event.data.image_url ?? "",
      },
    });

    const client = await clerkClient();
    await client.users.updateUser(id, {
      publicMetadata: { role },
    });
  } else if (event.type === "user.updated") {
    // ADD THIS SECTION - Handle user profile updates
    const { id, email_addresses, first_name, last_name, unsafe_metadata } =
      event.data;

    console.log(`Updating user profile for: ${id}`);

    // Prepare update data
    const updateData: any = {
      firstName: first_name ?? "",
      lastName: last_name ?? "",
      imageUrl: event.data.image_url ?? "",
      email: email_addresses[0]?.email_address ?? "",
    };

    // Only update role if it's provided and valid
    if (unsafe_metadata?.role && roles.includes(unsafe_metadata.role as PublicUserRole)) {
      updateData.role = unsafe_metadata.role as PublicUserRole;
    }

    // Update the user in your database with fresh Clerk data
    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    console.log(`Successfully updated user: ${id}`);
  } else if (
    event.type === "user.deleted" &&
    process.env.NODE_ENV === "development"
  ) {
    const { id } = event.data;
    console.log(`deleting everything related to user: ${id}`);
    const userOrders = await prisma.order.findMany({
      where: { userId: id },
      select: { id: true },
    });
    const orderIds = userOrders.map((o) => o.id);
    await prisma.$transaction(async (tx) => {
      await tx.sponsor.deleteMany({ where: { sponsorId: id } });
      if (orderIds.length > 0) {
        await tx.orderItem.deleteMany({
          where: { orderId: { in: orderIds } },
        });
      }
      await tx.order.deleteMany({ where: { userId: id } });
      await tx.event.deleteMany({ where: { organizerId: id } });
      await tx.user.deleteMany({ where: { id } });
    });
  } else {
    console.warn("unexpected hook:", event.type);
    // console.warn(event);
  }

  return new Response("ok", { status: 200 });
}
