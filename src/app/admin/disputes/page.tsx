/**
 * @fileoverview Admin Dispute Management Page
 *
 * @description
 * This page allows Superadmins to review and manage user-reported issues and disputes.
 * It is now a client component to handle the state of the details dialog.
 *
 * @developer_notes
 * - **State Management**: Uses `useState` to manage the selected dispute for the dialog.
 * - **API Integration**:
 *   - Fetch Disputes: `GET /api/admin/disputes` with joins on bookings, users, and organizers.
 *   - Update Dispute: `PATCH /api/admin/disputes/{disputeId}` to change status, add notes, etc.
 *   - The "Resolve" action should trigger this update and potentially notify the user.
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
import { disputes as mockDisputes, users, organizers, bookings } from "@/lib/mock-data";
import type { Dispute } from "@/lib/types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// DEV_COMMENT: Dedicated dialog to view dispute details and take action.
function DisputeDetailsDialog({ dispute, isOpen, onOpenChange }: { dispute: Dispute | null, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
    if (!dispute) return null;

    const user = users.find(u => u.id === dispute.userId);
    const organizer = organizers.find(o => o.id === dispute.organizerId);
    const booking = bookings.find(b => b.id === dispute.bookingId);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Dispute Details: {dispute.id}</DialogTitle>
                    <DialogDescription>
                        Review the issue reported by {user?.name} against {organizer?.name}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">User's Report</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{dispute.reason}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                             <CardTitle className="text-base">Booking Information</CardTitle>
                        </CardHeader>
                         <CardContent className="text-sm space-y-2">
                            <div className="flex justify-between"><span>Booking ID:</span> <span className="font-mono">{booking?.id}</span></div>
                            <div className="flex justify-between"><span>Booking Date:</span> <span>{booking?.bookingDate}</span></div>
                            <div className="flex justify-between"><span>Amount:</span> <span>₹{booking?.amount.toLocaleString('en-IN')}</span></div>
                        </CardContent>
                    </Card>
                     <div className="space-y-2">
                        <Label htmlFor="admin-notes">Internal Notes</Label>
                        <Textarea id="admin-notes" placeholder="Add internal notes for resolution..." />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                    <Button type="button" variant="secondary">Contact User</Button>
                    <Button type="submit">Mark as Resolved</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export default function AdminDisputesPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedDispute, setSelectedDispute] = React.useState<Dispute | null>(null);

  const handleViewDetails = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setIsDialogOpen(true);
  };

  return (
    <>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
            Dispute Management
          </h1>
          <p className="text-lg text-muted-foreground">
            Review and manage user-reported issues and disputes.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Disputes</CardTitle>
            <CardDescription>A list of all open and resolved disputes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Organiser</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Reported</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockDisputes.map((dispute) => {
                  const user = users.find(u => u.id === dispute.userId);
                  const organizer = organizers.find(o => o.id === dispute.organizerId);
                  return (
                      <TableRow key={dispute.id}>
                          <TableCell className="font-mono">{dispute.bookingId}</TableCell>
                          <TableCell>{user?.name}</TableCell>
                          <TableCell>{organizer?.name}</TableCell>
                          <TableCell>
                              <Badge variant={dispute.status === 'Open' ? 'destructive' : 'default'}>{dispute.status}</Badge>
                          </TableCell>
                          <TableCell>{dispute.dateReported}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => handleViewDetails(dispute)}>View Details</Button>
                          </TableCell>
                      </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <DisputeDetailsDialog dispute={selectedDispute} isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
