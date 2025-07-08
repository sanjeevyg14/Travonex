
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { trips, users } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Trip, User } from "@/lib/types";
import { ClientOnlyDate } from "@/components/common/ClientOnlyDate";


// Mock organizer ID
const MOCK_ORGANIZER_ID = 'VND001';

type ReviewWithTripTitle = {
    id: string;
    userId: string;
    rating: number;
    comment: string;
    tripTitle: string;
}

const ReviewSkeleton = () => (
    <div className="border-b pb-4 last:border-b-0">
        <div className="flex justify-between items-start">
            <div>
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-5 w-24 mb-3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-1" />
            </div>
            <div className="flex items-center gap-3 text-right">
                <div className="space-y-1">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
        </div>
    </div>
);

export default function OrganizerReviewsPage() {
    const [allReviews, setAllReviews] = React.useState<ReviewWithTripTitle[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        // FRONTEND: Simulate fetching review data
        // BACKEND: This should be an API call like `GET /api/organizers/me/reviews`
        setIsLoading(true);
        setTimeout(() => {
            const organizerTrips = trips.filter(t => t.organizerId === MOCK_ORGANIZER_ID);
            const fetchedReviews = organizerTrips.flatMap(trip => 
                trip.reviews.map(review => ({...review, tripTitle: trip.title}))
            );
            setAllReviews(fetchedReviews);
            setIsLoading(false);
        }, 300);
    }, []);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
          Customer Reviews
        </h1>
        <p className="text-lg text-muted-foreground">
          See what travelers are saying about your trips.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Reviews</CardTitle>
          <CardDescription>A list of all reviews for your trips.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <ReviewSkeleton key={i} />)
            ) : allReviews.length > 0 ? (
                allReviews.map((review) => {
                const user = users.find(u => u.id === review.userId);
                return (
                <div key={review.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold text-sm text-muted-foreground">For: {review.tripTitle}</p>
                            <div className="flex items-center gap-2 mt-1">
                                {[...Array(5)].map((_, i) => <Star key={i} className={`h-5 w-5 ${i < review.rating ? 'text-amber-400 fill-current' : 'text-muted-foreground'}`} />)}
                            </div>
                            <p className="mt-2 text-foreground">{review.comment}</p>
                        </div>
                        <div className="flex items-center gap-3 text-right">
                            <div>
                                <p className="font-semibold">{user?.name}</p>
                                <p className="text-xs text-muted-foreground"><ClientOnlyDate dateString={new Date().toISOString()} type="date" /></p>
                            </div>
                            <Avatar>
                                <AvatarImage src={`https://placehold.co/40x40.png?text=${user?.name.charAt(0)}`} data-ai-hint="person avatar" />
                                <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </div>
                )
            })
            ) : (
                <p className="text-muted-foreground text-center py-12">You have no reviews yet.</p>
            )}
        </CardContent>
      </Card>
    </main>
  );
}
