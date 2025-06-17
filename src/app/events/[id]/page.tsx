"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Loading } from "@/components/ui/loading";
import { readableDate } from "@/lib/utils";
import { EventWithOrders } from "@/types/types";
import { UserRole } from "@prisma/client";
import Link from "next/link";

const LocationView = dynamic(() => import("@/components/LocationView"), {
  ssr: false,
});

export default function EventDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const [event, setEvent] = useState<EventWithOrders | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (user) {
      setUserRole(user.publicMetadata.role as UserRole);
    }
  }, [user]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${id}`);
        if (!res.ok) {
          setEvent(null);
          setLoading(false);
          const { error } = await res.json();
          throw error;
        }
        const { data } = await res.json();
        setEvent(data);
      } catch (error) {
        console.error("Error fetching event:", error);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) {
      fetchEvent();
    }

    if (searchParams.get("payment") === "success") {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [id, searchParams, isLoaded, user]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Loading />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
        <p>
          The event you&apos;re looking for doesn&apos;t exist or you don&apos;t
          have permission to view it.
        </p>
        <Button className="mt-4" onClick={() => router.push("/events")}>
          Back to Events
        </Button>
      </div>
    );
  }

  const ticketOrders = event.orders.filter(
    ({ type, status }) => type === "TICKET" && status === "COMPLETED"
  );
  const packageOrders = event.orders.filter(
    ({ type, status }) => type === "PACKAGE" && status === "COMPLETED"
  );

  const isOrganizer = event.organizer.id === user?.id;
  const isSponsor = userRole === "SPONSOR";
  const canBuyTickets =
    isSignedIn &&
    event.tickets.some((t) => t.sold + t.reserved < t.quantity) &&
    new Date() < new Date(event.startTime);
  const canSponsor =
    isSponsor &&
    event.packages.some((p) => p.sold + p.reserved < p.quantity) &&
    new Date() < new Date(event.startTime);

  return (
    <div className="container mx-auto py-8 px-4">
      {showSuccess && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-md">
          Payment successful! Your purchase has been confirmed.
        </div>
      )}

      {/* Event Image */}
      {event.imageId && (
        <div className="relative w-full h-[400px] mb-8 rounded-lg overflow-hidden">
          <Image
            src={`/api/uploads/${event.imageId}`}
            alt={event.summary}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-4">{event.summary}</h1>

          <div className="mb-8">
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
              {event.description}
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-4">
                <Link
                  href={`/profile/${event.organizer.id}`}
                  className="flex items-center gap-2 hover:opacity-80"
                >
                  {event.organizer.imageUrl ? (
                    <Image
                      src={event.organizer.imageUrl}
                      alt={event.organizer.firstName}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold">
                        {event.organizer.firstName[0]}
                      </span>
                    </div>
                  )}
                  <strong>Organized by {event.organizer.firstName}</strong>
                </Link>
              </div>
              <p className="font-semibold text-sm">
                {readableDate(event.startTime)} to {readableDate(event.endTime)}
              </p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {event.location}
              </p>
            </div>

            {/* Location Map */}
            <div className="mt-6">
              <LocationView
                location={event.location}
                locationURL={event.locationURL}
              />
            </div>
          </div>

          {/* Current Sponsors */}
          {event.sponsors.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Event Sponsors</h2>
              <div className="space-y-4">
                {event.sponsors.map((sponsor) => (
                  <Link
                    key={sponsor.id}
                    href={`/profile/${sponsor.sponsor.id}`}
                    className="block p-4 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {sponsor.sponsor.imageUrl ? (
                        <Image
                          src={sponsor.sponsor.imageUrl}
                          alt={sponsor.sponsor.firstName}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                          <span className="text-lg font-semibold">
                            {sponsor.sponsor.firstName[0]}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium">
                          {sponsor.sponsor.firstName} {sponsor.sponsor.lastName}
                        </h3>
                        <Badge variant="secondary">Sponsor</Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {/* Organizer Dashboard */}
          {isOrganizer && (
            <Card className="p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Organizer Dashboard
              </h2>

              {/* Ticket Sales Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Ticket Sales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {event.tickets.map((ticket) => {
                    return (
                      <Card key={ticket.id} className="p-4">
                        <h4 className="font-medium">{ticket.title}</h4>
                        <p className="text-sm text-gray-600">
                          Sold: {ticket.sold} / {ticket.quantity}
                        </p>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Sponsorship Summary */}
              <div>
                <h3 className="text-lg font-medium mb-3">Sponsorships</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {event.packages.map((type) => {
                    return (
                      <Card key={type.id} className="p-4">
                        <h4 className="font-medium">{type.title}</h4>
                        <p className="text-sm text-gray-600">
                          Sponsors: {event.sponsors.length}
                        </p>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="w-full md:w-96 space-y-6">
          {/* Attendee - Purchased Tickets */}
          {ticketOrders.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Your tickets</h2>
              <div className="space-y-4">
                {ticketOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 bg-secondary/50 rounded-lg"
                  >
                    {order.orderItems.map((orderItem) => (
                      <div key={orderItem.id}>
                        <h4 className="font-medium">
                          {orderItem.ticket!.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Quantity: {orderItem.ticket!.quantity}
                        </p>
                        <p className="text-sm text-gray-600">
                          Total:{" "}
                          {orderItem.ticket!.price * orderItem.ticket!.quantity}{" "}
                          INR
                        </p>
                      </div>
                    ))}
                    <p className="text-sm font-semibold text-gray-700 dark:text-white">
                      Order ID: {order.id}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Sponsor - Current Sponsorship */}
          {packageOrders.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Your packages</h2>
              <div className="space-y-4">
                {packageOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 bg-secondary/50 rounded-lg"
                  >
                    {order.orderItems.map((orderItem) => (
                      <div key={orderItem.id}>
                        <h4 className="font-medium">
                          {orderItem.package!.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Quantity: {orderItem.package!.quantity}
                        </p>
                        <p className="text-sm text-gray-600">
                          Total:{" "}
                          {orderItem.package!.price *
                            orderItem.package!.quantity}{" "}
                          INR
                        </p>
                      </div>
                    ))}
                    <p className="text-sm font-semibold text-gray-700 dark:text-white">
                      Order ID: {order.id}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Available Tickets</h2>
            <div className="space-y-4">
              {event.tickets.map((ticket) => (
                <div key={ticket.id} className="p-4 bg-secondary/50 rounded-lg">
                  <h3 className="font-medium">{ticket.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {ticket.price} INR
                  </p>
                  {ticket.quantity - ticket.sold - ticket.reserved > 0 ? (
                    <Badge variant="outline">
                      {ticket.quantity - ticket.sold - ticket.reserved}{" "}
                      available
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Sold out</Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Available Sponsorship Packages */}
          {(isSponsor || isOrganizer) && event.packages.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Sponsorship Packages
              </h2>
              <div className="space-y-4">
                {event.packages.map((sponsor) => (
                  <div
                    key={sponsor.id}
                    className="p-4 bg-secondary/50 rounded-lg"
                  >
                    <h3 className="font-medium">{sponsor.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {sponsor.price} INR
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {sponsor.quantity - sponsor.sold - sponsor.reserved}
                    </p>
                    <div className="text-sm text-gray-600">
                      <ul className="list-disc list-inside mt-1">
                        {sponsor.description}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Purchase CTA */}
          {isSignedIn ? (
            <div className="text-center">
              {!isOrganizer && isSignedIn && (
                <div>
                  {canBuyTickets && (
                    <Button
                      onClick={() => router.push(`/events/${id}/purchase`)}
                      className="w-full bg-primary"
                    >
                      Purchase Tickets
                    </Button>
                  )}
                  {canSponsor && (
                    <Button
                      onClick={() => router.push(`/events/${id}/purchase`)}
                      className="w-full bg-primary mt-2"
                    >
                      Become a Sponsor
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <SignInButton mode="modal">
                <Button className="w-full">Sign in to Purchase</Button>
              </SignInButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
