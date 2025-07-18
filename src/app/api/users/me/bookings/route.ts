
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
import type { UserSession } from '@/lib/types';

export async function GET(request: Request) {
  // --- Authentication & Authorization ---
  const cookieStore = await cookies();
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

    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/bookings/user/${userId}`;
    const res = await fetch(backendUrl);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Failed to fetch user bookings:', error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}
