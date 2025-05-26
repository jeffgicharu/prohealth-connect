"use client";

import { Service } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Clock, UserCircle } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  // Generate a placeholder image URL with the service name
  const placeholderSrc = `https://placehold.co/600x400/E2E8F0/AAAAAA?text=${encodeURIComponent(service.name || 'Service')}`;

  return (
    <Card className='flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300'>
      <div className='relative w-full h-48 bg-gray-100'>
        <Image
          src={placeholderSrc}
          alt={service.name || 'Service Image'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardHeader>
        <CardTitle className='text-xl font-semibold text-brand-dark'>{service.name}</CardTitle>
        {service.category && (
          <div className="flex items-center text-xs text-brand-light-gray mt-1">
            <Briefcase size={14} className="mr-1" />
            {service.category}
          </div>
        )}
      </CardHeader>
      <CardContent className='flex-grow'>
        <CardDescription className='text-sm text-gray-700 line-clamp-3'>
          {service.description || 'No description available.'}
        </CardDescription>
        <div className='mt-3 space-y-1 text-sm text-gray-600'>
          {service.practitionerName && (
            <div className="flex items-center">
              <UserCircle size={16} className="mr-2 text-brand-primary" />
              <span>Practitioner: {service.practitionerName}</span>
            </div>
          )}
          {service.duration && (
            <div className="flex items-center">
              <Clock size={16} className="mr-2 text-brand-primary" />
              <span>Duration: {service.duration} minutes</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className='flex flex-col items-start sm:flex-row sm:justify-between sm:items-center border-t pt-4 mt-auto'>
        <p className='text-lg font-bold text-brand-primary mb-2 sm:mb-0'>
          Ksh {service.price.toFixed(2)}
        </p>
        <div className="flex space-x-2 w-full sm:w-auto">
          <Link href={`/services/${service.id}`} className="flex-1 sm:flex-none">
            <Button variant='outline' className='w-full border-brand-primary text-brand-primary hover:bg-brand-primary/10'>View Details</Button>
          </Link>
          <Link href={`/book/${service.id}`} className="flex-1 sm:flex-none">
            <Button className='w-full bg-brand-primary text-white hover:bg-brand-primary-hover'>Book Now</Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
} 