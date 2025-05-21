'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

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
    price: number;
    currency: string;
  }[];
  organizer: {
    id: string;
    name: string;
  };
  transactions?: {
    id: string;
    status: string;
    userId: string;
  }[];
  sponsorships?: {
    id: string;
    status: string;
    userId: string;
  }[];
};

export default function EventsPage() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterByDate, setFilterByDate] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    if (user) {
      setUserRole(user.publicMetadata.role as string);
    }
  }, [user]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events');
        if (!res.ok) throw new Error('Failed to fetch events');
        const data = await res.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn) {
      fetchEvents();
    }
  }, [isSignedIn]);

  const filteredEvents = events
    .filter(event => {
      const matchesSearch = event.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());

      const eventDate = new Date(event.startTime);
      const now = new Date();

      switch (filterByDate) {
        case 'upcoming':
          return matchesSearch && eventDate >= now;
        case 'past':
          return matchesSearch && eventDate < now;
        default:
          return matchesSearch;
      }
    });

  const userEvents = filteredEvents.filter(event => {
    if (userRole === 'organizer') {
      return event.organizer.id === user?.id;
    } else if (userRole === 'attendee') {
      return event.transactions?.some(t => t.userId === user?.id && t.status === 'completed');
    } else if (userRole === 'sponsor') {
      return event.sponsorships?.some(s => s.userId === user?.id && s.status === 'completed');
    }
    return true;
  });

  if (loading) {
    return <div className="container mx-auto py-8 px-4">Loading...</div>;
  }

  const renderEventCard = (event: Event) => (
    <Card key={event.id} className="p-6 hover:shadow-lg transition-shadow">
      {event.images?.[0] && (
        <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
          <Image
            src={event.images[0]}
            alt={event.summary}
            fill
            className="object-cover"
          />
        </div>
      )}
      
      <h3 className="text-xl font-semibold mb-2">{event.summary}</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
        {event.description}
      </p>
      
      <div className="space-y-2">
        <p className="text-sm">
          <strong>When:</strong> {new Date(event.startTime).toLocaleDateString()}
        </p>
        <p className="text-sm">
          <strong>Where:</strong> {event.location}
        </p>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {event.ticketTypes.map(ticket => (
            <Badge key={ticket.id} variant={ticket.quantity > 0 ? "default" : "destructive"}>
              {ticket.name}: {ticket.price} {ticket.currency}
            </Badge>
          ))}
        </div>
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
        {userRole === 'organizer' && (
          <Button onClick={() => router.push('/events/new')}>
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
          onChange={(e) => setFilterByDate(e.target.value as 'upcoming' | 'past' | 'all')}
        >
          <option value="upcoming">Upcoming Events</option>
          <option value="past">Past Events</option>
          <option value="all">All Events</option>
        </select>
      </div>

      {userRole && userEvents.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">
            {userRole === 'organizer' ? 'Your Organized Events' :
             userRole === 'attendee' ? 'Events You\'re Attending' :
             'Events You\'re Sponsoring'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userEvents.map(renderEventCard)}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-semibold mb-6">All Events</h2>
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(renderEventCard)}
          </div>
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-300">
            No events found matching your criteria.
          </p>
        )}
      </div>
    </div>
  );
}