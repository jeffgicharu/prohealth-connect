"use client";

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { memo } from 'react';

// Dynamically import the Button component with no SSR
const Button = dynamic(() => import('@/components/ui/button').then(mod => mod.Button), {
  ssr: false,
});

interface ServiceCardActionsProps {
  serviceId: string;
}

const ServiceCardActions = memo(function ServiceCardActions({ serviceId }: ServiceCardActionsProps) {
  return (
    <div className="flex gap-2">
      <Link href={`/services/${serviceId}`}>
        <Button variant="outline" size="sm" className="text-sm">
          View Details
        </Button>
      </Link>
      <Link href={`/book/${serviceId}`}>
        <Button size="sm" className="text-sm">
          Book Now
        </Button>
      </Link>
    </div>
  );
});

ServiceCardActions.displayName = 'ServiceCardActions';

export { ServiceCardActions }; 