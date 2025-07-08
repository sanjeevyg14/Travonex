/**
 * @fileoverview API Route for fetching a single trip by its slug.
 * @description This public endpoint serves a single trip for the trip details page.
 *
 * @method GET
 * @endpoint /api/trips/slug/{slug}
 *
 * @returns
 * - 200 OK: Trip
 * - 404 Not Found
 * - 500 Internal Server Error
 */
import { NextResponse } from 'next/server';
import { trips, organizers } from '@/lib/mock-data';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    // --- Database Query Simulation ---
    const trip = mockTrips.find(t => t.slug === slug && t.status === 'Published');
    // --- End of Database Query Simulation ---

    if (!trip) {
      return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
    }

    // Optionally, join related data like organizer info
    const organizer = organizers.find(o => o.id === trip.organizerId);

    // IMPORTANT: Return only public-safe data.
    // Exclude fields like `adminNotes`, `isFeaturedRequest`, etc.
    const publicTripData = {
      ...trip,
      organizer: organizer ? { name: organizer.name, id: organizer.id, kycStatus: organizer.kycStatus } : null,
      adminNotes: undefined, // Explicitly remove sensitive data
    };

    return NextResponse.json(publicTripData);

  } catch (error) {
    console.error(`Failed to fetch trip ${params.slug}:`, error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}
