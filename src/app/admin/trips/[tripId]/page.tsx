

/**
 * @fileoverview Admin Detailed Trip View & Management Page
 *
 * @description
 * This page provides a comprehensive, read-only view of a single trip, allowing admins
 * to review all details before taking action. It serves as the central control panel for
 * approving, rejecting, and managing individual trip listings.
 *
 * @developer_notes
 * - **Data Fetching**: The primary data should be fetched from `GET /api/admin/trips/{tripId}`.
 *   This endpoint should return the complete trip object, including nested arrays for batches,
 *   itinerary, etc., and related data like the organizer's name.
 * - **State Management**: Uses `useState` to manage local component state, such as dialog visibility
 *   and the content of the rejection reason textarea.
 * - **API Integration for Actions**:
 *   - `PATCH /api/admin/trips/{tripId}/status`: For changing the trip's status (e.g., to 'Published', 'Rejected').
 *   - `PATCH /api/admin/trips/{tripId}/feature`: For toggling the `isFeatured` flag.
 *   - `POST /api/admin/trips/{tripId}/notes`: For saving internal admin notes.
 * - **Error Handling**: Includes a `notFound()` call if the trip doesn't exist, which should be
 *   triggered by a 404 response from the backend API.
 */
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, notFound, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { Trip, TripBatch } from "@/lib/types";

import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Check, CheckCircle, Clock, FileText, HelpCircle, IndianRupee, Info, MapPin, ShieldCheck, Star, UserCheck, Users, X, XCircle, History, Edit, Eye } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClientOnlyDate } from "@/components/common/ClientOnlyDate";

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

const getBatchStatusBadgeClass = (status: TripBatch['status']) => {
    switch (status) {
        case 'Active': return 'bg-green-600';
        case 'Inactive': return 'bg-slate-500';
        case 'Pending Approval': return 'bg-amber-500';
        case 'Rejected': return 'bg-red-600';
        default: return 'bg-gray-500';
    }
}


export default function AdminTripDetailPage() {
    const params = useParams<{ tripId: string }>();
    const router = useRouter();
    const { toast } = useToast();
    const [trip, setTrip] = React.useState<Trip | null>(null);
    const [organizer, setOrganizer] = React.useState<any>(null);

    useEffect(() => {
        fetch(`/api/admin/trips/${params.tripId}`)
            .then(res => {
                if (!res.ok) { notFound(); }
                return res.json();
            })
            .then((data) => {
                setTrip(data);
                return fetch(`/api/admin/organizers/${data.organizerId}`);
            })
            .then(res => res.ok ? res.json() : null)
            .then(setOrganizer)
            .catch(() => setTrip(null));
    }, [params.tripId]);
    const [rejectionReason, setRejectionReason] = React.useState("");
    const [isRejectDialogOpen, setIsRejectDialogOpen] = React.useState(false);


    if (!trip) {
        return <div className="p-4">Loading...</div>;
    }

    const handleStatusChange = (newStatus: Trip['status']) => {
        // BACKEND: Call `PATCH /api/admin/trips/{trip.id}` with { status: newStatus }
        setTrip(prev => ({ ...prev, status: newStatus }));
        toast({ title: "Trip Status Updated", description: `The trip has been marked as ${newStatus}.` });
        if (newStatus === 'Rejected') {
            setIsRejectDialogOpen(false);
        }
    };

    const handleRejectSubmit = () => {
        if (!rejectionReason) {
            toast({ variant: 'destructive', title: "Reason Required", description: "Please provide a reason for rejection."});
            return;
        }
        // BACKEND: The PATCH call would also include `{ adminNotes: rejectionReason }`
        console.log("Rejection Reason:", rejectionReason);
        handleStatusChange('Rejected');
        // TODO: Backend should trigger an email to the organizer with the rejection reason.
    }
    
    // DEV_COMMENT: This function handles the logic for featuring a trip.
    // Toggling this switch on will make the trip appear on the homepage's "Featured Trips" section.
    const handleFeatureToggle = (isFeatured: boolean) => {
        // BACKEND: Call `PATCH /api/admin/trips/{trip.id}` with { isFeatured }
        setTrip(prev => ({...prev, isFeatured}));
        toast({ title: "Featured Status Updated" });
    };
    
    const handleBannerToggle = (isBanner: boolean) => {
        // BACKEND: Call `PATCH /api/admin/trips/{trip.id}` with { isBannerTrip: isBanner }
        setTrip(prev => ({...prev, isBannerTrip: isBanner}));
        toast({ title: "Homepage Banner Status Updated" });
    }

    const incompleteSections = [];
    if (!trip.image) incompleteSections.push('Cover Image');
    if (trip.gallery.length < 5) incompleteSections.push('At least 5 Gallery Images');
    if (trip.batches.length === 0) incompleteSections.push('At least one Batch');
    if (trip.itinerary.length === 0) incompleteSections.push('Itinerary');

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
                <div>
                    <h1 className="text-3xl font-headline font-bold tracking-tight">{trip.title}</h1>
                    <p className="text-muted-foreground">Reviewing trip by <Link href={`/admin/trip-organisers/${organizer?.id}`} className="font-medium text-primary hover:underline">{organizer?.name}</Link></p>
                </div>
            </div>

            {incompleteSections.length > 0 && trip.status === 'Pending Approval' && (
                 <Alert variant="destructive">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Incomplete Listing</AlertTitle>
                    <AlertDescription>
                        This trip cannot be approved because the following sections are incomplete: {incompleteSections.join(', ')}. Please reject with feedback for the organizer.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info Card */}
                    <Card>
                        <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div className="space-y-1 p-3 bg-muted/50 rounded-lg"><p className="text-xs text-muted-foreground">Duration</p><p className="font-semibold">{trip.duration}</p></div>
                                <div className="space-y-1 p-3 bg-muted/50 rounded-lg"><p className="text-xs text-muted-foreground">Difficulty</p><p className="font-semibold">{trip.difficulty}</p></div>
                                <div className="space-y-1 p-3 bg-muted/50 rounded-lg"><p className="text-xs text-muted-foreground">Age Group</p><p className="font-semibold">{trip.minAge} - {trip.maxAge} yrs</p></div>
                                <div className="space-y-1 p-3 bg-muted/50 rounded-lg"><p className="text-xs text-muted-foreground">Category</p><p className="font-semibold">{trip.tripType}</p></div>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Description</h4>
                                <p className="text-sm text-muted-foreground">{trip.description}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Batches Card */}
                    <Card>
                        <CardHeader><CardTitle>Batches / Departures</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Dates</TableHead><TableHead>Price</TableHead><TableHead>Capacity</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {trip.batches.map(batch => (
                                        <TableRow key={batch.id}>
                                            <TableCell><ClientOnlyDate dateString={batch.startDate} type="date" /> - <ClientOnlyDate dateString={batch.endDate} type="date" /></TableCell>
                                            <TableCell>₹{batch.priceOverride?.toLocaleString() ?? trip.price.toLocaleString()}</TableCell>
                                            <TableCell>{batch.availableSlots}/{batch.maxParticipants}</TableCell>
                                            <TableCell><Badge className={getBatchStatusBadgeClass(batch.status)}>{batch.status}</Badge></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    
                    {/* Itinerary Card */}
                    <Card>
                        <CardHeader><CardTitle>Itinerary</CardTitle></CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                {trip.itinerary.map(item => (
                                    <AccordionItem value={`day-${item.day}`} key={item.day}>
                                        <AccordionTrigger>Day {item.day}: {item.title}</AccordionTrigger>
                                        <AccordionContent>{item.description}</AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>

                    {/* Policies & FAQs */}
                    <Card>
                         <CardHeader><CardTitle>Policies & FAQs</CardTitle></CardHeader>
                         <CardContent>
                             <h4 className="font-semibold mb-2">Cancellation Policy</h4>
                             <p className="text-sm text-muted-foreground mb-4">{trip.cancellationPolicy}</p>
                             <h4 className="font-semibold mb-2">FAQs</h4>
                              <Accordion type="single" collapsible className="w-full">
                                {trip.faqs.map((faq, index) => (
                                <AccordionItem key={index} value={`item-${index}`}>
                                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                                    <AccordionContent>{faq.answer}</AccordionContent>
                                </AccordionItem>
                                ))}
                            </Accordion>
                         </CardContent>
                    </Card>

                    {/* DEV_COMMENT: START - Change Log Card */}
                    {/* This card displays the audit trail of changes made to the trip. */}
                    {/* BACKEND: Fetch this from `GET /api/trips/{tripId}/changelog` */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="h-5 w-5" />
                                Trip &amp; Batch Change Log
                            </CardTitle>
                            <CardDescription>An audit trail of all modifications made by the organizer and admins.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date &amp; Time</TableHead>
                                        <TableHead>Changed By</TableHead>
                                        <TableHead>Section</TableHead>
                                        <TableHead>Remarks</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {trip.changeLogs && trip.changeLogs.length > 0 ? (
                                        trip.changeLogs.map(log => (
                                            <TableRow key={log.id}>
                                                <TableCell className="text-xs">
                                                    <ClientOnlyDate dateString={log.timestamp} />
                                                </TableCell>
                                                <TableCell>{log.changedBy}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{log.section}</Badge>
                                                </TableCell>
                                                <TableCell className="text-sm italic">
                                                    "{log.remarks}"
                                                    <p className="text-xs text-muted-foreground not-italic mt-1">{log.changedFields}</p>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                No changes have been logged for this trip yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    {/* DEV_COMMENT: END - Change Log Card */}
                </div>
                
                <div className="lg:col-span-1 space-y-8 sticky top-24">
                    {/* Action Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Status</span>
                                <Badge className={getStatusBadgeClass(trip.status)}>{trip.status}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                             {trip.status === 'Pending Approval' && (
                                <div className="space-y-2">
                                    <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange('Published')} disabled={incompleteSections.length > 0}><CheckCircle className="mr-2"/>Approve &amp; Publish</Button>
                                    <Button variant="destructive" className="w-full" onClick={() => setIsRejectDialogOpen(true)}><XCircle className="mr-2"/>Reject</Button>
                                </div>
                             )}
                              {trip.status === 'Published' && (
                                <Button variant="secondary" className="w-full" onClick={() => handleStatusChange('Unlisted')}>Pause / Unlist Trip</Button>
                              )}
                               {trip.status === 'Unlisted' && (
                                <Button className="w-full" onClick={() => handleStatusChange('Published')}>Re-Publish Trip</Button>
                              )}
                            <div className="flex gap-2 pt-2">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`/admin/trips/${trip.id}/edit`}><Edit className="mr-2"/> Edit Trip</Link>
                                </Button>
                                <Button variant="ghost" className="w-full" asChild>
                                     <Link href={`/trips/${trip.slug}`} target="_blank" rel="noopener noreferrer"><Eye className="mr-2"/> Preview as User</Link>
                                </Button>
                            </div>
                        </CardContent>
                         <CardFooter className="pt-4 border-t flex flex-col gap-4">
                            {/* DEV_COMMENT: This is a critical admin control. Toggling this on makes the trip eligible for the "Featured Trips" section on the homepage. */}
                            <div className="w-full flex items-center justify-between">
                                <Label htmlFor="featured-switch" className="font-medium">Mark as Featured</Label>
                                <Switch id="featured-switch" checked={trip.isFeatured} onCheckedChange={handleFeatureToggle} />
                            </div>
                            <div className="w-full flex items-center justify-between">
                                <Label htmlFor="banner-switch" className="font-medium">Show in Homepage Banner</Label>
                                <Switch id="banner-switch" checked={trip.isBannerTrip} onCheckedChange={handleBannerToggle} />
                            </div>
                        </CardFooter>
                    </Card>

                     {/* Admin Notes Card */}
                    <Card>
                        <CardHeader><CardTitle>Admin Notes</CardTitle><CardDescription>Internal notes for this trip. Not visible to the organizer.</CardDescription></CardHeader>
                        <CardContent>
                             <Textarea placeholder="Add notes for the team..." defaultValue={trip.adminNotes} />
                        </CardContent>
                        <CardFooter><Button size="sm">Save Note</Button></CardFooter>
                    </Card>

                    {/* Audit Log Card */}
                    <Card>
                        <CardHeader><CardTitle>Audit Log</CardTitle></CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            <p><strong>Approved by:</strong> Super Admin on Jul 20, 2024</p>
                            <p><strong>Created by:</strong> {organizer?.name} on Jul 19, 2024</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Rejection</DialogTitle>
                        <DialogDescription>Please provide a reason for rejecting this trip. This will be sent to the organizer.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="rejection-reason">Rejection Reason</Label>
                        <Textarea id="rejection-reason" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="e.g., The gallery images are low quality. Please upload high-resolution photos." />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleRejectSubmit}>Confirm &amp; Send Feedback</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    )
}
