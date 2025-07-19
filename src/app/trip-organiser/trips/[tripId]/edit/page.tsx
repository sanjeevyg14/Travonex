import { TripForm } from "@/components/trips/TripForm";
import { notFound } from "next/navigation";

async function getTrip(tripId: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/trips/${tripId}`);
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

export default async function EditTripPage({ params }: { params: { tripId: string } }) {
    const trip = await getTrip(params.tripId);
    if (!trip) {
        notFound();
    }
  
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
                Editing: {trip.title}
            </h1>
            <p className="text-lg text-muted-foreground">
                Make changes to your trip listing below.
            </p>
        </div>
        <TripForm trip={trip} />
    </main>
  );
}
