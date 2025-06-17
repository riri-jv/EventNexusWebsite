"use client";

import { useEffect, useState } from "react";
import { redirect, useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Script from "next/script";
import { EventWithOrders } from "@/types/types";
import { Ticket, Package, UserRole, OrderType, OrderStatus } from "@prisma/client";
import { Loading } from "@/components/ui/loading";

type OrderItemInput = {
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
  const { user, isSignedIn } = useUser();
  const [event, setEvent] = useState<EventWithOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<OrderItemInput[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [orderType, setPurchaseType] = useState<OrderType>("TICKET");

  useEffect(() => {
    if (user) {
      setUserRole(user.publicMetadata.role as UserRole);
    }
  }, [user]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${id}`);
        if (!res.ok) throw new Error("Failed to fetch event");
        const { data } = await res.json();

        if (data.organizer.id === user?.id) {
          toast.error("Event organizers cannot purchase tickets or packages");
          redirect(`/events/${id}`);
          return;
        }

        setEvent(data);
        if (userRole === "SPONSOR" && orderType === "PACKAGE") {
          setSelectedItems(
            data.packages.map(({ id }: Package) => ({ id, quantity: 0 }))
          );
        } else {
          setSelectedItems(
            data.tickets.map(({ id }: Ticket) => ({ id, quantity: 0 }))
          );
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        toast.error("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn) {
      fetchEvent();
    }
  }, [id, isSignedIn, user?.id, userRole, orderType]);

  const handleQuantityChange = (itemId: string, value: string) => {
    const quantity = parseInt(value) || 0;
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.max(0, quantity) } : item
      )
    );
  };

  const calculateTotal = () => {
    if (!event) return { total: 0, currency: "INR" };

    const items = orderType === "TICKET" ? event.tickets : event.packages;
    const selected = selectedItems.filter((item) => item.quantity > 0);

    if (selected.length === 0) return { total: 0, currency: "INR" };

    const total = selected.reduce((sum, item) => {
      const itemType = items.find((t) => t.id === item.id);
      return sum + (itemType?.price || 0) * item.quantity;
    }, 0);

    return { total, currency: "INR" };
  };

  const handlePurchase = async () => {
    if (!event || processingPayment) return;

    const selectedWithQuantity = selectedItems.filter(
      (item) => item.quantity > 0
    );
    if (selectedWithQuantity.length === 0) {
      toast.error("Please select at least one item to purchase");
      return;
    }

    try {
      setProcessingPayment(true);
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: event.id,
          items: selectedWithQuantity,
          orderType: orderType,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }

      const {
        data: { id: razorpayOrderId, amountCents },
      } = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amountCents,
        currency: "INR",
        name: "EventNexus",
        description: `${orderType[0]}${orderType.slice(1).toLowerCase()} purchase for ${event.summary}`,
        order_id: razorpayOrderId,
        handler: async function () {
          try {
            const pollLimit = 10;
            const pollDelay = 5 * 1000;
            let pollCount = 0;

            const pollOrderStatus = async () => {
              const response = await fetch("/api/orders/status", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpayOrderId,
                  orderType,
                }),
              });

              const { data, error } = await response.json();
              if (!response.ok)
                throw new Error(error);

              const status = data.status as OrderStatus;

              if (status === "FAILED")
                throw new Error("Payment verification failed");

              if (status === "COMPLETED") {
                redirect(`/events/${id}?payment=success`);
                return;
              }

              if (pollCount < pollLimit) {
                pollCount++;
                setTimeout(pollOrderStatus, pollDelay);
              } else {
                throw new Error("Payment verification timed out");
              }
            };

            pollOrderStatus();
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed");
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: user?.fullName || undefined,
          email: user?.primaryEmailAddress?.emailAddress || undefined,
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to process your purchase");
      setProcessingPayment(false);
    }
  };

  if (!isSignedIn) {
    redirect(`/events/${id}`);
    return null;
  }

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
          The event you&aposre looking for doesn&apost exist or you don&apost have
          permission to view it.
        </p>
        <Button className="mt-4" onClick={() => redirect("/events")}>
          Back to Events
        </Button>
      </div>
    );
  }

  const items =
    orderType === "TICKET"
      ? event.tickets
      : userRole === "SPONSOR"
        ? event.packages
        : [];
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
          onClick={() => redirect(`/events/${id}`)}
        >
          ← Back to Event
        </Button>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {orderType === "TICKET" ? "Purchase Tickets" : "Sponsor Event"}
          </h1>

          {userRole === "SPONSOR" && (
            <div className="flex gap-4">
              <Button
                variant={orderType === "TICKET" ? "default" : "outline"}
                onClick={() => {
                  setPurchaseType("TICKET");
                  setSelectedItems(
                    event.tickets.map(({ id }) => ({ id, quantity: 0 }))
                  );
                }}
              >
                Buy Tickets
              </Button>
              <Button
                variant={orderType === "PACKAGE" ? "default" : "outline"}
                onClick={() => {
                  setPurchaseType("PACKAGE");
                  setSelectedItems(
                    event.packages.map(({ id }) => ({ id, quantity: 0 }))
                  );
                }}
              >
                Purchase Packages
              </Button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {items.map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex flex-col space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="text-gray-600">
                      {item.price} {currency}
                    </p>
                    {orderType === "PACKAGE" && (
                      <div className="mt-2">
                        <strong className="text-sm">Benefits:</strong>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-600">
                    {item.quantity - item.sold - item.reserved} available
                  </p>

                  <div className="flex items-center gap-4">
                    <Label
                      htmlFor={`quantity-${item.id}`}
                      className="flex-none"
                    >
                      Quantity:
                    </Label>
                    <Input
                      id={`quantity-${item.id}`}
                      type="number"
                      min={0}
                      max={item.quantity - item.sold - item.reserved}
                      value={
                        selectedItems.find((si) => si.id === item.id)
                          ?.quantity || 0
                      }
                      onChange={(e) =>
                        handleQuantityChange(item.id, e.target.value)
                      }
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
                  .filter((item) => item.quantity > 0)
                  .map((item) => {
                    const itemDetails = items.find((i) => i.id === item.id);
                    return (
                      <div key={item.id} className="flex justify-between">
                        <span>
                          {itemDetails?.title} × {item.quantity}
                        </span>
                        <span>
                          {(itemDetails?.price || 0) * item.quantity} {currency}
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
                  {processingPayment 
                    ? <Loading />
                    : `Pay ${total} ${currency}`}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
