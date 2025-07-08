
'use client';

import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type ClientOnlyDateProps = {
  dateString: string;
  type?: 'full' | 'date' | 'time';
  options?: Intl.DateTimeFormatOptions;
  className?: string;
};

/**
 * Renders a date string in the user's local format safely on the client-side
 * to prevent SSR hydration mismatch errors. Shows a skeleton loader on initial render.
 */
export const ClientOnlyDate = ({ dateString, type = 'full', options, className }: ClientOnlyDateProps) => {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!dateString) {
    return null;
  }
  
  const date = new Date(dateString);

  // On the server or during initial client render, show a skeleton loader.
  if (!isClient) {
    return <Skeleton className={cn("h-5 w-24 inline-block", className)} />;
  }
  
  // On the client after mounting, render the locale-specific format.
  let clientRenderedDate;
  switch (type) {
      case 'date':
        clientRenderedDate = <span className={className}>{date.toLocaleDateString(undefined, options)}</span>;
        break;
      case 'time':
        clientRenderedDate = <span className={className}>{date.toLocaleTimeString(undefined, options)}</span>;
        break;
      case 'full':
      default:
        clientRenderedDate = <span className={className}>{date.toLocaleString(undefined, options)}</span>;
        break;
  }

  return clientRenderedDate;
};
