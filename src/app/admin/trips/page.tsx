
/**
 * @fileoverview Admin Trips Management Page (Dashboard View)
 *
 * @description
 * This page provides Superadmins with a high-level, tabbed dashboard to manage all trips.
 * It's designed for quick filtering, bulk actions, and navigating to detailed trip views.
 *
 * @developer_notes
 * - **State Management**: Uses `useState` to manage the list of trips for this prototype. In a real app, this would be powered by a data fetching library (e.g., React Query) with API calls that pass the current tab's status as a filter.
 * - **API Integration**:
 *   - Each tab should trigger a filtered API call: `GET /api/admin/trips?status={status}`.
 *   - Quick actions in the dropdown should trigger corresponding API endpoints: `PATCH /api/admin/trips/{tripId}/status`.
 * - **Navigation**: The "View Details" action links to the new dedicated trip detail page at `/admin/trips/{tripId}`.
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { trips as mockTrips, organizers } from "@/lib/mock-data";
import type { Trip } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, CheckCircle, XCircle, PauseCircle, Edit, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const getStatusBadgeClass = (status: Trip['status']) => {
    switch (status) {
        case 'Published': return 'bg-green-600';
        case 'Pending Approval': return 'bg-amber-500';
        case 'Rejected': return 'bg-red-600';
        case 'Unlisted': return 'bg-slate-500';
        case 'Draft': return 'bg-gray-400';
        default: return 'bg-gray-500';
    }
}

export default function AdminTripsListPage() {
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  const { toast } = useToast();

  const handleStatusChange = (tripId: string, newStatus: Trip['status']) => {
    // DEV_COMMENT: Simulates an API call to update the trip's status.
    setTrips(currentTrips =>
      currentTrips.map(trip =>
        trip.id === tripId ? { ...trip, status: newStatus } : trip
      )
    );
    toast({
      title: "Trip Status Updated",
      description: `The trip has been marked as ${newStatus}.`,
    });
  };

  const renderTripsTable = (filteredTrips: Trip[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Trip Title</TableHead>
          <TableHead>Organizer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Featured</TableHead>
          <TableHead>Next Batch</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredTrips.length > 0 ? filteredTrips.map(trip => {
          const organizer = organizers.find(o => o.id === trip.organizerId);
          const nextBatch = trip.batches.filter(b => new Date(b.startDate) > new Date()).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];
          return (
            <TableRow key={trip.id}>
              <TableCell className="font-medium">{trip.title}</TableCell>
              <TableCell>{organizer?.name || 'N/A'}</TableCell>
              <TableCell><Badge className={getStatusBadgeClass(trip.status)}>{trip.status}</Badge></TableCell>
              <TableCell>
                {trip.isFeatured && <Star className="h-5 w-5 text-amber-400 fill-current" />}
              </TableCell>
              <TableCell>{nextBatch ? new Date(nextBatch.startDate).toLocaleDateString() : 'N/A'}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild><Link href={`/admin/trips/${trip.id}`} className="flex items-center w-full cursor-pointer"><Eye className="mr-2"/> View Details</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href={`/admin/trips/${trip.id}/edit`} className="flex items-center w-full cursor-pointer"><Edit className="mr-2"/> Edit Trip</Link></DropdownMenuItem>
                    {trip.status === 'Pending Approval' && (
                        <>
                            <DropdownMenuItem onClick={() => handleStatusChange(trip.id, 'Published')}><CheckCircle className="mr-2"/> Approve</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(trip.id, 'Rejected')} className="text-destructive"><XCircle className="mr-2"/> Reject</DropdownMenuItem>
                        </>
                    )}
                    {trip.status === 'Published' && (
                        <DropdownMenuItem onClick={() => handleStatusChange(trip.id, 'Unlisted')}><PauseCircle className="mr-2"/> Pause / Unlist</DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        }) : (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center">No trips found for this status.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  const statuses: Trip['status'][] = ['Published', 'Draft', 'Pending Approval', 'Rejected', 'Unlisted'];

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
          Trip Management
        </h1>
        <p className="text-lg text-muted-foreground">
          Oversee and manage all trip listings and their batches on the platform.
        </p>
      </div>
      <Card>
        <Tabs defaultValue="all">
          <CardHeader>
            <CardTitle>All Trips</CardTitle>
            <CardDescription>Review, approve, and manage all trip listings.</CardDescription>
            <TabsList className="mt-4">
              <TabsTrigger value="all">All Trips</TabsTrigger>
              {statuses.map(status => (
                 <TabsTrigger key={status} value={status}>{status === 'Unlisted' ? 'Paused' : status}</TabsTrigger>
              ))}
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent value="all">
              {renderTripsTable(trips)}
            </TabsContent>
            {statuses.map(status => (
                <TabsContent key={status} value={status}>
                    {renderTripsTable(trips.filter(t => t.status === status))}
                </TabsContent>
            ))}
          </CardContent>
        </Tabs>
      </Card>
    </main>
  );
}
