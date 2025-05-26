"use client"; // This page will involve client-side interaction for the booking action

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createBooking } from '@/app/actions/bookingActions';
import { Service } from '@prisma/client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (serviceId) {
      const fetchService = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/services/${serviceId}`);
          if (!res.ok) {
            throw new Error('Failed to fetch service');
          }
          const data = await res.json();
          setService(data);
        } catch (err) {
          console.error('Error fetching service:', err);
          setError("Failed to load service details.");
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
      setError("Service ID is missing.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    const result = await createBooking(serviceId);
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.success && result.booking) {
      setSuccess(`${result.success} Your booking ID is ${result.booking.id}. You will proceed to payment next.`);
      router.push(`/dashboard/bookings?bookingId=${result.booking.id}`);
    }
  };

  if (sessionStatus === 'loading' || isLoading && !service) {
    return <div className="text-center py-10">Loading booking details...</div>;
  }

  if (!serviceId) {
    return <div className="text-center py-10 text-red-500">Invalid service link.</div>;
  }

  if (!session && sessionStatus === 'unauthenticated') {
    return (
      <div className="text-center py-10">
        <p className="mb-4">Please log in to book this service.</p>
        <Link href={`/login?callbackUrl=/book/${serviceId}`}>
          <Button className="bg-brand-primary text-white">Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8 max-w-2xl'>
      <h1 className='text-3xl font-bold text-brand-dark mb-6 text-center'>Confirm Your Booking</h1>
      {service ? (
        <div className='bg-white p-6 shadow-lg rounded-lg'>
          <h2 className='text-2xl font-semibold text-brand-primary mb-2'>{service.name}</h2>
          <p className='text-gray-700 mb-4'>
            You are about to book: <strong>{service.name}</strong>.
            {service.price && ` The price is Ksh ${service.price.toFixed(2)}.`}
          </p>
          <p className='text-sm text-gray-600 mb-6'>
            Payment will be required to confirm this booking in the next step. For now, this will create a pending booking.
          </p>
          <Button
            onClick={handleConfirmBooking}
            disabled={isLoading || !session}
            className='w-full bg-brand-primary text-white hover:bg-brand-primary-hover py-3 text-lg'
          >
            {isLoading ? 'Processing...' : 'Confirm Booking & Proceed'}
          </Button>
        </div>
      ) : (
        <p className='text-center text-gray-600'>Loading service details or service not found...</p>
      )}
      {error && <p className='mt-4 text-center text-red-500 bg-red-100 p-3 rounded-md'>{error}</p>}
      {success && <p className='mt-4 text-center text-green-600 bg-green-100 p-3 rounded-md'>{success}</p>}
      <div className="mt-8 text-center">
        <Link href={serviceId ? `/services/${serviceId}` : "/services"} className="text-brand-primary hover:underline">
          &larr; Back to service details
        </Link>
      </div>
    </div>
  );
} 