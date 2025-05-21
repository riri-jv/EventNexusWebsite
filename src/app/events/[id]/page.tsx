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

type Event = {
  id: string;
  summary: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  locationURL: string;
  images?: string[];
  ticketTypes: {
    id: string;
    name: string;
    price: number;
    currency: string;
    quantity: number;
  }[];
  sponsorshipTypes: {
    id: string;
    name: string;
    benefits: string[];
    price: number;
    currency: string;
  }[];
  transactions: {
    id: string;
    ticketType: {
      id: string;
      name: string;
      price: number;
      currency: string;
      quantity: number;
    };
    quantity: number;
    status: string;
    userId: string;
  }[];
  sponsorships: {
    id: string;
    sponsorshipType: {
      id: string;
      name: string;
      price: number;
      currency: string;
    };
    status: string;
    userId: string;
  }[];
  organizer: {
    id: string;
    name: string;
  };
};

export default function EventDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const searchParams = useSearchParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
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
          setEvent(null);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setEvent(data);
      } catch (error) {
        console.error('Error fetching event:', error);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };
  
    if (isSignedIn) {
      fetchEvent();
    }
  
    if (searchParams.get('payment') === 'success') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [id, searchParams, isSignedIn]);

  if (loading) {
    return <div className="container mx-auto py-8 px-4">Loading...</div>;
  }

  if (!event) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
        <p>The event you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button className="mt-4" onClick={() => router.push('/events')}>
          Back to Events
        </Button>
      </div>
    );
  }

  const userTransactions = isSignedIn ? event.transactions.filter(
    t => t.userId === user?.id && t.status === 'completed'
  ) : [];
  
  const userSponsorships = isSignedIn ? event.sponsorships.filter(
    s => s.userId === user?.id && s.status === 'completed'
  ) : [];

  const isOrganizer = userRole === 'organizer' && event.organizer.id === user?.id;
  const isAttendee = userRole === 'attendee';
  const isSponsor = userRole === 'sponsor';
  const canBuyTickets = !isSponsor && event.ticketTypes.some(t => t.quantity > 0);
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

      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-4">{event.summary}</h1>
          
          <div className="mb-8">
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{event.description}</p>
            <div className="mt-4 space-y-2">
              <p>
                <strong>Organized by:</strong> {event.organizer.name}
              </p>
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

          {/* Organizer Dashboard */}
          {isOrganizer && (
            <Card className="p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-4">Organizer Dashboard</h2>
              
              {/* Ticket Sales Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Ticket Sales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {event.ticketTypes.map(ticket => {
                    const soldCount = event.transactions
                      .filter(t => t.ticketType.id === ticket.id && t.status === 'completed')
                      .reduce((acc, t) => acc + t.quantity, 0);
                    
                    return (
                      <Card key={ticket.id} className="p-4">
                        <h4 className="font-medium">{ticket.name}</h4>
                        <p className="text-sm text-gray-600">
                          Sold: {soldCount} / {ticket.quantity + soldCount}
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
                    const sponsors = event.sponsorships
                      .filter(s => s.sponsorshipType.id === type.id && s.status === 'completed');
                    
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
          )}
        </div>

        <div className="w-full md:w-96 space-y-6">
          {/* Attendee - Purchased Tickets */}
          {isSignedIn && userTransactions.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Your Tickets</h2>
              <div className="space-y-4">
                {userTransactions.map((transaction) => (
                  <div key={transaction.id} className="p-4 bg-secondary/50 rounded-lg">
                    <h4 className="font-medium">{transaction.ticketType.name}</h4>
                    <p className="text-sm text-gray-600">
                      Quantity: {transaction.quantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total: {transaction.ticketType.price * transaction.quantity} {transaction.ticketType.currency}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Sponsor - Current Sponsorship */}
          {isSignedIn && userSponsorships.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Your Sponsorship</h2>
              <div className="space-y-4">
                {userSponsorships.map((sponsorship) => (
                  <div key={sponsorship.id} className="p-4 bg-secondary/50 rounded-lg">
                    <h4 className="font-medium">{sponsorship.sponsorshipType.name}</h4>
                    <p className="text-sm text-gray-600">
                      Amount: {sponsorship.sponsorshipType.price} {sponsorship.sponsorshipType.currency}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Available Tickets */}
          {(!isSponsor || isOrganizer) && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Available Tickets</h2>
              <div className="space-y-4">
                {event.ticketTypes.map((ticket) => (
                  <div key={ticket.id} className="p-4 bg-secondary/50 rounded-lg">
                    <h3 className="font-medium">{ticket.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {ticket.price} {ticket.currency}
                    </p>
                    {ticket.quantity > 0 ? (
                      <Badge variant="outline">{ticket.quantity} available</Badge>
                    ) : (
                      <Badge variant="destructive">Sold out</Badge>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Sponsorship Opportunities */}
          {(isSponsor && !userSponsorships.length || isOrganizer) && event.sponsorshipTypes.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Sponsorship Opportunities</h2>
              <div className="space-y-4">
                {event.sponsorshipTypes.map((sponsor) => (
                  <div key={sponsor.id} className="p-4 bg-secondary/50 rounded-lg">
                    <h3 className="font-medium">{sponsor.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {sponsor.price} {sponsor.currency}
                    </p>
                    <div className="text-sm text-gray-600">
                      <strong>Benefits:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {sponsor.benefits.map((benefit, idx) => (
                          <li key={idx}>{benefit}</li>
                        ))}
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
              {!isOrganizer && (
                (canBuyTickets || canSponsor) && (
                  <Button 
                    onClick={() => router.push(`/events/${id}/purchase`)}
                    className="w-full bg-primary"
                  >
                    {canBuyTickets ? 'Purchase Tickets' : 'Become a Sponsor'}
                  </Button>
                )
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
