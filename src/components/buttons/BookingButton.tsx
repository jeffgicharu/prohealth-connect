"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { memo } from 'react';

interface BookingButtonProps {
  serviceId: string;
}

const BookingButton = memo(function BookingButton({ serviceId }: BookingButtonProps) {
  return (
    <Link href={`/book/${serviceId}`}>
      <Button size='lg' className='bg-brand-primary text-white hover:bg-brand-primary-hover px-8 py-3 text-lg'>
        Book This Service
      </Button>
    </Link>
  );
});

BookingButton.displayName = 'BookingButton';

export { BookingButton }; 