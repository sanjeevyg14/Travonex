import { TripForm } from "@/components/trips/TripForm";
import { trips } from "@/lib/mock-data";
import { notFound } from "next/navigation";

export default function EditTripPage({ params }: { params: { tripId: string } }) {
    const trip = trips.find(t => t.id === params.tripId);
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
