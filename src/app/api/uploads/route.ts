import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.type;

    const upload = await prisma.upload.create({
      data: {
        filename: file.name,
        contentType: fileType,
        data: buffer,
        userId,
      },
    });

    const url = `/api/uploads/${upload.id}`;
    return NextResponse.json({ data: { id: upload.id, url }, error: null });
  } catch (error) {
    console.error("[POST /api/uploads]", error);
    return NextResponse.json(
      {
        data: null,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
