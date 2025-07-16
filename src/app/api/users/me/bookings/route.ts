
/**
 * @fileoverview API Route for fetching bookings for the authenticated user.
 * @description This is a protected endpoint that uses cookie-based authentication.
 *
 * @method GET
 * @endpoint /api/users/me/bookings
 *
 * @returns
 * - 200 OK: Booking[]
 * - 401 Unauthorized
 * - 500 Internal Server Error
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { bookings, trips, organizers } from '@/lib/mock-data';
import type { UserSession } from '@/lib/types';

export async function GET(request: Request) {
  // --- Authentication & Authorization ---
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('userSession');

  if (!sessionCookie) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const session: UserSession = JSON.parse(sessionCookie.value);
    const userId = session.id;

    if (!userId) {
       return NextResponse.json({ message: 'Invalid session' }, { status: 401 });
    }
    // --- End of Authentication ---

    // --- Database Query Simulation ---
    // Fetch bookings for the specific user and join related trip/organizer data.
    const userBookings = bookings.filter(b => b.userId === userId).map(booking => {
      const trip = trips.find(t => t.id === booking.tripId);
      const organizer = trip ? organizers.find(o => o.id === trip.organizerId) : null;
      return {
        ...booking,
        tripTitle: trip?.title || 'Unknown Trip',
        organizerName: organizer?.name || 'Unknown Organizer',
      };
    });
    // --- End of Database Query Simulation ---

    return NextResponse.json(userBookings);
  } catch (error) {
    console.error('Failed to fetch user bookings:', error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}
