/**
 * @fileoverview API Route for fetching multiple trips.
 * @description This public endpoint serves trips for the homepage and search page.
 *
 * @method GET
 * @endpoint /api/trips
 *
 * @query_params
 * - `q`: string (for search)
 * - `isFeatured`: boolean
 * - `isBanner`: boolean
 * - `city`: string
 * - `category`: string
 * - `limit`: number
 *
 * @returns
 * - 200 OK: Trip[]
 * - 500 Internal Server Error
 */
import { NextResponse } from 'next/server';
import { trips as mockTrips } from '@/lib/mock-data';
import type { Trip } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    // --- Database Query Simulation ---
    // In a real app, this logic would be part of your database query (e.g., a WHERE clause in SQL).
    let results: Trip[] = mockTrips.filter(trip => trip.status === 'Published');

    // Search by keyword
    const searchTerm = searchParams.get('q');
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(trip =>
        trip.title.toLowerCase().includes(term) ||
        trip.location.toLowerCase().includes(term) ||
        (trip.interests && trip.interests.some(interest => interest.toLowerCase().includes(term)))
      );
    }

    // Filter by city
    const city = searchParams.get('city');
    if (city && city !== 'all') {
      results = results.filter(trip => trip.city === city);
    }

    // Filter by category
    const category = searchParams.get('category');
    if (category) {
        results = results.filter(trip => trip.tripType === category);
    }

    // Filter for featured trips
    const isFeatured = searchParams.get('isFeatured');
    if (isFeatured === 'true') {
        results = results.filter(trip => trip.isFeatured);
    }
    
    // Filter for banner trips
    const isBanner = searchParams.get('isBanner');
    if (isBanner === 'true') {
        results = results.filter(trip => trip.isBannerTrip);
    }

    // Apply limit
    const limit = searchParams.get('limit');
    if (limit) {
      results = results.slice(0, parseInt(limit, 10));
    }
    // --- End of Database Query Simulation ---

    // IMPORTANT: Map to a public-facing data structure to avoid leaking sensitive data.
    const publicTrips = results.map(trip => ({
      id: trip.id,
      slug: trip.slug,
      title: trip.title,
      location: trip.location,
      tripType: trip.tripType,
      price: trip.price,
      image: trip.image,
      imageHint: trip.imageHint
    }));

    return NextResponse.json(publicTrips);

  } catch (error) {
    console.error('Failed to fetch trips:', error);
    return NextResponse.json({ message: 'An error occurred while fetching trips.' }, { status: 500 });
  }
}
