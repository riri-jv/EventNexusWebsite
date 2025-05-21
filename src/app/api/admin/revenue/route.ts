import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () => {
    const { userId, sessionClaims } = await auth();
    if (!userId || sessionClaims.metadata.role !== "admin")
        return NextResponse.json({ status: 403, message: "Only admins are permitted." }, { status: 403 });
    
    const data = await prisma.eventRevenue.findMany({
        include: {
            event: {
                include: {
                    organizer: true,
                }
            },
        },
    });
    
    return NextResponse.json({ status: 200, data });
};

export const POST = async (req: NextRequest) => {
    const { userId, sessionClaims } = await auth();
    if (!userId || sessionClaims.metadata.role !== "admin")
        return NextResponse.json({ status: 403, message: "Only admins are permitted." });

    try {
      const body = await req.json();
      const { paid, eventId } = body;
  
      if (!eventId || typeof paid !== "number") {
        return NextResponse.json(
          { status: 400, message: "Missing or invalid 'eventId' or 'paid'" },
          { status: 400 }
        );
      }
  
      if (paid < 0) {
        return NextResponse.json(
          { status: 400, message: "'paid' must be non negative" },
          { status: 400 }
        );
      }
  
      const updated = await prisma.eventRevenue.updateMany({
        where: { eventId },
        data: { paid },
      });
  
      if (updated.count === 0) {
        return NextResponse.json(
          { status: 404, message: "EventRevenue not found" },
          { status: 404 }
        );
      }
  
      return NextResponse.json({
        status: 200,
        message: "EventRevenue updated successfully",
      });
    } catch (error) {
      console.error("[POST /api/event-revenue]", error);
      return NextResponse.json(
        { status: 500, message: "Internal server error" },
        { status: 500 }
      );
    }
  };