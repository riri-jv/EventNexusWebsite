import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const id = (await params).id;

    const upload = await prisma.upload.findUnique({
      where: { id },
    });

    if (!upload) {
      return NextResponse.json({ message: "Image not found" }, { status: 404 });
    }

    const response = new NextResponse(upload.data);
    response.headers.set("Content-Type", upload.contentType);
    response.headers.set("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
    return response;

  } catch (error) {
    console.error("[GET /api/uploads/[id]]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}