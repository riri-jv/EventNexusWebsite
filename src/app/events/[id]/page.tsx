'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
};

export default function EventDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [event, setEvent] = useState<EventData | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [eventFound, setEventFound] = useState("...Loading");

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

  return (
    <div className="container mx-auto py-8 px-4">
      {showSuccess && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-md">
          Payment successful! Your purchase has been confirmed.
        </div>
      )}

      <h1 className="text-3xl font-bold mb-4">{event.summary}</h1>
      
      <div className="mb-8">
        <p className="text-gray-600 dark:text-gray-300">{event.description}</p>
        <div className="mt-4 space-y-2">
          <p>
            <strong>Start:</strong>{' '}
            {event.startTime}
          </p>
          <p>
            <strong>End:</strong>{' '}
            {event.endTime}
          </p>
          <p>
            <strong>Location:</strong>{' '}
            <a 
              href={event.locationURL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {event.location}
            </a>
          </p>
        </div>
      </div>

      {/* User's Purchases */}
      {user && (userTransactions.length > 0 || userSponsorships.length > 0) && (
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Your Purchases</h2>
          
          {userTransactions.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Your Tickets</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userTransactions.map((transaction) => (
                  <Card key={transaction.id} className="p-4">
                    <h4 className="font-medium">{transaction.ticketType.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Quantity: {transaction.quantity}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {userSponsorships.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Your Sponsorships</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userSponsorships.map((sponsorship) => (
                  <Card key={sponsorship.id} className="p-4">
                    <h4 className="font-medium">{sponsorship.sponsorshipType.name}</h4>
                    <ul className="list-disc list-inside text-sm mt-2">
                      {sponsorship.sponsorshipType.benefits.map((benefit, idx) => (
                        <li key={idx} className="text-gray-600 dark:text-gray-300">
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Available Tickets */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Available Tickets</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {event.ticketTypes.map((ticket) => (
            <Card key={ticket.id} className="p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-medium">{ticket.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
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

      {/* Sponsorship Opportunities */}
      {event.sponsorshipTypes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Sponsorship Opportunities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {event.sponsorshipTypes.map((sponsor) => (
              <Card key={sponsor.id} className="p-4">
                <h3 className="text-lg font-medium">{sponsor.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {sponsor.price} {sponsor.currency}
                </p>
                <ul className="list-disc list-inside text-sm">
                  {sponsor.benefits.map((benefit, idx) => (
                    <li key={idx} className="text-gray-600 dark:text-gray-300">
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
      {user && (
        <div className="text-center pt-8">
          <Button 
            onClick={() => router.push(`/events/${id}/purchase`)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Purchase Tickets or Sponsorships
          </Button>
        </div>
      )}
    </div>
  );
}
