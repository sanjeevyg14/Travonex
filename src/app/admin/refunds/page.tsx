
/**
 * @fileoverview Admin Standalone Refund Management Page
 * 
 * @description
 * This page provides a dedicated interface for Superadmins to manage and process all refund requests.
 * It's designed to streamline the financial operations related to cancellations.
 * 
 * @developer_notes
 * - **Data Fetching**: Fetches all bookings with `status: 'Cancelled'`. The backend API at
 *   `GET /api/admin/refunds` should join with user data to display names and cancellation reasons.
 * - **State Management**: Client component to manage dialog states for refund processing.
 * - **API Integration**:
 *   - "Process Refund": Triggers `PATCH /api/admin/bookings/{id}/refund` with payment details.
 *   - Backend should update the booking's `refundStatus` to 'Processed' and store UTR, payment mode, etc.
 *   - An audit log should be created for every refund processed.
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
import type { Booking } from "@/lib/types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/datepicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { RotateCcw } from "lucide-react";

// DEV_COMMENT: A dedicated component for the refund processing dialog.
function ProcessRefundDialog({ booking, onRefundProcessed }: { booking: Booking, onRefundProcessed: (bookingId: string) => void }) {
    const { toast } = useToast();
    const [open, setOpen] = React.useState(false);
    const [paymentMode, setPaymentMode] = React.useState('');
    const [utrNumber, setUtrNumber] = React.useState('');
    const [paidDate, setPaidDate] = React.useState<Date | undefined>(new Date());

    const handleProcessRefund = () => {
        // DEV_COMMENT: API Integration Point for processing a refund.
        // This should call `PATCH /api/admin/bookings/{booking.id}/refund` with the refund details.
        console.log("Processing refund for booking:", booking.id, { paymentMode, utrNumber, paidDate });
        onRefundProcessed(booking.id);
        toast({ title: "Refund Processed", description: `Refund for booking ${booking.id} has been marked as processed.` });
        setOpen(false);
    }
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm">Process Refund</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                 <DialogHeader>
                    <DialogTitle>Process Refund for Booking {booking.id}</DialogTitle>
                    <DialogDescription>
                        Confirm payment details for the refund amount of ₹{booking.amount}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                     <div className="space-y-2">
                        <Label htmlFor="payment-mode">Payment Mode</Label>
                        <Select value={paymentMode} onValueChange={setPaymentMode}>
                            <SelectTrigger id="payment-mode"><SelectValue placeholder="Select payment mode" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="IMPS">IMPS</SelectItem>
                                <SelectItem value="NEFT">NEFT</SelectItem>
                                <SelectItem value="UPI">UPI</SelectItem>
                                <SelectItem value="Manual">Manual</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="utr">UTR / Reference Number</Label>
                        <Input id="utr" value={utrNumber} onChange={(e) => setUtrNumber(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="transfer-date">Date of Transfer</Label>
                        <DatePicker date={paidDate} setDate={setPaidDate} />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" onClick={handleProcessRefund} disabled={!paymentMode || !utrNumber || !paidDate}>Mark as Processed</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function AdminRefundsPage() {
  // BACKEND: Fetch from `GET /api/admin/refunds` or `GET /api/bookings?status=Cancelled`
  const [bookings, setBookings] = React.useState<Booking[]>(mockBookings.filter(b => b.status === 'Cancelled'));
  
  const handleRefundProcessed = (bookingId: string) => {
    setBookings(currentBookings => 
        currentBookings.map(b => 
            b.id === bookingId ? { ...b, refundStatus: 'Processed' } : b
        )
    );
  };

  const pendingRefunds = bookings.filter(b => b.refundStatus === 'Pending');

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
          Refund Management
        </h1>
        <p className="text-lg text-muted-foreground">
          Process and track all refund requests for cancelled bookings.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Pending Refunds</CardTitle>
          <CardDescription>A list of all cancelled bookings awaiting refund processing.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Reason for Cancellation</TableHead>
                <TableHead>Refund Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingRefunds.length > 0 ? pendingRefunds.map((booking) => {
                const user = users.find(u => u.id === booking.userId);
                
                return (
                    <TableRow key={booking.id}>
                    <TableCell className="font-mono text-xs">{booking.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{user?.name || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">{user?.phone || 'N/A'}</div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground italic">
                      "{booking.cancellationReason || 'No reason provided.'}"
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{booking.refundStatus}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                        ₹{booking.amount.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-right">
                         <ProcessRefundDialog booking={booking} onRefundProcessed={handleRefundProcessed} />
                    </TableCell>
                    </TableRow>
                )
              }) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                            <RotateCcw className="h-10 w-10 text-muted-foreground" />
                            <span>No pending refunds. All caught up!</span>
                        </div>
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
