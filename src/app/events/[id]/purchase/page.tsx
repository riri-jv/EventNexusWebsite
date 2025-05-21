'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Script from 'next/script';

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

type Sponsorship = {
  id: string;
  status: string;
};

type EventData = {
  id: string;
  summary: string;
  ticketTypes: TicketType[];
  sponsorshipTypes: SponsorshipType[];
  sponsorships?: Sponsorship[];
};

type PurchaseItem = {
  id: string;
  type: 'ticket' | 'sponsorship';
  quantity?: number;
};

export default function PurchasePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [event, setEvent] = useState<EventData | null>(null);
  const [selectedItems, setSelectedItems] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setUserRole(user.publicMetadata.role as string);
    }
  }, [user]);

  useEffect(() => {
    const fetchEvent = async () => {
      const res = await fetch(`/api/events/${id}`);
      const data = await res.json();
      setEvent(data);
    };
    fetchEvent();
  }, [id]);

  // Redirect if user is organizer or not logged in
  useEffect(() => {
    if (!user) {
      router.push(`/events/${id}`);
      return;
    }
    
    if (userRole === 'organizer') {
      router.push(`/events/${id}`);
      return;
    }
  }, [user, userRole, id, router]);

  const initiatePayment = async () => {
    if (!user || !event || selectedItems.length === 0) return;
    setLoading(true);

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: id,
          items: selectedItems
        }),
      });

      const order = await res.json();
      
      const paymentData = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        name: event.summary,
        description: "Event purchase",
        prefill: {
          name: user.fullName,
          email: user.emailAddresses[0]?.emailAddress,
          contact: user.phoneNumbers[0]?.phoneNumber || "",
        },
        handler: async function(response: any) {
          const verificationRes = await fetch('/api/orders/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: order.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verificationData = await verificationRes.json();
          
          if (verificationData.success) {
            router.push(`/events/${id}?payment=success`);
          } else {
            alert('Payment verification failed');
          }
        },
      };

      const razorpay = new (window as any).Razorpay(paymentData);
      razorpay.open();
    } catch (error) {
      console.error('Payment initiation failed:', error);
      alert('Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (id: string, type: 'ticket' | 'sponsorship') => {
    setSelectedItems(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing) {
        return prev.filter(item => item.id !== id);
      }
      if (type === 'ticket') {
        return [...prev, { id, type, quantity: 1 }];
      }
      return [...prev, { id, type }];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    setSelectedItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  if (!event) return <div>Loading...</div>;

  const isSponsor = userRole === 'sponsor';

  return (
    <div className="container mx-auto py-8 px-4">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <h1 className="text-3xl font-bold mb-8">{event.summary}</h1>
      
      {/* Tickets - show to all users except sponsors who already have sponsorship */}
      {(!isSponsor || (isSponsor && event.sponsorships?.some(s => s.status === 'completed'))) && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Tickets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {event.ticketTypes.map((ticket: TicketType) => (
              <Card key={ticket.id} className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium">{ticket.name}</h3>
                    <p className="text-sm text-gray-600">
                      {ticket.price} {ticket.currency}
                    </p>
                    {ticket.quantity === 0 && (
                      <p className="text-sm text-red-600 mt-1 font-medium">
                        Sold out
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => toggleItem(ticket.id, 'ticket')}
                    variant={selectedItems.some(item => item.id === ticket.id) ? "destructive" : "default"}
                    disabled={ticket.quantity === 0}
                  >
                    {selectedItems.some(item => item.id === ticket.id) ? 'Remove' : 'Add'}
                  </Button>
                </div>
                {selectedItems.some(item => item.id === ticket.id) && ticket.quantity > 0 && (
                  <div className="mt-2">
                    <label className="text-sm">Quantity:</label>
                    <input
                      type="number"
                      min="1"
                      max={ticket.quantity}
                      value={selectedItems.find(item => item.id === ticket.id)?.quantity || 1}
                      onChange={(e) => updateQuantity(ticket.id, parseInt(e.target.value))}
                      className="ml-2 w-20 p-1 border rounded"
                    />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Sponsorships - only show to sponsors who don't have an active sponsorship */}
      {isSponsor && !event.sponsorships?.some(s => s.status === 'completed') && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Sponsorship Opportunities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {event.sponsorshipTypes.map((sponsor: SponsorshipType) => (
              <Card key={sponsor.id} className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium">{sponsor.name}</h3>
                    <p className="text-sm text-gray-600">
                      {sponsor.price} {sponsor.currency}
                    </p>
                  </div>
                  <Button
                    onClick={() => toggleItem(sponsor.id, 'sponsorship')}
                    variant={selectedItems.some(item => item.id === sponsor.id) ? "destructive" : "default"}
                  >
                    {selectedItems.some(item => item.id === sponsor.id) ? 'Remove' : 'Add'}
                  </Button>
                </div>
                <ul className="list-disc list-inside text-sm">
                  {sponsor.benefits.map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Checkout */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <p className="text-lg font-semibold">
              Selected: {selectedItems.length} item(s)
            </p>
          </div>
          <Button
            onClick={initiatePayment}
            disabled={selectedItems.length === 0 || loading}
            className="w-40"
          >
            {loading ? 'Processing...' : 'Proceed to Pay'}
          </Button>
        </div>
      </div>
    </div>
  );
}