
"use client";

import Link from "next/link";
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
import { PlusCircle, Edit, Eye, Lock, Loader2 } from "lucide-react";

import type { Trip } from "@/lib/types";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientOnlyDate } from "@/components/common/ClientOnlyDate";



const getStatusBadgeVariant = (status: Trip['status']) => {
    switch (status) {
        case 'Published': return 'bg-green-600';
        case 'Pending Approval': return 'bg-amber-500';
        case 'Rejected': return 'bg-red-600';
        case 'Unlisted': return 'bg-slate-500';
        default: return 'bg-gray-500';
    }
}

const TripsTableSkeleton = () => (
    <>
        {Array.from({ length: 4 }).map((_, i) => (
            <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                <TableCell><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell className="space-x-2"><Skeleton className="h-8 w-8 inline-block" /><Skeleton className="h-8 w-8 inline-block" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
            </TableRow>
        ))}
    </>
);


export default function OrganizerTripsPage() {
  const [organizerTrips, setOrganizerTrips] = React.useState<Trip[]>([]);
  const [organizerBookings, setOrganizerBookings] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [tripsRes, bookingsRes] = await Promise.all([
          fetch('/api/organizers/me/trips'),
          fetch('/api/organizers/me/bookings'),
        ]);
        if (!tripsRes.ok || !bookingsRes.ok) throw new Error('Failed to load');
        const tripsData = await tripsRes.json();
        const bookingsData = await bookingsRes.json();
        setOrganizerTrips(tripsData);
        setOrganizerBookings(bookingsData);
      } catch (err) {
        console.error('Trips fetch error:', err);
        setError('Failed to load trips');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handlePauseToggle = (tripId: string, isPublished: boolean) => {
    // BACKEND: Call `PATCH /api/trips/{tripId}/status` with the new status
    setOrganizerTrips(prevTrips => 
        prevTrips.map(trip => 
            trip.id === tripId 
            ? { ...trip, status: isPublished ? 'Published' : 'Unlisted' }
            : trip
        )
    );
  };


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
            Your Trips
            </h1>
            <p className="text-lg text-muted-foreground">
                Create, manage, and track your travel listings.
            </p>
        </div>
        <Link href="/trip-organiser/trips/new">
          <Button size="lg">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Trip
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trip Listings</CardTitle>
          <CardDescription>A list of all your created trips.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead className="text-right">Live Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? <TripsTableSkeleton /> : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-red-600 py-6">{error}</TableCell>
                </TableRow>
              ) : organizerTrips.length > 0 ? organizerTrips.map((trip) => {
                const tripBookings = organizerBookings.filter(b => b.tripId === trip.id && b.status !== 'Cancelled');
                const totalCapacity = trip.batches.reduce((acc, batch) => acc + batch.maxParticipants, 0);
                const isEditable = trip.status === 'Draft' || trip.status === 'Published' || trip.status === 'Unlisted';
                const nextBatch = trip.batches.filter(b => new Date(b.startDate) > new Date()).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];
                return (
                    <TableRow key={trip.id}>
                    <TableCell className="font-medium">{trip.title}</TableCell>
                    <TableCell>
                        <Badge variant={'default'} className={getStatusBadgeVariant(trip.status)}>{trip.status}</Badge>
                        {trip.status === 'Rejected' && trip.adminNotes && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <p className="text-xs text-muted-foreground mt-1 cursor-pointer hover:text-foreground">Admin feedback available</p>
                                    </TooltipTrigger>
                                    <TooltipContent><p>{trip.adminNotes}</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </TableCell>
                    <TableCell>₹{trip.price.toLocaleString('en-IN')}</TableCell>
                    <TableCell>{tripBookings.length} / {totalCapacity || 'N/A'}</TableCell>
                    <TableCell className="space-x-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="inline-block">
                                        <Button variant="outline" size="icon" asChild disabled={!isEditable}>
                                            <Link href={`/trip-organiser/trips/${trip.id}/edit`}><Edit className="h-4 w-4" /></Link>
                                        </Button>
                                    </div>
                                </TooltipTrigger>
                                {!isEditable && <TooltipContent><p>Trip cannot be edited while it is {trip.status}.</p></TooltipContent>}
                            </Tooltip>
                        </TooltipProvider>
                        <Link href={`/trips/${trip.slug}`} target="_blank">
                            <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                        </Link>
                    </TableCell>
                    <TableCell className="text-right">
                       {trip.status === 'Published' || trip.status === 'Unlisted' ? (
                          <div className="flex items-center justify-end gap-2">
                            <Label htmlFor={`pause-switch-${trip.id}`} className="text-muted-foreground">
                              {trip.status === 'Published' ? 'Live' : 'Paused'}
                            </Label>
                            <Switch
                              id={`pause-switch-${trip.id}`}
                              checked={trip.status === 'Published'}
                              onCheckedChange={(isChecked) => handlePauseToggle(trip.id, isChecked)}
                              aria-label="Pause Trip"
                            />
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground flex items-center justify-end gap-1"><Lock className="h-3 w-3" /> Locked</span>
                        )}
                    </TableCell>
                    </TableRow>
                )
              }) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        You haven't created any trips yet.
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
