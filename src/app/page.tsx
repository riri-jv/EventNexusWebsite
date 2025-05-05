// app/page.tsx
import { currentUser } from '@clerk/nextjs/server'

export default async function Page() {
  const user = await currentUser()

  return (
    <section className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
      <h1 className="text-4xl md:text-6xl font-bold mb-4">
        Welcome to <span className="text-blue-600 dark:text-blue-400">EventNexus</span>
      </h1>
      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
        Discover and attend the best events around you. Join EventNexus to connect with communities and experiences that matter.
      </p>

      {user && (
        <p className="mt-8 text-xl">
          Hello <strong>{user.username || user.firstName}</strong> 👋
        </p>
      )}
    </section>
  )
}
