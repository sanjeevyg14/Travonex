import { TripForm } from "@/components/trips/TripForm";

export default function NewTripPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
            Create a New Trip
            </h1>
            <p className="text-lg text-muted-foreground">
                Fill out the form below to add a new trip to your listings.
            </p>
        </div>
        <TripForm />
    </main>
  );
}
