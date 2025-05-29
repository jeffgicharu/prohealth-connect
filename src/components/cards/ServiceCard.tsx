"use client";

import { Service } from '@prisma/client';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Clock, UserCircle } from 'lucide-react';
import { ServiceCardActions } from './ServiceCardActions';
import { useState, memo } from 'react';

interface ServiceCardProps {
  service: Service;
}

// Base64 encoded tiny placeholder image (1x1 pixel transparent)
const blurDataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const ServiceCard = memo(function ServiceCard({ service }: ServiceCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  // Generate a placeholder image URL with the service name
  const placeholderSrc = `https://placehold.co/600x400/E2E8F0/AAAAAA?text=${encodeURIComponent(service.name || 'Service')}`;

  return (
    <Card className='flex flex-col h-full overflow-hidden shadow-md hover:shadow-lg focus-within:shadow-lg hover:scale-105 hover:-translate-y-1 focus-within:scale-105 focus-within:-translate-y-1 transition-all duration-300 ease-in-out border border-brand-light-gray/20 rounded-lg'>
      <div className='relative w-full h-48 bg-gray-100'>
        <Image
          src={service.imageUrl || placeholderSrc}
          alt={service.name || 'Service Image'}
          fill
          className={`
            object-cover transition-opacity duration-300
            ${isLoading ? 'opacity-0' : 'opacity-100'}
          `}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
          placeholder="blur"
          blurDataURL={blurDataURL}
          onLoadingComplete={() => setIsLoading(false)}
          onError={(e) => {
            const imageElement = document.querySelector(`img[alt="${service.name || 'Service Image'}"]`) as HTMLImageElement;
            if (imageElement) imageElement.src = placeholderSrc;
          }}
          quality={85}
          aria-label={`Image for ${service.name}`}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
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
        <ServiceCardActions serviceId={service.id} />
      </CardFooter>
    </Card>
  );
});

ServiceCard.displayName = 'ServiceCard';

export default ServiceCard; 