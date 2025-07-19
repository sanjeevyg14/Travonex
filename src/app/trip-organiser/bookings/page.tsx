
/**
 * @fileoverview Trip Organizer Bookings Management Page
 * 
 * @description
 * This page provides Trip Organizers with a comprehensive view of all bookings for their trips.
 * It's designed for viewing booking details, participant lists, payment status, and cancellation reasons.
 * 
 * @developer_notes
 * - Fetches all bookings related to the currently logged-in organizer.
 * - Uses an Accordion component to display high-level booking info with an expandable section for detailed traveler lists.
 * - API Integration: `GET /api/organizers/me/bookings` should be the endpoint to fetch this data.
 *   The backend should join data from trips and users to populate the necessary fields.
 */
"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Users as UsersIcon, Calendar, User, Mail, Phone, Info } from "lucide-react";
import type { Booking } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientOnlyDate } from "@/components/common/ClientOnlyDate";

// Mock organizer ID for demonstration purposes.
const MOCK_ORGANIZER_ID = 'VND001';

const BookingsSkeleton = () => (
    <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-md" />
        ))}
    </div>
);


export default function OrganizerBookingsPage() {
    const [organizerBookings, setOrganizerBookings] = React.useState<Booking[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const res = await fetch('/api/organizers/me/bookings');
                if (!res.ok) throw new Error('Failed to load');
                const data = await res.json();
                setOrganizerBookings(data);
            } catch (err) {
                console.error('Bookings fetch error:', err);
                setError('Failed to load bookings');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
          Bookings
        </h1>
        <p className="text-lg text-muted-foreground">
          View and manage all bookings for your trips.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>A complete list of all bookings for your trips, including participant details.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <BookingsSkeleton />
          ) : error ? (
            <p className="text-red-600 text-center py-12">{error}</p>
          ) : organizerBookings.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {organizerBookings.map((booking) => {
                return (
                  <AccordionItem value={booking.id} key={booking.id}>
                    <AccordionTrigger className="hover:bg-muted/50 px-4 rounded-md">
                        <div className="flex items-center justify-between w-full text-sm">
                            <div className="flex items-center gap-4">
                                <UsersIcon className="h-5 w-5 text-primary" />
                                <div className="text-left">
                                    <p className="font-semibold">{booking.user?.name}</p>
                                    <p className="text-muted-foreground">{booking.trip?.title}</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-4 md:gap-6">
                                <div className="hidden md:flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span><ClientOnlyDate dateString={booking.bookingDate} type="date" /></span>
                                </div>
                                 <div className="flex flex-col items-end">
                                    <div className="font-mono font-semibold">
                                        ₹{booking.amount.toLocaleString('en-IN')}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Amount Paid</p>
                                </div>
                                <Badge variant={booking.status === 'Confirmed' ? 'secondary' : booking.status === 'Completed' ? 'default' : 'destructive'}>{booking.status}</Badge>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 bg-muted/20 space-y-4">
                        {booking.status === 'Cancelled' && booking.cancellationReason && (
                            <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200 flex items-start gap-3">
                                <Info className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-sm text-yellow-800">Reason for Cancellation:</p>
                                    <p className="text-sm text-yellow-700 italic">"{booking.cancellationReason}"</p>
                                </div>
                            </div>
                        )}
                        <h4 className="font-semibold">Participant Details ({booking.travelers.length} traveler{booking.travelers.length > 1 ? 's' : ''})</h4>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {booking.travelers.map((traveler, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground"/> {traveler.name}</TableCell>
                                        <TableCell className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground"/>{traveler.email}</TableCell>
                                        <TableCell className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground"/>{traveler.phone}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No bookings found for your trips yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
