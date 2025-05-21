'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useUser, SignInButton } from '@clerk/nextjs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues
const LocationView = dynamic(() => import('@/components/LocationView'), { ssr: false });

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

type Transaction = {
  id: string;
  ticketType: TicketType;
  quantity: number;
  status: string;
};

type Sponsorship = {
  id: string;
  sponsorshipType: SponsorshipType;
  status: string;
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
  transactions: Transaction[];
  sponsorships: Sponsorship[];
  images?: string[];
};

export default function EventDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const searchParams = useSearchParams();
  const [event, setEvent] = useState<EventData | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [eventFound, setEventFound] = useState("...Loading");
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setUserRole(user.publicMetadata.role as string);
    }
  }, [user]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${id}`);
        if (!res.ok) {
          console.log(`Failed to fetch event. Status: ${res.status}`);
          setEvent(null);
          setEventFound("event not found");
          return;
        }
        const data = await res.json();
        console.log(data);
        setEvent(data);
      } catch (error) {
        console.error('Error fetching event:', error);
        setEvent(null);
      }
    };
  
    fetchEvent();
  
    if (searchParams.get('payment') === 'success') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [id, searchParams]);
  

  if (!event) return <div>{eventFound}</div>;

  const userTransactions = event.transactions?.filter(
    t => t.status === 'completed'
  ) || [];
  
  const userSponsorships = event.sponsorships?.filter(
    s => s.status === 'completed'
  ) || [];

  const isOrganizer = userRole === 'organizer';
  const isAttendee = userRole === 'attendee';
  const isSponsor = userRole === 'sponsor';
  const canBuyTickets = !isSponsor;
  const canSponsor = isSponsor && !userSponsorships.length;

  return (
    <div className="container mx-auto py-8 px-4">
      {showSuccess && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-md">
          Payment successful! Your purchase has been confirmed.
        </div>
      )}

      {/* Event Image */}
      {event.images?.[0] && (
        <div className="relative w-full h-[400px] mb-8 rounded-lg overflow-hidden">
          <Image
            src={event.images[0]}
            alt={event.summary}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <h1 className="text-3xl font-bold mb-4">{event.summary}</h1>
      
      <div className="mb-8">
        <p className="text-gray-600 dark:text-gray-300">{event.description}</p>
        <div className="mt-4 space-y-2">
          <p>
            <strong>Start:</strong>{' '}
            {new Date(event.startTime).toLocaleString()}
          </p>
          <p>
            <strong>End:</strong>{' '}
            {new Date(event.endTime).toLocaleString()}
          </p>
          <p>
            <strong>Location:</strong>{' '}
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

      {/* Organizer View */}
      {isOrganizer && (
        <div className="mb-8">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Organizer Dashboard</h2>
            
            {/* Ticket Sales Summary */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Ticket Sales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {event.ticketTypes.map(ticket => {
                  const soldCount = event.transactions?.filter(
                    t => t.ticketType.id === ticket.id && t.status === 'completed'
                  ).reduce((acc, t) => acc + t.quantity, 0) || 0;
                  
                  return (
                    <Card key={ticket.id} className="p-4">
                      <h4 className="font-medium">{ticket.name}</h4>
                      <p className="text-sm text-gray-600">
                        Sold: {soldCount} / {ticket.quantity}
                      </p>
                      <p className="text-sm text-gray-600">
                        Revenue: {ticket.price * soldCount} {ticket.currency}
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
                {event.sponsorshipTypes.map(type => {
                  const sponsors = event.sponsorships?.filter(
                    s => s.sponsorshipType.id === type.id && s.status === 'completed'
                  ) || [];
                  
                  return (
                    <Card key={type.id} className="p-4">
                      <h4 className="font-medium">{type.name}</h4>
                      <p className="text-sm text-gray-600">
                        Sponsors: {sponsors.length}
                      </p>
                      <p className="text-sm text-gray-600">
                        Revenue: {type.price * sponsors.length} {type.currency}
                      </p>
                    </Card>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Attendee View - Purchased Tickets */}
      {isAttendee && userTransactions.length > 0 && (
        <div className="mb-8">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Your Tickets</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userTransactions.map((transaction) => (
                <Card key={transaction.id} className="p-4">
                  <h4 className="font-medium">{transaction.ticketType.name}</h4>
                  <p className="text-sm text-gray-600">
                    Quantity: {transaction.quantity}
                  </p>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Sponsor View - Current Sponsorship */}
      {isSponsor && userSponsorships.length > 0 && (
        <div className="mb-8">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Your Sponsorship</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userSponsorships.map((sponsorship) => (
                <Card key={sponsorship.id} className="p-4">
                  <h4 className="font-medium">{sponsorship.sponsorshipType.name}</h4>
                  <ul className="list-disc list-inside text-sm mt-2">
                    {sponsorship.sponsorshipType.benefits.map((benefit, idx) => (
                      <li key={idx} className="text-gray-600">
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Available Tickets */}
      {(!isSponsor || isOrganizer) && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Available Tickets</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {event.ticketTypes.map((ticket) => (
              <Card key={ticket.id} className="p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-medium">{ticket.name}</h3>
                  <p className="text-sm text-gray-600">
                    {ticket.price} {ticket.currency}
                  </p>
                </div>
                <div className="mt-2">
                  {ticket.quantity > 0 ? (
                    <Badge variant="outline">{ticket.quantity} available</Badge>
                  ) : (
                    <Badge variant="destructive">Sold out</Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Sponsorship Opportunities */}
      {(isSponsor && !userSponsorships.length || isOrganizer) && event.sponsorshipTypes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Sponsorship Opportunities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {event.sponsorshipTypes.map((sponsor) => (
              <Card key={sponsor.id} className="p-4">
                <h3 className="text-lg font-medium">{sponsor.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {sponsor.price} {sponsor.currency}
                </p>
                <ul className="list-disc list-inside text-sm">
                  {sponsor.benefits.map((benefit, idx) => (
                    <li key={idx} className="text-gray-600">
                      {benefit}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Purchase CTA */}
      {isSignedIn ? (
        <div className="text-center pt-8">
          {(canBuyTickets || canSponsor) && (
            <Button 
              onClick={() => router.push(`/events/${id}/purchase`)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {canBuyTickets ? 'Purchase Tickets' : 'Become a Sponsor'}
            </Button>
          )}
        </div>
      ) : (
        <div className="text-center pt-8">
          <SignInButton mode="modal">
            <Button>Sign in to Purchase</Button>
          </SignInButton>
        </div>
      )}
    </div>
  );
}
