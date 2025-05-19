import { prisma } from '@/lib/prisma';

export async function GET() {
  const events = await prisma.event.findMany({
    include: {
      organizer: true
    }
  });
  return Response.json(events);
}
