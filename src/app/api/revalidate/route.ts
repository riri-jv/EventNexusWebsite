// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { userId } = await request.json();
  
  // Revalidate the specific profile page
  revalidatePath(`/profile/${userId}`);
  
  return Response.json({ revalidated: true });
}
