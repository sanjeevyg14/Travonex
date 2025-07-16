import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Globe, Compass } from "lucide-react";

export default function AboutUsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">
          About Travonex
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Connecting adventurous souls with unforgettable experiences, one trip at a time.
        </p>
      </div>

      <div className="max-w-4xl mx-auto mt-8 grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Our mission is to make unique, curated travel accessible to everyone. We believe that travel is more than just visiting a new place; it's about creating lasting memories, forging new connections, and discovering yourself along the way. We partner with passionate, local organizers to offer authentic experiences that you won't find anywhere else.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Our Vision</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We envision a world where travel is a force for good, fostering cultural understanding and supporting local communities. Travonex aims to be the most trusted platform for discovering and booking unique adventures, empowering both travelers and organizers to build a more connected and compassionate world.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="max-w-4xl mx-auto mt-8 w-full">
        <CardHeader>
          <CardTitle className="text-center">Why Choose Us?</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <Globe className="h-12 w-12 text-primary mb-4" />
            <h3 className="font-semibold text-lg">Curated Experiences</h3>
            <p className="text-muted-foreground text-sm">Every trip is handpicked and vetted by our team to ensure quality and authenticity.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Users className="h-12 w-12 text-primary mb-4" />
            <h3 className="font-semibold text-lg">Trusted Organizers</h3>
            <p className="text-muted-foreground text-sm">We partner with experienced and passionate local guides and organizers.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Compass className="h-12 w-12 text-primary mb-4" />
            <h3 className="font-semibold text-lg">Seamless Booking</h3>
            <p className="text-muted-foreground text-sm">Find, book, and manage your next adventure with ease on our secure platform.</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
