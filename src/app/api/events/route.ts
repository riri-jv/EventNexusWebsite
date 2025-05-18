import { prisma } from '@/lib/prisma';

export async function GET() {
  const events = await prisma.event.findMany({
    include: {
      createdBy: true
    }
  });
  return Response.json(events);
}
