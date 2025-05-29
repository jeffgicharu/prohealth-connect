import { getServiceById } from '@/app/actions/serviceActions';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Briefcase, Clock, UserCircle } from 'lucide-react';
import { BookingButton } from '@/components/buttons/BookingButton';
import { ServiceImageClient } from '@/components/shared/ServiceImageClient';

// Base64 encoded tiny placeholder image (1x1 pixel transparent)
const blurDataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await getServiceById(id);

  if (!service) {
    notFound(); // Triggers the not-found.tsx page or a default 404
  }

  // Generate a placeholder image URL with the service name
  const placeholderSrc = `https://placehold.co/1200x400/E2E8F0/AAAAAA?text=${encodeURIComponent(service.name || 'Service')}`;

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='bg-white shadow-xl rounded-lg overflow-hidden'>
        <div className='relative w-full h-64 md:h-96 bg-gray-100'>
          <ServiceImageClient
            src={service.imageUrl}
            placeholderSrc={placeholderSrc}
            alt={service.name || 'Service Image'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            priority
            blurDataURL={blurDataURL}
            quality={90}
          />
        </div>
        <div className='p-6 md:p-8'>
          <h1 className='text-3xl md:text-4xl font-bold text-brand-dark mb-4'>{service.name}</h1>
          {service.category && (
            <div className="inline-flex items-center bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Briefcase size={16} className="mr-2" />
              {service.category}
            </div>
          )}
          <p className='text-brand-light-gray leading-relaxed mb-6 text-base whitespace-pre-line'>
            {service.description || 'Detailed description not available.'}
          </p>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
            <div className='bg-gray-50 p-6 rounded-lg shadow'>
              <h3 className='text-xl font-semibold text-brand-dark mb-4'>Service Details</h3>
              <div className="mb-6">
                <p className="text-sm text-brand-dark font-medium">Price</p>
                <p className='text-3xl font-bold text-brand-primary mt-1'>
                  Ksh {service.price.toFixed(2)}
                </p>
              </div>
              <ul className='space-y-3 text-sm text-brand-light-gray'>
                {service.practitionerName && (
                  <li className="flex items-center">
                    <UserCircle size={16} className="mr-2 text-brand-primary" />
                    <span>Practitioner: {service.practitionerName}</span>
                  </li>
                )}
                {service.duration && (
                  <li className="flex items-center">
                    <Clock size={16} className="mr-2 text-brand-primary" />
                    <span>Duration: {service.duration} minutes</span>
                  </li>
                )}
              </ul>
            </div>
            {/* You could add another info box here if needed */}
          </div>

          <div className='text-center md:text-left'>
            <BookingButton serviceId={service.id} />
          </div>
        </div>
      </div>
      <div className="mt-8 text-center">
        <Link href="/services" className="text-brand-primary hover:underline">
          &larr; Back to all services
        </Link>
      </div>
    </div>
  );
}