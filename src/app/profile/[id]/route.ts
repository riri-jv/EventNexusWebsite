// app/api/profile/[id]/route.ts

import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = params.id;
  const body = await req.json();
  const { firstName, lastName, imageUrl } = body;

  try {
    const updatedUser = await clerkClient.users.updateUser(userId, {
      firstName,
      lastName,
      imageUrl,
    });

    return NextResponse.json({
      message: "User updated successfully",
      data: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        imageUrl: updatedUser.imageUrl,
      },
    });
  } catch (error: any) {
    console.error("Clerk update error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
