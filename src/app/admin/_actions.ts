'use server'

import { checkRole } from '@/utils/roles'
import { clerkClient } from '@clerk/nextjs/server'

export async function setRole(formData: FormData): Promise<void> {
  const userId = formData.get('id') as string
  const role = formData.get('role') as string

  if (!userId || !role) return

  if (!checkRole('admin')) return

  const client = await clerkClient();
  await client.users.updateUser(userId, {
    publicMetadata: { role },
  })
}

export async function removeRole(formData: FormData): Promise<void> {
  const userId = formData.get('id') as string

  if (!userId) return

  const client = await clerkClient();
  await client.users.updateUser(userId, {
    publicMetadata: { role: null },
  })
}
