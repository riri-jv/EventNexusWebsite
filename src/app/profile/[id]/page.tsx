import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicProfile } from "@/types/types";

async function getProfile(id: string) {
  const res = await fetch(
    `${(process.env.NODE_ENV !== "development" && process.env.NEXT_PUBLIC_APP_URL) || "http://localhost:3000"}/api/profile/${id}`,
    {
      cache: 'no-store', // This ensures fresh data on every request
      // Alternative: use next: { revalidate: 0 } for the same effect
    }
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: userId } = await params;

  const profile = await getProfile(userId);
  if (!profile) notFound();

  const { data }: { data: PublicProfile } = profile;

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      <div className="flex items-center gap-6">
        {data.imageUrl && (
          <Image
            src={data.imageUrl || "/generic-profile.svg"}
            alt={`${data.firstName} ${data.lastName}`}
            width={200}
            height={200}
            className="rounded-full object-cover"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold">
            {data.firstName} {data.lastName}
          </h1>
          <Badge variant="outline" className="mt-2">
            {data.role.charAt(0) + data.role.slice(1).toLowerCase()}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        {data.role === "ORGANIZER" && data.eventsOrganized && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Events Organized</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.eventsOrganized.map((event) => (
                <Card
                  key={event.id}
                  className="p-4 hover:shadow-lg transition-shadow"
                >
                  <Image
                    src={
                      event.imageId
                        ? `/api/uploads/${event.imageId}`
                        : "/generic-event.svg"
                    }
                    alt={event.summary}
                    width={400}
                    height={200}
                    className="w-full rounded-lg mb-4 object-cover h-48"
                  />
                  <h3 className="font-semibold text-lg mb-2">
                    <Link
                      href={`/events/${event.id}`}
                      className="hover:underline"
                    >
                      {event.summary}
                    </Link>
                  </h3>
                  <p className="text-sm text-gray-600">{event.description}</p>
                  <div className="mt-4">
                    <Badge>
                      {new Date(event.startTime).toLocaleDateString()}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {data.role === "SPONSOR" && data.sponsoredEvents && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Sponsored Events</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.sponsoredEvents.map(({ event }) => (
                <Card
                  key={event.id}
                  className="p-4 hover:shadow-lg transition-shadow"
                >
                  <Image
                    src={
                      event.imageId
                        ? `/api/uploads/${event.imageId}`
                        : "/generic-event.svg"
                    }
                    alt={event.summary}
                    width={400}
                    height={200}
                    className="w-full rounded-lg mb-4 object-cover h-48"
                  />
                  <h3 className="font-semibold text-lg mb-2">
                    <Link
                      href={`/events/${event.id}`}
                      className="hover:underline"
                    >
                      {event.summary}
                    </Link>
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-2">
                      <Image
                        src={event.organizer.imageUrl || "/generic-profile.svg"}
                        alt={`${event.organizer.firstName} ${event.organizer.lastName}`}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <Link
                        href={`/profile/${event.organizer.id}`}
                        className="text-sm text-gray-600 hover:underline"
                      >
                        {event.organizer.firstName} {event.organizer.lastName}
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
