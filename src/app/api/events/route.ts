import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { eventSchema } from "@/lib/schemas/events";
import {
  EventNexusError,
  getRole,
  handleApiError,
  requireAuthRole,
} from "@/lib/error";
import { publicEventFields } from "@/types/types";



export async function GET(req: Request) {
  try {
    const { role } = await getRole();
    const isAdmin = role === "ADMIN";

    const url = new URL(req.url);
    let page = parseInt(url.searchParams.get("page") || "1", 10);
    let limit = parseInt(url.searchParams.get("limit") || "20", 10);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit > 100 || limit < 1) limit = 100;
    const sinceParam = url.searchParams.get("since");
    const untilParam = url.searchParams.get("until");

    const skip = (page - 1) * limit;
    const where: any = {};

    if (sinceParam) {
      const since = new Date(sinceParam);
      if (!isNaN(since.getTime())) {
        where.startTime = { ...(where.startTime || {}), gte: since };
      }
    }

    if (untilParam) {
      const until = new Date(untilParam);
      if (!isNaN(until.getTime())) {
        where.startTime = { ...(where.startTime || {}), lte: until };
      }
    }

    const adminFields = isAdmin
      ? {
        eventRevenue: true,
        eventRevenueId: true,
        orders: true,
      }
      : {};

    const [events, totalCount] = await Promise.all([
      prisma.event.findMany({
        where,
        select: {
          ...publicEventFields,
          ...adminFields,
        },
        orderBy: { startTime: "asc" },
        skip,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      {
        data: events,
        meta: {
          page,
          limit,
          totalCount,
          totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { clerkUser } = await requireAuthRole(["ADMIN", "ORGANIZER"]);

    const body = await req.json();
    const parsed = eventSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten();
      const firstError = Object.entries(fieldErrors.fieldErrors)[0];

      if (firstError) {
        const [field, messages] = firstError;
        throw EventNexusError.validation(
          messages[0] || "Validation failed",
          field,
          fieldErrors
        );
      }

      throw EventNexusError.validation(
        fieldErrors.formErrors[0] || "Validation failed",
        undefined,
        fieldErrors
      );
    }

    const data = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id: clerkUser.id },
    });

    if (!user) {
      throw new EventNexusError("USER_SYNC_ERROR", null, clerkUser.id);
    }

    const event = await prisma.event.create({
      data: {
        summary: data.summary,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        location: data.location,
        locationURL: data.locationURL,
        image: {
          connect: {
            id: data.image,
          },
        },
        organizer: {
          connect: { id: user.id },
        },
        tickets: {
          create: data.tickets.map(
            ({ description, price, quantity, title }) => ({
              description,
              price,
              quantity,
              title,
            })
          ),
        },
        packages: {
          create: data.packages.map(
            ({ description, price, quantity, title }) => ({
              description,
              price,
              quantity,
              title,
            })
          ),
        },
        eventRevenue: {
          create: {},
        },
      },
      select: publicEventFields,
    });

    return NextResponse.json({ data: event }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
