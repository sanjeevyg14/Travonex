
/**
 * @fileoverview User Bookings Page
 * @description This page allows users to view their upcoming, completed, and cancelled bookings.
 *
 * @developer_notes
 * - **PERFORMANCE**: This page has been converted to an async Server Component to fetch data on the server.
 *   This reduces client-side JavaScript and improves load time.
 * - **COMPONENTIZATION**: The interactive part of the page (the tabs and dialogs) has been moved to
 *   a dedicated client component, `BookingsClient`, which receives the server-fetched data as props.
 * - **API Integration**:
 *   - Fetches bookings for the authenticated user by reading a server-side session cookie.
 *   - Cancel/Review/Dispute actions are handled within the client component.
 */
import * as React from "react";
import { BookingsClient } from "@/components/bookings/BookingsClient";
import { trips, organizers } from "@/lib/mock-data";
import { cookies } from "next/headers";
import type { UserSession } from "@/lib/types";

// DEV_COMMENT: Data fetching now happens on the server before the page is rendered.
// It securely reads the session cookie to identify the user.
async function getUserBookings() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('userSession');

  if (!sessionCookie) {
    return []; // Return empty array if not logged in
  }
  
  try {
    const session: UserSession = JSON.parse(sessionCookie.value);
    const userId = session?.id;
    if (!userId) return [];

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/users/me/bookings`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function BookingsPage() {
  const userBookings = await getUserBookings();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
          Your Bookings
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage your upcoming and view details of past adventures.
        </p>
      </div>
      
      {/* 
        The server-fetched `userBookings` data is passed to the client component.
        This pattern allows for fast initial page loads with server-side rendering,
        while still enabling rich client-side interactivity.
      */}
      <BookingsClient 
        initialBookings={userBookings} 
        allTrips={trips} 
        allOrganizers={organizers} 
      />
    </main>
  );
}
