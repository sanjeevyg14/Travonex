/**
 * @fileoverview Admin Trip Edit Page
 *
 * @description
 * This page provides a form for Superadmins to edit all aspects of a trip listing.
 * It reuses the same TripForm component as the organizer for consistency.
 *
 * @developer_notes
 * - **Reusability**: Leverages the existing `TripForm` component, demonstrating component reuse across different application roles.
 * - **API Integration**: Submissions from this form should call a protected admin endpoint, e.g., `PUT /api/admin/trips/{tripId}`.
 * - **Permissions**: The backend must ensure only authorized admins can access and submit changes through this route.
 * - **Audit Trail**: The backend should log that the change was made by an admin, including the admin's ID and the provided remark, in the `tripChangeLogs`.
 */
import { TripForm } from "@/components/trips/TripForm";
import { trips } from "@/lib/mock-data";
import { notFound } from "next/navigation";

export default function AdminEditTripPage({ params }: { params: { tripId: string } }) {
    // BACKEND: Fetch trip data using a secure admin endpoint
    const trip = trips.find(t => t.id === params.tripId);
    if (!trip) {
        notFound();
    }
  
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
                Admin Edit: {trip.title}
            </h1>
            <p className="text-lg text-muted-foreground">
                You are editing this trip as a Superadmin. Changes will be logged and visible to the organizer.
            </p>
        </div>
        {/* 
          DEV_COMMENT: Reusing the TripForm for the admin panel ensures consistency and maintainability.
          Passing `isAdmin=true` enables admin-only fields like "Mark as Featured", giving them more control
          than a standard organizer.
        */}
        <TripForm trip={trip} isAdmin={true} />
    </main>
  );
}
