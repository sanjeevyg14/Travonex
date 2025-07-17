
"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { TripCard, TripCardSkeleton } from "@/components/common/TripCard";
// Fallback mock trips are kept for development if the backend is unavailable
import { trips as mockTrips } from "@/lib/mock-data";
import type { Trip } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Frown, X, SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/datepicker";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const fallbackTrips = mockTrips.filter(t => t.status === 'Published');
const initialMaxPrice = Math.max(...fallbackTrips.map(t => t.price), 100000);

// DEV_COMMENT: To avoid duplicating the filter UI for desktop and mobile,
// it's extracted into its own component. The filter data (categories, interests)
// is sourced from the same mock data that organizers use, ensuring consistency.
interface FilterProps {
  priceRange: number[];
  setPriceRange: (val: number[]) => void;
  dateRange: { from?: Date; to?: Date };
  setDateRange: (val: { from?: Date; to?: Date }) => void;
  selectedDuration: string;
  setSelectedDuration: (val: string) => void;
  selectedCategories: string[];
  handleCategoryChange: (cat: string, checked: boolean) => void;
  categories: { id: string; name: string; status?: string }[];
  selectedInterests: string[];
  handleInterestChange: (int: string, checked: boolean) => void;
  interests: { id: string; name: string; status?: string }[];
  selectedOrganizer: string;
  setSelectedOrganizer: (val: string) => void;
  organizers: { id: string; name: string }[];
  selectedRating: number;
  setSelectedRating: (val: number) => void;
  maxPrice: number;
  activeFilterCount: number;
  resetFilters: () => void;
}

function FilterSidebarContent({
  priceRange, setPriceRange,
  dateRange, setDateRange,
  selectedDuration, setSelectedDuration,
  selectedCategories, handleCategoryChange,
  categories,
  selectedInterests, handleInterestChange,
  interests,
  selectedOrganizer, setSelectedOrganizer,
  organizers,
  selectedRating, setSelectedRating,
  maxPrice,
  activeFilterCount, resetFilters
}: FilterProps) {
  
  const handleRatingChange = (value: string) => {
    setSelectedRating(parseInt(value, 10));
  };

  return (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg">Filters</CardTitle>
            {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="text-sm">
                    <X className="mr-2 h-4 w-4" />
                    Reset ({activeFilterCount})
                </Button>
            )}
        </CardHeader>
        <CardContent className="space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto pr-3">
            {/* Price Range Filter */}
            <div>
                <h3 className="font-semibold mb-3 text-sm">Price Range</h3>
                <Slider
                    defaultValue={[0, maxPrice]}
                    max={maxPrice}
                    step={1000}
                    value={priceRange}
                    onValueChange={setPriceRange}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>₹{priceRange[0].toLocaleString()}</span>
                    <span>₹{priceRange[1].toLocaleString()}</span>
                </div>
            </div>
             {/* Date Range Filter */}
            <div>
                <h3 className="font-semibold mb-3 text-sm">Dates</h3>
                <div className="space-y-2">
                    <DatePicker date={dateRange.from} setDate={(date) => setDateRange((prev: any) => ({...prev, from: date}))} placeholder="Start date"/>
                    <DatePicker date={dateRange.to} setDate={(date) => setDateRange((prev: any) => ({...prev, to: date}))} placeholder="End date" />
                </div>
            </div>
             {/* Trip Duration Filter */}
             <div>
                <h3 className="font-semibold mb-3 text-sm">Trip Duration</h3>
                <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                    <SelectTrigger><SelectValue placeholder="All Durations"/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Durations</SelectItem>
                        <SelectItem value="short">Short Trip (1-3 Days)</SelectItem>
                        <SelectItem value="weekend">Weekend (4-5 Days)</SelectItem>
                        <SelectItem value="long">Long Trip (5+ Days)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {/* Organizer Filter */}
            <div>
                <h3 className="font-semibold mb-3 text-sm">Organizer</h3>
                <Select value={selectedOrganizer} onValueChange={setSelectedOrganizer}>
                    <SelectTrigger><SelectValue placeholder="All Organizers"/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Organizers</SelectItem>
                        {organizers.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
             {/* Rating Filter */}
            <div>
                <h3 className="font-semibold mb-3 text-sm">Rating</h3>
                 <RadioGroup value={String(selectedRating)} onValueChange={handleRatingChange}>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="4" id="r1" /><Label htmlFor="r1">4 stars &amp; up</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="3" id="r2" /><Label htmlFor="r2">3 stars &amp; up</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="0" id="r3" /><Label htmlFor="r3">Any</Label></div>
                </RadioGroup>
            </div>
            {/* Category Filter */}
            <div>
                <h3 className="font-semibold mb-3 text-sm">Category</h3>
                <div className="space-y-2">
                    {categories.filter(c=>c.status==='Active').map(cat => (
                        <div key={cat.id} className="flex items-center space-x-2">
                            <Checkbox id={`cat-${cat.id}`} onCheckedChange={(checked) => handleCategoryChange(cat.name, !!checked)} checked={selectedCategories.includes(cat.name)} />
                            <Label htmlFor={`cat-${cat.id}`} className="font-normal">{cat.name}</Label>
                        </div>
                    ))}
                </div>
            </div>
             {/* Interests Filter */}
            <div>
                <h3 className="font-semibold mb-3 text-sm">Interests</h3>
                <div className="space-y-2">
                    {interests.filter(i=>i.status==='Active').map(interest => (
                        <div key={interest.id} className="flex items-center space-x-2">
                            <Checkbox id={`int-${interest.id}`} onCheckedChange={(checked) => handleInterestChange(interest.name, !!checked)} checked={selectedInterests.includes(interest.name)} />
                            <Label htmlFor={`int-${interest.id}`} className="font-normal">{interest.name}</Label>
                        </div>
                    ))}
                </div>
            </div>
        </CardContent>
    </Card>
  );
}


function SearchPageComponent() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || "");
  const [sortedTrips, setSortedTrips] = useState<Trip[]>([]);
  const [sortKey, setSortKey] = useState("relevance");
  const [isLoading, setIsLoading] = useState(true);

  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);

  const [trips, setTrips] = useState<Trip[]>(fallbackTrips);
  const [categories, setCategories] = useState<{id:string; name:string; status?:string}[]>([]);
  const [interests, setInterests] = useState<{id:string; name:string; status?:string}[]>([]);
  const [organizers, setOrganizers] = useState<{id:string; name:string}[]>([]);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>(searchParams.get('category')?.split(',').filter(Boolean) || []);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{from?: Date, to?: Date}>({});
  const [priceRange, setPriceRange] = useState([0, maxPrice]);
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [selectedOrganizer, setSelectedOrganizer] = useState('all');
  const [selectedRating, setSelectedRating] = useState(0);

  const getAverageRating = (trip: Trip) => {
    if (!trip.reviews || trip.reviews.length === 0) return 0;
    const total = trip.reviews.reduce((acc, review) => acc + review.rating, 0);
    return total / trip.reviews.length;
  };

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const [tripRes, catRes, intRes, orgRes] = await Promise.all([
          fetch('/api/trips'),
          fetch('/api/categories'),
          fetch('/api/interests'),
          fetch('/api/organizers'),
        ]);
        const [tripData, catData, intData, orgData] = await Promise.all([
          tripRes.json(),
          catRes.json(),
          intRes.json(),
          orgRes.json(),
        ]);
        if (Array.isArray(tripData)) {
          setTrips(tripData);
          setMaxPrice(Math.max(...tripData.map((t: any) => t.price), initialMaxPrice));
        }
        if (Array.isArray(catData)) setCategories(catData);
        if (Array.isArray(intData)) setInterests(intData);
        if (Array.isArray(orgData)) setOrganizers(orgData);
      } catch (err) {
        console.error('Failed to load search data', err);
      }
    };
    loadInitial();
  }, []);

  useEffect(() => {
    setSearchTerm(searchParams.get('q') || "");
  }, [searchParams]);

  useEffect(() => {
    setIsLoading(true);
    // BACKEND: This entire filtering logic should be handled by a backend API endpoint
    // that accepts these filter parameters. e.g., GET /api/trips?q=...&category=...&price_min=...
    const timer = setTimeout(() => {
        let results = trips
        .filter(trip => trip.status === 'Published')
        // Search term filter
        .filter(trip => {
            const term = searchTerm.toLowerCase();
            if (!term) return true;
            return (
            trip.title.toLowerCase().includes(term) ||
            trip.location.toLowerCase().includes(term) ||
            (trip.interests && trip.interests.some(interest => interest.toLowerCase().includes(term)))
            );
        })
        // Category filter
        .filter(trip => selectedCategories.length === 0 || selectedCategories.includes(trip.tripType))
        // Interest filter
        .filter(trip => selectedInterests.length === 0 || (trip.interests && trip.interests.some(i => selectedInterests.includes(i))))
        // Price range filter
        .filter(trip => trip.price >= priceRange[0] && trip.price <= priceRange[1])
        // Date range filter
        .filter(trip => {
            if (!dateRange.from && !dateRange.to) return true;
            return trip.batches.some(batch => {
                const startDate = new Date(batch.startDate);
                const endDate = new Date(batch.endDate);
                if(dateRange.from && dateRange.to) return startDate <= dateRange.to && endDate >= dateRange.from;
                if(dateRange.from) return endDate >= dateRange.from;
                if(dateRange.to) return startDate <= dateRange.to;
                return false;
            });
        })
        // Duration filter
        .filter(trip => {
            if (selectedDuration === 'all') return true;
            const durationDays = parseInt(trip.duration.split(' ')[0]); // simplified assumption
            if (selectedDuration === 'short') return durationDays <= 3;
            if (selectedDuration === 'weekend') return durationDays > 3 && durationDays <= 5;
            if (selectedDuration === 'long') return durationDays > 5;
            return true;
        })
        // Organizer filter
        .filter(trip => selectedOrganizer === 'all' || trip.organizerId === selectedOrganizer)
        // Rating filter
        .filter(trip => getAverageRating(trip) >= selectedRating);
        
        // BACKEND: Sorting should also be done on the backend via query parameters.
        let sorted = [...results];
        switch (sortKey) {
            case 'price-asc':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                sorted.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                sorted.sort((a,b) => new Date(b.batches[0]?.startDate || 0).getTime() - new Date(a.batches[0]?.startDate || 0).getTime());
                break;
            case 'relevance':
            default:
                break;
        }
        setSortedTrips(sorted);
        setIsLoading(false);
    }, 500); // Simulate network delay

    return () => clearTimeout(timer);
  }, [trips, searchTerm, selectedCategories, selectedInterests, priceRange, dateRange, selectedDuration, sortKey, selectedOrganizer, selectedRating]);

  const handleCategoryChange = (category: string, checked: boolean) => {
    setSelectedCategories(prev => checked ? [...prev, category] : prev.filter(c => c !== category));
  }
  
  const handleInterestChange = (interest: string, checked: boolean) => {
    setSelectedInterests(prev => checked ? [...prev, interest] : prev.filter(i => i !== interest));
  }

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedInterests([]);
    setDateRange({});
    setPriceRange([0, maxPrice]);
    setSelectedDuration('all');
    setSelectedOrganizer('all');
    setSelectedRating(0);
  }

  const activeFilterCount = useMemo(() => (
    selectedCategories.length +
    selectedInterests.length +
    (dateRange.from || dateRange.to ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0) +
    (selectedDuration !== 'all' ? 1 : 0) +
    (selectedOrganizer !== 'all' ? 1 : 0) +
    (selectedRating > 0 ? 1 : 0)
  ), [selectedCategories, selectedInterests, dateRange, priceRange, selectedDuration, selectedOrganizer, selectedRating]);

  const filterProps = {
    priceRange, setPriceRange,
    dateRange, setDateRange,
    selectedDuration, setSelectedDuration,
    selectedCategories, handleCategoryChange,
    categories,
    selectedInterests, handleInterestChange,
    interests,
    selectedOrganizer, setSelectedOrganizer,
    organizers,
    selectedRating, setSelectedRating,
    maxPrice,
    activeFilterCount,
    resetFilters,
  };

  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:p-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
          Explore All Trips
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {searchTerm ? `Showing results for "${searchTerm}"` : "Find your perfect adventure from our collection of curated trips."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filter Sidebar for Desktop */}
        <aside className="hidden lg:block lg:col-span-1 lg:sticky top-24 space-y-6">
            <FilterSidebarContent {...filterProps} />
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3">
            <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
              <p className="text-sm font-medium text-muted-foreground flex-grow">
                {isLoading ? 'Searching...' : `Showing ${sortedTrips.length} trips`}
              </p>
               {/* Mobile Filter Button */}
              <div className="lg:hidden w-full">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <SlidersHorizontal className="mr-2 h-4 w-4"/>
                      Show Filters ({activeFilterCount})
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                    <SheetHeader className="mb-4">
                      <SheetTitle>Filter Trips</SheetTitle>
                    </SheetHeader>
                    <FilterSidebarContent {...filterProps} />
                  </SheetContent>
                </Sheet>
              </div>
              <Select value={sortKey} onValueChange={setSortKey}>
                  <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  </SelectContent>
              </Select>
            </div>
          
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => <TripCardSkeleton key={i} />)}
                </div>
            ) : sortedTrips.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {sortedTrips.map(trip => (
                            <TripCard key={trip.id} trip={trip} />
                        ))}
                    </div>
                     {/* BACKEND: Pagination logic should be handled here, fetching the next page of results from the API. */}
                     <div className="flex justify-center mt-8">
                        <Button variant="outline">Previous</Button>
                        <Button variant="outline" className="ml-2">Next</Button>
                    </div>
                </>
            ) : (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-16">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <Frown className="h-12 w-12 text-muted-foreground" />
                        <h3 className="text-2xl font-bold tracking-tight">
                        No trips found
                        </h3>
                        <p className="text-sm text-muted-foreground">
                        Try adjusting your search or filters.
                        </p>
                    </div>
                </div>
            )}
        </div>
      </div>
    </main>
  )
}

export default function SearchPage() {
    return (
        <Suspense>
            <SearchPageComponent />
        </Suspense>
    )
}
