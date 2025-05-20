'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

type TicketType = {
  id: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
};

type SponsorshipType = {
  id: string;
  name: string;
  benefits: string[];
  price: number;
  currency: string;
};

type EventData = {
  id: string;
  summary: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  locationURL: string;
  ticketTypes: TicketType[];
  sponsorshipTypes: SponsorshipType[];
};

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getToken } = useAuth();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`/api/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) return router.push('/sign-in');
        if (!res.ok) throw new Error('Fetch failed');
        setEvent(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, getToken, router]);

  if (loading) return <div className="h-64 flex items-center justify-center">Loading…</div>;
  if (!event) return <div className="h-64 flex items-center justify-center">Event not found.</div>;

  const start = format(new Date(event.startTime), 'PPpp');
  const end = format(new Date(event.endTime), 'PPpp');

  return (
    <div className="space-y-10 px-4 md:px-12 py-8">
      {/* Hero */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">{event.summary}</h1>
        <p className="text-muted-foreground">{event.description}</p>
        <div className="text-sm text-gray-500">
          <div>📍 <a href={event.locationURL} className="underline" target="_blank">{event.location}</a></div>
          <div>🗓️ {start} — {end}</div>
        </div>
      </div>

      {/* Tickets */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Tickets</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {event.ticketTypes.map((ticket) => (
            <Card key={ticket.id} className="p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-medium">{ticket.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {ticket.price} {ticket.currency}
                </p>
              </div>
              <div className="mt-2">
                {ticket.quantity > 0 ? (
                  <Badge variant="success">{ticket.quantity} available</Badge>
                ) : (
                  <Badge variant="destructive">Sold out</Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Sponsorships */}
      {event.sponsorshipTypes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Sponsorship Opportunities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {event.sponsorshipTypes.map((sponsor) => (
              <Card key={sponsor.id} className="p-4">
                <h3 className="text-lg font-medium">{sponsor.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {sponsor.price} {sponsor.currency}
                </p>
                <ul className="list-disc list-inside text-sm">
                  {sponsor.benefits.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="text-center pt-8">
        <Button onClick={() => router.push(`/events/${id}/purchase`)}>Purchase Ticket</Button>
      </div>
    </div>
  );
}
