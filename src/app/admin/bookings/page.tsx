
/**
 * @fileoverview Admin Bookings Management Page
 * 
 * @description
 * This page provides a comprehensive overview of all bookings on the platform.
 * Admins can view detailed booking information. Refund processing has been moved to a dedicated page.
 * 
 * @developer_notes
 * - **State Management**: Now a client component to manage dialog states for viewing details.
 * - **API Integration**:
 *   - "View Details": Fetches full booking context from `GET /api/admin/bookings/{id}`.
 *   - Refunds are now managed on the `/admin/refunds` page.
 */
"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { bookings as mockBookings, trips, users } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { Booking, Trip } from "@/lib/types";
import { Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { ClientOnlyDate } from "@/components/common/ClientOnlyDate";


// Helper function to get badge colors based on booking status
const getBookingStatusBadgeClass = (status: Booking['status']) => {
  switch (status) {
    case 'Confirmed': return 'bg-blue-600';
    case 'Completed': return 'bg-green-600';
    case 'Cancelled': return 'bg-red-600';
    case 'Pending': return 'bg-amber-500';
    default: return 'bg-gray-500';
  }
}

// Helper function to get badge colors based on refund status
const getRefundStatusBadgeClass = (status?: Booking['refundStatus']) => {
    switch (status) {
      case 'Processed': return 'bg-green-600';
      case 'Pending': return 'bg-amber-500';
      default: return 'invisible'; // Don't show a badge if status is 'None' or undefined
    }
}


// DEV_COMMENT: A dedicated dialog to view booking details.
function BookingDetailsDialog({ booking, trip }: { booking: Booking; trip: Trip | undefined; }) {
    const [isOpen, setIsOpen] = React.useState(false);

    if (!trip) return null;

    const batch = trip.batches.find(b => b.id === booking.batchId);
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="mr-2">View</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Booking Details: {booking.id}</DialogTitle>
                    <DialogDescription>{trip.title}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>Status:</span> <Badge>{booking.status}</Badge></div>
                        <div className="flex justify-between"><span>Booking Date:</span> <ClientOnlyDate dateString={booking.bookingDate} type="date" /></div>
                        <div className="flex justify-between"><span>Trip Dates:</span> <span>{batch ? <><ClientOnlyDate dateString={batch.startDate} type="date"/> - <ClientOnlyDate dateString={batch.endDate} type="date" /></> : 'N/A'}</span></div>
                    </div>
                    
                    {/* BACKEND: This card's data should be sourced directly from the booking record, which should store the final pricing breakdown. */}
                    <Card>
                        <CardHeader className="p-4">
                            <CardTitle className="text-base">Payment Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal:</span> 
                                <span>₹{booking.subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            {booking.couponDiscount && booking.couponDiscount > 0 ? (
                                <div className="flex justify-between text-green-600">
                                    <span>Coupon ({booking.couponCodeUsed}):</span>
                                    <span>- ₹{booking.couponDiscount.toLocaleString('en-IN')}</span>
                                </div>
                            ) : null}
                             {booking.walletAmountUsed && booking.walletAmountUsed > 0 ? (
                                <div className="flex justify-between text-green-600">
                                    <span>Wallet Credit Used:</span>
                                    <span>- ₹{booking.walletAmountUsed.toLocaleString('en-IN')}</span>
                                </div>
                            ) : null}
                            {booking.taxAmount && booking.taxAmount > 0 ? (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Taxes & Fees:</span>
                                    <span>+ ₹{booking.taxAmount.toLocaleString('en-IN')}</span>
                                </div>
                            ) : null}
                            <div className="flex justify-between font-bold border-t pt-2 mt-2">
                                <span>Total Paid:</span> 
                                <span>₹{booking.amount.toLocaleString('en-IN')}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Payment Mode:</span> 
                                <span className="font-medium">{booking.paymentMode || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Transaction ID:</span> 
                                <span className="font-mono text-xs">{booking.transactionId || 'N/A'}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><Users className="h-4 w-4"/> Travelers ({booking.travelers.length})</h4>
                        <div className="space-y-2 rounded-lg border p-3 text-sm">
                        {booking.travelers.map((traveler, index) => (
                            <div key={index} className="flex justify-between">
                                <span>{traveler.name}</span>
                                <span className="text-muted-foreground">{traveler.phone}</span>
                            </div>
                        ))}
                        </div>
                    </div>
                     {booking.status === 'Cancelled' && (
                        <div>
                            <h4 className="font-semibold mb-2">Refund Status</h4>
                            <p className="text-sm p-3 rounded-lg bg-muted/50">Status: <Badge variant={booking.refundStatus === 'Pending' ? 'secondary' : booking.refundStatus === 'Processed' ? 'default' : 'outline'}>{booking.refundStatus}</Badge></p>
                        </div>
                     )}
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export default function AdminBookingsPage() {
  const [bookings, setBookings] = React.useState<Booking[]>(mockBookings);
  
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
          Booking Management
        </h1>
        <p className="text-lg text-muted-foreground">
          View all bookings, manage statuses, and track refunds.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>A complete list of all bookings on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Trip Details</TableHead>
                <TableHead className="text-center">Guests</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length > 0 ? bookings.map((booking) => {
                const trip = trips.find(t => t.id === booking.tripId);
                const user = users.find(u => u.id === booking.userId);
                const batch = trip?.batches.find(b => b.id === booking.batchId);
                
                return (
                    <TableRow key={booking.id}>
                    <TableCell className="font-mono text-xs">{booking.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{user?.name || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">{user?.phone || 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{trip?.title || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">
                        {batch ? <ClientOnlyDate dateString={batch.startDate} type="date" /> : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">{booking.travelers.length}</TableCell>
                    <TableCell>
                        <div className="flex flex-col items-start gap-1">
                            <Badge variant={'default'} className={cn('text-white', getBookingStatusBadgeClass(booking.status))}>
                                {booking.status}
                            </Badge>
                             <Badge variant={'default'} className={cn('text-white', getRefundStatusBadgeClass(booking.refundStatus))}>
                                Refund {booking.refundStatus}
                            </Badge>
                        </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                        ₹{booking.amount.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-right">
                        <BookingDetailsDialog booking={booking} trip={trip} />
                        {booking.status === 'Cancelled' && booking.refundStatus === 'Pending' && (
                            <Link href="/admin/refunds">
                                <Button variant="destructive" size="sm">Process Refund</Button>
                             </Link>
                        )}
                    </TableCell>
                    </TableRow>
                )
              }) : (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                        No bookings found.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
