"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import Image from "next/image";
import { readableDate } from "@/lib/utils";
import { Event, UserRole } from "@prisma/client";

interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export default function EventsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterByDate, setFilterByDate] = useState<"upcoming" | "past" | "all">(
    "all"
  );
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  useEffect(() => {
    if (user) {
      setUserRole(user.publicMetadata.role as UserRole);
    }
  }, [user]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const since =
          filterByDate === "upcoming" ? new Date().toISOString() : undefined;
        const until =
          filterByDate === "past" ? new Date().toISOString() : undefined;

        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: "9",
          ...(since && { since }),
          ...(until && { until }),
        });

        const res = await fetch(`/api/events?${queryParams}`);
        const { data, meta, error } = await res.json();
        if (!res.ok) throw new Error(error);
        setEvents(data);
        setMeta(meta);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) {
      fetchEvents();
    }
  }, [isLoaded, currentPage, filterByDate]);

  const filteredEvents = events.filter((event) =>
    searchQuery
      ? event.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold">Events</h1>
        </div>
        <Loading />
      </div>
    );
  }

  const renderEventCard = (event: Event) => (
    <Card key={event.id} className="p-6 hover:shadow-lg transition-shadow">
      {event.imageId && (
        <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
          <Image
            src={`/api/uploads/${event.imageId}`}
            alt={event.summary}
            fill
            className="object-cover"
          />
        </div>
      )}

      <h3 className="text-xl font-semibold mb-2">{event.summary}</h3>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">
          {readableDate(event.startTime)} to {readableDate(event.endTime)}
        </p>
        <p className="text-md font-semibold">{event.location}</p>
      </div>

      <Button
        className="mt-4 w-full"
        onClick={() => router.push(`/events/${event.id}`)}
      >
        View Details
      </Button>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Events</h1>
        {(userRole === "ORGANIZER" || userRole === "ADMIN") && (
          <Button onClick={() => router.push("/events/new")}>
            Create New Event
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Input
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="md:w-64"
        />

        <select
          className="px-4 py-2 border rounded-md bg-background"
          value={filterByDate}
          onChange={(e) => {
            setFilterByDate(e.target.value as "upcoming" | "past" | "all");
            setCurrentPage(1);
          }}
        >
          <option value="upcoming">Upcoming Events</option>
          <option value="past">Past Events</option>
          <option value="all">All Events</option>
        </select>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-6">
          {filterByDate[0].toUpperCase()}
          {filterByDate.slice(1)} Events
        </h2>
        {filteredEvents.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(renderEventCard)}
            </div>
            {meta && meta.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="py-2 px-4">
                  Page {currentPage} of {meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(meta.totalPages, p + 1))
                  }
                  disabled={currentPage === meta.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-300">
            No events found matching your criteria.
          </p>
        )}
      </div>
    </div>
  );
}
