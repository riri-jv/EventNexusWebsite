"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Event, EventRevenue, User } from "@prisma/client";

type EventRevenueWithEvent = EventRevenue & {
  event: Event & {
    organizer: User
  };
};

// interface EventRevenue {
//   id: string;
//   ticketRevenueCents: number;
//   sponsorRevenue: number;
//   paid: number;
//   event: {
//     id: string;
//     summary: string;
//     organizer: {
//       firstName: string;
//       lastName: string;
//     }
//   }
// }

export default function RevenuePage() {
  const [revenues, setRevenues] = useState<EventRevenueWithEvent[]>([]);
  const [paidAmounts, setPaidAmounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialPaidAmounts = revenues.reduce((acc, revenue) => {
      acc[revenue.event.id] = revenue.paidCents;
      return acc;
    }, {} as Record<string, number>);
    setPaidAmounts(initialPaidAmounts);
  }, [revenues]);

  const updatePaidAmount = async (eventId: string, paidCents: number) => {
    try {
      const res = await fetch("/api/admin/revenue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId, paidCents }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      toast.success("Payment amount updated successfully");
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update paid amount");
    }
  };

  const handlePaidChange = (eventId: string, value: number) => {
    setPaidAmounts(prev => ({
      ...prev,
      [eventId]: value * 100
    }));
  };

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/revenue");
      if (!res.ok) {
        throw new Error("Failed to fetch revenue data");
      }
      const { data } = await res.json();
      setRevenues(data);
      setError(null);
    } catch {
      setError("Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Revenue Management</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event Summary</TableHead>
            <TableHead>Organizer</TableHead>
            <TableHead>Event ID</TableHead>
            <TableHead>Sponsorship Revenue</TableHead>
            <TableHead>Ticket Revenue</TableHead>
            <TableHead>Total Revenue</TableHead>
            <TableHead>Paid Amount</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {revenues.map((revenue) => {
            const totalRevenue = (revenue.packageRevenueCents + revenue.ticketRevenueCents) / 100;
            const eventId = revenue.event.id;

            return (
              <TableRow key={revenue.id}>
                <TableCell>{revenue.event.summary}</TableCell>
                <TableCell>
                  {revenue.event.organizer.firstName} {revenue.event.organizer.lastName}
                </TableCell>
                <TableCell className="font-mono">{eventId}</TableCell>
                <TableCell>₹{(revenue.packageRevenueCents) / 100}</TableCell>
                <TableCell>₹{(revenue.ticketRevenueCents) / 100}</TableCell>
                <TableCell>₹{totalRevenue}</TableCell>
                <TableCell>
                  <Input 
                    type="number"
                    value={(paidAmounts[eventId] ?? revenue.paidCents)/ 100}
                    onChange={(e) => handlePaidChange(eventId, Number(e.target.value))}
                    className="w-24"
                    step={0.01}
                  />
                </TableCell>
                <TableCell>
                  <Button 
                    onClick={() => updatePaidAmount(eventId, paidAmounts[eventId] ?? revenue.paidCents)}
                    variant="outline"
                    size="sm"
                  >
                    Update
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}