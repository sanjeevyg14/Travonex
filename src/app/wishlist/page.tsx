
/**
 * @fileoverview User Wishlist Page
 * @description Displays a grid of trips that the user has added to their wishlist.
 * 
 * @developer_notes
 * - **API Integration**: This page should fetch the user's wishlisted trips from a dedicated endpoint.
 *   `GET /api/users/me/wishlist` would be the expected API call. The backend would need to resolve
 *   the trip IDs stored in the user's wishlist document/table to full trip objects.
 * - **State Management**: `useState` is used to manage the list of trips and the loading state.
 * - **Loading UX**: Implements a skeleton loader (`TripCardSkeleton`) to provide a better user experience while data is being fetched.
 */
"use client";

import * as React from "react";
import { TripCard, TripCardSkeleton } from "@/components/common/TripCard";
import type { Trip } from "@/lib/types";

export default function WishlistPage() {
    const [wishlistedTrips, setWishlistedTrips] = React.useState<Trip[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchWishlist() {
            setIsLoading(true);
            try {
                const res = await fetch('/api/users/me/wishlist', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    // BACKEND: Expected to return an array of Trip objects
                    setWishlistedTrips(Array.isArray(data) ? data : data.trips || []);
                } else {
                    setWishlistedTrips([]);
                }
            } catch {
                setWishlistedTrips([]);
            } finally {
                setIsLoading(false);
            }
        }
        fetchWishlist();
    }, []);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
          Your Wishlist
        </h1>
        <p className="text-lg text-muted-foreground">
          The adventures you're dreaming of.
        </p>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <TripCardSkeleton key={i} />)}
        </div>
      ) : wishlistedTrips.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistedTrips.map(trip => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-8">
          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-2xl font-bold tracking-tight">
              Your wishlist is empty
            </h3>
            <p className="text-sm text-muted-foreground">
              Add some trips to your wishlist to see them here.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
