
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";

import type { Trip } from "@/lib/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface TripBannerSliderProps {
  bannerTrips: Trip[];
}

export function TripBannerSlider({ bannerTrips }: TripBannerSliderProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  if (!bannerTrips || bannerTrips.length === 0) {
    // DEV_COMMENT: Fallback UI when no banner trips are configured by the admin.
    return (
      <div className="relative w-full h-64 md:h-96 bg-muted rounded-lg flex items-center justify-center text-center p-4">
        <div>
          <h2 className="text-2xl font-bold">Your Next Adventure Awaits</h2>
          <p className="text-muted-foreground">Explore curated trips from trusted organizers.</p>
        </div>
      </div>
    );
  }

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
      opts={{
        loop: true,
      }}
    >
      <CarouselContent>
        {bannerTrips.map((trip, index) => (
          <CarouselItem key={trip.id}>
            <div className="relative h-64 md:h-[28rem] w-full">
              <Image
                src={trip.image}
                alt={trip.title}
                fill
                priority={index === 0} // Prioritize loading of the first banner image (LCP element).
                className="rounded-lg brightness-75 object-cover"
                data-ai-hint={trip.imageHint}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
                <h2 className="text-3xl md:text-5xl font-headline font-bold drop-shadow-lg mb-4">
                  {trip.title}
                </h2>
                <p className="max-w-xl text-lg drop-shadow-md mb-6">
                  {trip.location}
                </p>
                <Link href={`/trips/${trip.slug}`}>
                  <Button size="lg">
                    Explore Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:inline-flex bg-background/50 hover:bg-background" />
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:inline-flex bg-background/50 hover:bg-background" />
    </Carousel>
  );
}
