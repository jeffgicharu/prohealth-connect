"use client"; // This page will involve client-side interaction for the booking action

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBooking } from '@/app/actions/bookingActions';
import { Service } from '@prisma/client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { LoadingButton } from '@/components/ui/loading-button';
import toast from 'react-hot-toast';
import { handleApiError } from '@/lib/utils/errorHandling';
import { CenteredSpinnerMessage } from '@/components/loading/CenteredSpinnerMessage';

// Helper function to fetch service details client-side if needed,
// or pass service data via props if navigating from a server component.
// For simplicity, let's assume we re-fetch or have basic info.
// A better approach for complex data is server components or dedicated API.

export default function BookServicePage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.serviceId as string;
  const { data: session, status: sessionStatus } = useSession();

  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (serviceId) {
      const fetchService = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/services/${serviceId}`);
          if (!res.ok) {
            if (res.status === 429) {
              throw new Error('You\'ve made too many requests. Please wait a moment before trying again.');
            }
            const errorData = await res.json();
            throw new Error(errorData.message || errorData.error || 'Failed to fetch service');
          }
          const data = await res.json();
          setService(data);
        } catch (err) {
          handleApiError(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchService();
    }
  }, [serviceId]);

  const handleConfirmBooking = async () => {
    if (!session?.user) {
      router.push(`/login?callbackUrl=/book/${serviceId}`);
      return;
    }
    if (!serviceId) {
      toast.error("Service ID is missing.");
      return;
    }

    setIsLoading(true);
    try {
    const result = await createBooking(serviceId);
    if (result.error) {
      toast.error(result.error);
    } else if (result.success && result.booking) {
      toast.success(`${result.success} Your booking ID is ${result.booking.id}. You will proceed to payment next.`);
      router.push(`/dashboard/bookings?bookingId=${result.booking.id}`);
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (sessionStatus === 'loading' || isLoading && !service) {
    return <CenteredSpinnerMessage message="Loading booking details..." />;
  }

  if (!serviceId) {
    return <div className="text-center py-10 text-red-500">Invalid service link.</div>;
  }

  if (!session && sessionStatus === 'unauthenticated') {
    return (
      <div className="text-center py-10">
        <p className="mb-4">Please log in to book this service.</p>
        <Link href={`/login?callbackUrl=/book/${serviceId}`}>
          <LoadingButton className="bg-brand-primary text-white">
            Login
          </LoadingButton>
        </Link>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8 max-w-2xl'>
      <h1 className='text-3xl font-bold text-brand-dark mb-6 text-center'>Confirm Your Booking</h1>
      {service ? (
        <div className='bg-white p-6 shadow-md hover:shadow-lg focus-within:shadow-lg hover:scale-105 hover:-translate-y-1 focus-within:scale-105 focus-within:-translate-y-1 transition-all duration-300 ease-in-out border border-brand-light-gray/20 rounded-lg focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2'>
          <h2 className='text-2xl font-semibold text-brand-primary mb-2'>{service.name}</h2>
          
          {/* Service Details Section */}
          <div className="mb-4 text-sm text-brand-light-gray space-y-1 border-t border-b border-brand-light-gray/10 py-3">
            {service.practitionerName && (
              <p><strong>Practitioner:</strong> {service.practitionerName}</p>
            )}
            {service.duration && (
              <p><strong>Duration:</strong> {service.duration} minutes</p>
            )}
            {service.description && (
              <p><strong>Description:</strong> {service.description}</p>
            )}
          </div>

          <p className='text-brand-light-gray mb-4'>
            You are about to book: <strong>{service.name}</strong>.
            {service.price && ` The price is Ksh ${service.price.toFixed(2)}.`}
          </p>
          <p className='text-sm text-brand-light-gray mb-6'>
            Payment will be required to confirm this booking in the next step. For now, this will create a pending booking.
          </p>
          <LoadingButton
            onClick={handleConfirmBooking}
            disabled={!session}
            className='w-full bg-brand-primary text-white hover:bg-brand-primary-hover py-3 text-lg'
            isLoading={isLoading}
            loadingText="Processing..."
          >
            Confirm Booking & Proceed
          </LoadingButton>
        </div>
      ) : (
        <p className='text-center text-gray-600'>Loading service details or service not found...</p>
      )}
      <div className="mt-8 text-center">
        <Link href={serviceId ? `/services/${serviceId}` : "/services"} className="text-brand-primary hover:underline">
          &larr; Back to service details
        </Link>
      </div>
    </div>
  );
} 