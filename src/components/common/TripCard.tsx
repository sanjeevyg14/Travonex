
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MapPin } from 'lucide-react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Trip } from '@/lib/types';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';

type TripCardProps = {
  trip: Trip;
  className?: string;
};

export function TripCard({ trip, className }: TripCardProps) {
  const [isFavorite, setIsFavorite] = React.useState(false);

  return (
    <Card className={cn('overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 w-full flex flex-col', className)}>
      <CardHeader className="p-0">
        <div className="relative">
          <Link href={`/trips/${trip.slug}`}>
            <Image
              src={trip.image}
              alt={trip.title}
              width={600}
              height={400}
              className="w-full h-48 object-cover"
              data-ai-hint={trip.imageHint}
            />
          </Link>
          <Badge variant="secondary" className="absolute top-2 left-2">{trip.tripType}</Badge>
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 rounded-full bg-background/70 hover:bg-background"
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart className={cn('h-5 w-5', isFavorite ? 'text-primary fill-current' : 'text-foreground')} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-headline mb-1">
          <Link href={`/trips/${trip.slug}`}>{trip.title}</Link>
        </CardTitle>
        <div className="flex items-center text-muted-foreground text-sm">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{trip.location}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <p className="text-xl font-bold text-primary">₹{trip.price.toLocaleString('en-IN')}</p>
        <Link href={`/trips/${trip.slug}`}>
          <Button>View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export function TripCardSkeleton({ className }: { className?: string }) {
    return (
        <Card className={cn('overflow-hidden w-full flex flex-col', className)}>
            <CardHeader className="p-0">
                <Skeleton className="w-full h-48" />
            </CardHeader>
            <CardContent className="p-4 flex-grow">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-10 w-28" />
            </CardFooter>
        </Card>
    );
}
