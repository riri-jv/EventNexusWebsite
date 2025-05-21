'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EventRevenue {
  id: string;
  ticketRevenue: number;
  sponsorRevenue: number;
  paid: number;
  event: {
    id: string;
    summary: string;
    organizer: {
      firstName: string;
      lastName: string;
    }
  }
}

export default function RevenuePage() {
  const [revenues, setRevenues] = useState<EventRevenue[]>([]);
  const [paidAmounts, setPaidAmounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialPaidAmounts = revenues.reduce((acc, revenue) => {
      acc[revenue.event.id] = revenue.paid;
      return acc;
    }, {} as Record<string, number>);
    setPaidAmounts(initialPaidAmounts);
  }, [revenues]);

  const updatePaidAmount = async (eventId: string, paid: number) => {
    try {
      const res = await fetch('/api/admin/revenue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId, paid }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      toast.success('Payment amount updated successfully');
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update paid amount');
    }
  };

  const handlePaidChange = (eventId: string, value: number) => {
    setPaidAmounts(prev => ({
      ...prev,
      [eventId]: value
    }));
  };

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/revenue');
      if (!res.ok) {
        throw new Error('Failed to fetch revenue data');
      }
      const data = await res.json();
      setRevenues(data.data);
      setError(null);
    } catch {
      setError('Failed to load revenue data');
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
            const totalRevenue = revenue.sponsorRevenue + revenue.ticketRevenue;
            const eventId = revenue.event.id;

            return (
              <TableRow key={revenue.id}>
                <TableCell>{revenue.event.summary}</TableCell>
                <TableCell>
                  {revenue.event.organizer.firstName} {revenue.event.organizer.lastName}
                </TableCell>
                <TableCell className="font-mono">{eventId}</TableCell>
                <TableCell>₹{revenue.sponsorRevenue}</TableCell>
                <TableCell>₹{revenue.ticketRevenue}</TableCell>
                <TableCell>₹{totalRevenue}</TableCell>
                <TableCell>
                  <Input 
                    type="number"
                    value={paidAmounts[eventId] ?? revenue.paid}
                    onChange={(e) => handlePaidChange(eventId, Number(e.target.value))}
                    className="w-24"
                  />
                </TableCell>
                <TableCell>
                  <Button 
                    onClick={() => updatePaidAmount(eventId, paidAmounts[eventId] ?? revenue.paid)}
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