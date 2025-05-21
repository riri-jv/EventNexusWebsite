'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Script from 'next/script';

type Event = {
  id: string;
  summary: string;
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
};

type PurchaseItem = {
  id: string;
  quantity: number;
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PurchasePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<PurchaseItem[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (user) {
      setUserRole(user.publicMetadata.role as string);
    }
  }, [user]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${id}`);
        if (!res.ok) throw new Error('Failed to fetch event');
        const data = await res.json();
        setEvent(data);

        if (user?.publicMetadata.role === 'sponsor') {
          setSelectedItems(data.sponsorshipTypes.map((type: any) => ({ id: type.id, quantity: 0 })));
        } else {
          setSelectedItems(data.ticketTypes.map((type: any) => ({ id: type.id, quantity: 0 })));
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn) {
      fetchEvent();
    }
  }, [id, isSignedIn, user?.publicMetadata.role]);

  const handleQuantityChange = (itemId: string, value: string) => {
    const quantity = parseInt(value) || 0;
    setSelectedItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: Math.max(0, quantity) } : item
      )
    );
  };

  const calculateTotal = () => {
    if (!event) return { total: 0, currency: '' };

    const items = userRole === 'sponsor' ? event.sponsorshipTypes : event.ticketTypes;
    const selected = selectedItems.filter(item => item.quantity > 0);
    
    if (selected.length === 0) return { total: 0, currency: '' };

    const first = items.find(item => item.id === selected[0].id);
    const currency = first?.currency || '';
    
    const total = selected.reduce((sum, item) => {
      const itemType = items.find(t => t.id === item.id);
      return sum + (itemType?.price || 0) * item.quantity;
    }, 0);

    return { total, currency };
  };

  const handlePurchase = async () => {
    if (!event || processingPayment) return;

    const selectedWithQuantity = selectedItems.filter(item => item.quantity > 0);
    if (selectedWithQuantity.length === 0) {
      toast.error('Please select at least one item to purchase');
      return;
    }

    try {
      setProcessingPayment(true);
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          items: selectedWithQuantity,
          type: userRole === 'sponsor' ? 'sponsorship' : 'ticket',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const { id: orderId, amount, currency } = await response.json();

      // Initialize Razorpay payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: 'EventNexus',
        description: `Purchase for ${event.summary}`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            const verifyResponse = await fetch('/api/orders/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            router.push(`/events/${id}?payment=success`);
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: user?.fullName || undefined,
          email: user?.primaryEmailAddress?.emailAddress || undefined,
        },
        modal: {
          ondismiss: function() {
            setProcessingPayment(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to process your purchase');
      setProcessingPayment(false);
    }
  };

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

  const items = userRole === 'sponsor' ? event.sponsorshipTypes : event.ticketTypes;
  const { total, currency } = calculateTotal();

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <div className="container mx-auto py-8 px-4">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => router.push(`/events/${id}`)}
        >
          ← Back to Event
        </Button>

        <h1 className="text-3xl font-bold mb-6">
          {userRole === 'sponsor' ? 'Sponsor Event' : 'Purchase Tickets'}
        </h1>
        <h2 className="text-xl mb-8">{event.summary}</h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {items.map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex flex-col space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-gray-600">
                      {item.price} {item.currency}
                    </p>
                    {userRole === 'sponsor' && 'benefits' in item && (
                      <div className="mt-2">
                        <strong className="text-sm">Benefits:</strong>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {item.benefits.map((benefit, idx) => (
                            <li key={idx}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {'quantity' in item && (
                    <p className="text-sm text-gray-600">
                      {item.quantity} available
                    </p>
                  )}

                  <div className="flex items-center gap-4">
                    <Label htmlFor={`quantity-${item.id}`} className="flex-none">
                      Quantity:
                    </Label>
                    <Input
                      id={`quantity-${item.id}`}
                      type="number"
                      min={0}
                      max={'quantity' in item ? item.quantity : 1}
                      value={selectedItems.find(si => si.id === item.id)?.quantity || 0}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      className="w-24"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div>
            <Card className="p-6 sticky top-6">
              <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
              <div className="space-y-4">
                {selectedItems
                  .filter(item => item.quantity > 0)
                  .map(item => {
                    const itemDetails = items.find(i => i.id === item.id);
                    return (
                      <div key={item.id} className="flex justify-between">
                        <span>
                          {itemDetails?.name} × {item.quantity}
                        </span>
                        <span>
                          {(itemDetails?.price || 0) * item.quantity} {itemDetails?.currency}
                        </span>
                      </div>
                    );
                  })}

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>
                      {total} {currency}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full mt-6"
                  size="lg"
                  disabled={total === 0 || processingPayment}
                  onClick={handlePurchase}
                >
                  {processingPayment ? 'Processing...' : `Pay ${total} ${currency}`}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}