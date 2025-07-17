

/**
 * @fileoverview Public Trip Details Page
 * 
 * @description
 * This page displays all the public-facing details of a single trip. It is the main page
 * for users to learn about a trip and decide whether to book.
 * 
 * @developer_notes
 * - VISIBILITY LOGIC: This page should only be accessible for trips with a status of 'Published'.
 *   The `notFound()` function from Next.js is used to enforce this, which should be powered by
 *   backend logic that fetches a trip by its slug and status.
 * - BATCH DISPLAY: Only batches with a status of 'Active' (and approved by admin) should be displayed
 *   to the user as available for booking.
 * - DATA MASKING: All internal data like commission, payout estimates, organizer-private notes, etc.,
 *   should NOT be sent to this frontend component. The API (`GET /api/trips/slug/{slug}`) should only return
 *   publicly safe information.
 * - PERFORMANCE: This component has been converted to an async Server Component. Data is now fetched
 *   on the server, and a fully rendered page is sent to the client, significantly improving load times and LCP.
 */
import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Calendar, Users as UsersIcon, CheckCircle, Share2, Check, X, FileText, Clock, AlertTriangle, UserCheck, ShieldCheck } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ClientOnlyDate } from "@/components/common/ClientOnlyDate";


// DEV_COMMENT: Data fetching now happens on the server.
async function getTripData(slug: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/trips/slug/${slug}`);
    if (!res.ok) {
        return { trip: null, organizer: null };
    }
    const data = await res.json();
    return { trip: data, organizer: data.organizer };
}


export default async function TripDetailsPage({ params }: { params: { slug: string } }) {
  const { trip, organizer } = await getTripData(params.slug);

  if (!trip || !organizer) {
    notFound(); // Redirects to a 404 page if trip is not found or not published.
  }
  
  // --- DEV_COMMENT: START - Organizer Average Rating Calculation ---
  // This logic calculates the average rating for the organizer across all their trips.
  // In a real backend, this would likely be a pre-calculated field on the organizer's profile to improve performance.
  const organizerTrips: any[] = [];
  const allOrganizerReviews = organizerTrips.flatMap((t: any) => t.reviews || []);
  const totalRating = allOrganizerReviews.reduce((acc, review) => acc + review.rating, 0);
  const averageRating = allOrganizerReviews.length > 0 ? (totalRating / allOrganizerReviews.length).toFixed(1) : 'New';
  const reviewCount = allOrganizerReviews.length;
  // --- DEV_COMMENT: END - Organizer Average Rating Calculation ---

  // --- DEV_COMMENT: START - Trip-Specific Average Rating Calculation ---
  // This logic calculates the average rating *for this trip only*.
  // The backend should return these pre-calculated values in the trip API response to avoid this client-side logic.
  const tripAverageRating = (trip.reviews?.length || 0) > 0 ? (trip.reviews.reduce((acc, r) => acc + r.rating, 0) / trip.reviews.length) : 0;
  const tripReviewCount = trip.reviews?.length || 0;
  // --- DEV_COMMENT: END - Trip-Specific Average Rating Calculation ---


  // DEV_COMMENT: Filter batches to show only those available for booking.
  // Business Logic: Only 'Active' batches are visible to the user. 'Inactive', 'Pending', etc., are hidden.
  const activeBatches = trip.batches.filter(b => b.status === 'Active');

  return (
    <main className="flex-1 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* SECTION: Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight mb-2">{trip.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-5 w-5" />
                  <span>{trip.location}</span>
                </div>
              </div>
            </div>
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* SECTION: Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="relative h-96">
             <Image src={trip.image} alt={trip.title} fill className="rounded-lg object-cover" data-ai-hint={trip.imageHint} priority />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {trip.gallery.slice(0, 4).map((img, index) => (
              <div key={index} className="relative h-48">
                <Image src={img.url} alt={`Gallery image ${index+1}`} fill className="rounded-lg object-cover" data-ai-hint={img.hint} />
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-8 space-y-8">
            {/* SECTION: Trip Info Cards */}
            <Card>
                <CardHeader>
                    <CardTitle>Trip Info</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                        <Clock className="h-8 w-8 text-primary" />
                        <p className="font-semibold">Duration</p>
                        <p className="text-muted-foreground">{trip.duration}</p>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                        <AlertTriangle className="h-8 w-8 text-primary" />
                        <p className="font-semibold">Difficulty</p>
                        <p className="text-muted-foreground">{trip.difficulty}</p>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                        <UserCheck className="h-8 w-8 text-primary" />
                        <p className="font-semibold">Age Group</p>
                        <p className="text-muted-foreground">{trip.minAge} - {trip.maxAge} yrs</p>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
                        <MapPin className="h-8 w-8 text-primary" />
                        <p className="font-semibold">Pickup City</p>
                        <p className="text-muted-foreground">{trip.pickupCity}</p>
                    </div>
                </CardContent>
            </Card>

            {/* SECTION: About this trip */}
            <Card>
                <CardHeader>
                    <CardTitle>About this trip</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{trip.description}</p>
                </CardContent>
            </Card>

            {/* DEV_COMMENT: START - UX Improvement: Booking & Batch Selection. */}
            {/* This section has been moved from the bottom of the page to a primary position. */}
            {/* This prioritizes the main call-to-action ("Book Now"), reducing friction and improving conversion potential. */}
            <Card>
              <CardHeader>
                <CardTitle>Book Your Adventure</CardTitle>
                <CardDescription>Select an upcoming batch to start your booking.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <Alert className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200 [&>svg]:text-blue-600">
                    <ShieldCheck className="h-4 w-4" />
                    <AlertTitle className="font-semibold">Book with Confidence</AlertTitle>
                    <AlertDescription>
                        Booking on Travonex gives you full support, secure payments, and exclusive perks.
                    </AlertDescription>
                </Alert>
                <div className="text-2xl font-bold pt-4">
                  ₹{trip.price.toLocaleString('en-IN')} <span className="text-base font-normal text-muted-foreground">/ person</span>
                </div>
                <div className="space-y-3">
                  {activeBatches.map(batch => (
                    <div key={batch.id} className="p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-6 w-6 text-primary flex-shrink-0" />
                        <div>
                          <div className="font-semibold">
                            <ClientOnlyDate dateString={batch.startDate} options={{ month: 'long', day: 'numeric' }} /> - <ClientOnlyDate dateString={batch.endDate} options={{ month: 'long', day: 'numeric', year: 'numeric' }} />
                          </div>
                          {batch.priceOverride && (
                            <p className="text-sm font-bold text-primary">
                              Special Price: ₹{batch.priceOverride.toLocaleString('en-IN')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Link href={`/book/${trip.id}?batch=${batch.id}`} className="flex-grow sm:flex-grow-0">
                          <Button className="w-full">Book Now</Button>
                        </Link>
                        <Badge variant="secondary" className="whitespace-nowrap">{batch.availableSlots} slots left</Badge>
                      </div>
                    </div>
                  ))}
                  {activeBatches.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No upcoming batches available for this trip.</p>}
                </div>
              </CardContent>
            </Card>
            {/* DEV_COMMENT: END - UX Improvement: Booking & Batch Selection. */}

             {/* DEV_COMMENT: Section to display multi-point pickup and drop-off information. This data is only rendered if points have been defined by the organizer. */}
            {(trip.pickupPoints.length > 0 || trip.dropoffPoints.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>Pickup & Drop-off Points</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {trip.pickupPoints.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-foreground">Pickup Points</h3>
                      <ul className="space-y-2 text-muted-foreground">
                        {trip.pickupPoints.map((point, index) => (
                          <li key={index} className="flex justify-between items-center">
                            <span>{point.label} - <span className="font-medium text-primary">{point.time}</span></span>
                            <a href={point.mapsLink} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm"><MapPin className="mr-2 h-4 w-4" /> View Map</Button>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {trip.dropoffPoints.length > 0 && (
                     <div className="space-y-3">
                      <h3 className="font-semibold text-foreground">Drop-off Points</h3>
                      <ul className="space-y-2 text-muted-foreground">
                        {trip.dropoffPoints.map((point, index) => (
                           <li key={index} className="flex justify-between items-center">
                            <span>{point.label} - <span className="font-medium text-primary">{point.time}</span></span>
                             <a href={point.mapsLink} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm"><MapPin className="mr-2 h-4 w-4" /> View Map</Button>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* SECTION: Inclusions & Exclusions */}
            <Card>
                <CardHeader>
                    <CardTitle>What's Included</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <h3 className="font-semibold text-green-600">Inclusions</h3>
                        <ul className="space-y-2 text-muted-foreground">
                            {trip.inclusions.map((item, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-red-600">Exclusions</h3>
                        <ul className="space-y-2 text-muted-foreground">
                            {trip.exclusions.map((item, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <X className="h-5 w-5 text-red-600 mt-0.5" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* SECTION: Itinerary */}
            <Card>
                <CardHeader>
                    <CardTitle>Itinerary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {trip.itinerary.map(item => (
                        <div key={item.day} className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">{item.day}</div>
                                <div className="flex-grow w-px bg-border my-2"></div>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{item.title}</h3>
                                <p className="text-muted-foreground">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* SECTION: Cancellation Policy */}
            {trip.cancellationPolicy && (
              <Card>
                <CardHeader>
                    <CardTitle>Cancellation Policy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4 text-muted-foreground">
                    <FileText className="h-6 w-6 text-primary mt-1"/>
                    <p>{trip.cancellationPolicy}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SECTION: FAQs */}
            {trip.faqs && trip.faqs.length > 0 && (
              <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
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
            )}
            
            <Card>
              <CardHeader>
                  <CardTitle>Organized By</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                          <AvatarImage src={`https://placehold.co/64x64.png?text=${organizer?.name.charAt(0)}`} data-ai-hint="company logo"/>
                          <AvatarFallback>{organizer?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                          <p className="font-bold text-lg">{organizer?.name}</p>
                          <div className="flex items-center gap-4 text-sm mt-1">
                            {organizer?.kycStatus === 'Verified' && <div className="flex items-center text-green-600 font-medium"><CheckCircle className="h-4 w-4 mr-1" />Verified Organizer</div>}
                            <div className="flex items-center text-muted-foreground">
                                <Star className="h-4 w-4 mr-1 text-amber-400 fill-current" />
                                <span>
                                    {averageRating}
                                    {reviewCount > 0 && ` (${reviewCount} reviews)`}
                                </span>
                            </div>
                          </div>
                      </div>
                  </div>
              </CardContent>
            </Card>

            {/* SECTION: Reviews */}
            <Card>
                <CardHeader>
                    <CardTitle>Reviews</CardTitle>
                    <CardDescription>What past participants are saying about this trip.</CardDescription>
                </CardHeader>
                <CardContent>
                    {tripReviewCount > 0 && (
                      <div className="mb-6 p-4 rounded-lg bg-muted/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-center sm:text-left">
                            <h3 className="text-xl font-bold">Overall Trip Rating</h3>
                            <p className="text-sm text-muted-foreground">
                                Based on {tripReviewCount} review{tripReviewCount > 1 ? 's' : ''} from past participants.
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-4xl font-bold">{tripAverageRating.toFixed(1)}/5</p>
                            <div className="flex justify-center">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-6 w-6 ${i < Math.round(tripAverageRating) ? 'text-amber-400 fill-current' : 'text-muted-foreground'}`} />
                                ))}
                            </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                        {trip.reviews?.map(review => {
                            const user = users.find(u => u.id === review.userId);
                            return (
                                <div key={review.id} className="flex gap-4 border-t pt-4 first:border-t-0 first:pt-0">
                                    <Avatar>
                                        <AvatarImage src={`https://placehold.co/40x40.png?text=${user?.name.charAt(0)}`} data-ai-hint="person avatar" />
                                        <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold">{user?.name}</h4>
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-amber-400 fill-current' : 'text-muted-foreground'}`} />)}
                                            </div>
                                        </div>
                                        <p className="text-muted-foreground text-sm">{review.comment}</p>
                                    </div>
                                </div>
                            )
                        })}
                        {(trip.reviews?.length || 0) === 0 && <p className="text-muted-foreground text-sm text-center py-4">No reviews yet. Be the first to leave one!</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}
