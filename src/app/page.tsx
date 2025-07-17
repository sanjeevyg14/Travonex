
/**
 * @fileoverview Homepage for the Travenox platform.
 * @description This page serves as the main entry point for users, displaying featured trips, categories, and AI-powered suggestions.
 * 
 * @developer_notes
 * - **Data Fetching**: The component simulates API calls to fetch various data sets. In a real app, this should be optimized.
 *   - `GET /api/trips?isBanner=true&limit=5`: Fetches trips marked by an admin to appear in the main banner.
 *   - `GET /api/trips?isFeatured=true&city={selectedCity}&limit=4`: Fetches featured trips, respecting the user's city selection.
 *   - `GET /api/categories?status=Active`: Fetches active categories for the "Explore by Interest" section.
 * - **Loading States**: Uses `useState` and `useEffect` to manage a loading state, displaying skeleton loaders to improve perceived performance.
 */
"use client";

import Link from "next/link";
import * as React from "react";
import { TripCard, TripCardSkeleton } from "@/components/common/TripCard";
import { DestinationSuggestionForm } from "@/components/ai/DestinationSuggestionForm";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useCity } from "@/context/CityContext";
import { TripBannerSlider } from "@/components/common/TripBannerSlider";
import { WhyBookBanner } from "@/components/common/WhyBookBanner";
import type { Trip, Category } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

// DEV_COMMENT: Skeleton loader for the category exploration section.
const CategorySkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {Array.from({ length: 4 }).map((_, i) => (
             <div key={i} className="flex flex-col items-center justify-center gap-2 p-6 rounded-lg border bg-card">
                 <Skeleton className="h-8 w-8 rounded-full" />
                 <Skeleton className="h-5 w-24" />
             </div>
        ))}
    </div>
)


export default function HomePage() {
  const { selectedCity } = useCity();
  const [isLoading, setIsLoading] = React.useState(true);
  const [bannerTrips, setBannerTrips] = React.useState<Trip[]>([]);
  const [featuredTrips, setFeaturedTrips] = React.useState<Trip[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);


  React.useEffect(() => {
    const loadData = async () => {
        try {
            const bannerRes = await fetch('/api/trips?isBanner=true&limit=5');
            const bannerData = await bannerRes.json();
            setBannerTrips(Array.isArray(bannerData) ? bannerData : []);

            const featuredRes = await fetch(`/api/trips?isFeatured=true&city=${selectedCity}&limit=4`);
            const featuredData = await featuredRes.json();
            setFeaturedTrips(Array.isArray(featuredData) ? featuredData : []);

            const catRes = await fetch('/api/categories?status=Active');
            const catData = await catRes.json();
            setCategories(Array.isArray(catData) ? catData : []);
        } catch (err) {
            console.error('Homepage data load error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    requestAnimationFrame(loadData);
  }, [selectedCity]);
  

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      
      <section className="mb-8">
        {isLoading ? <Skeleton className="h-64 md:h-[28rem] w-full rounded-lg" /> : <TripBannerSlider bannerTrips={bannerTrips} />}
      </section>

      <div className="space-y-4 text-center">
         <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">
          Find Your Next Adventure
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Explore curated trips from trusted organizers or get a personalized suggestion from our AI travel expert. Your next story awaits.
        </p>
         {/* DEV_COMMENT: This button correctly navigates to the dedicated search page. */}
         <Link href="/search">
            <Button size="lg">Explore All Trips <ArrowRight className="ml-2 h-5 w-5" /></Button>
        </Link>
      </div>
      
      <section className="py-8">
        <h2 className="text-2xl font-headline font-bold tracking-tight mb-6 text-center">
          Explore by Interest
        </h2>
        {isLoading ? <CategorySkeleton /> : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                // DEV_COMMENT: Clicking a category navigates to the search page with the category filter pre-applied.
                <Link href={`/search?category=${category.name}`} key={category.name}>
                    <div className="flex flex-col items-center justify-center gap-2 p-6 rounded-lg border bg-card hover:bg-accent hover:text-accent-foreground transition-colors">
                    <IconComponent className={`h-8 w-8 text-primary`} />
                    <span className="font-semibold">{category.name}</span>
                    </div>
                </Link>
                )
            })}
            </div>
        )}
      </section>

      <section className="py-8">
        <WhyBookBanner />
      </section>

      <section className="py-8">
        <DestinationSuggestionForm />
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-headline font-bold tracking-tight">
            Featured Trips
          </h2>
          <Link href="/search">
            <Button variant="link">View All <ArrowRight className="ml-1 h-4 w-4" /></Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <TripCardSkeleton key={i} />)
            ) : featuredTrips.length > 0 ? (
                featuredTrips.map(trip => <TripCard key={trip.id} trip={trip} />)
            ) : (
              <p className="text-muted-foreground col-span-full text-center">No featured trips available for the selected city.</p>
            )}
        </div>
      </section>
    </main>
  );
}
