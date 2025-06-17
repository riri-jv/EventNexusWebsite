"use server";

import { EventNexusError } from "@/lib/error";
import { prisma } from "@/lib/prisma";
import { checkRole } from "@/utils/roles";
import { clerkClient } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";

export async function setRole(formData: FormData): Promise<void> {
  const userId = formData.get("id") as string;
  const role = formData.get("role") as UserRole;

  if (!userId || !role) return;

  if (!checkRole("ADMIN")) return;

  if (
    !(["ATTENDEE", "ADMIN", "ORGANIZER", "SPONSOR"] as UserRole[]).includes(
      role
    )
  )
    throw EventNexusError.validation("Invalid role", "role");
  const client = await clerkClient();
  await client.users.updateUser(userId, {
    publicMetadata: { role },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });
}

export async function removeRole(formData: FormData): Promise<void> {
  const userId = formData.get("id") as string;

  if (!userId) return;

  const client = await clerkClient();
  await client.users.updateUser(userId, {
    publicMetadata: { role: null },
  });
}
