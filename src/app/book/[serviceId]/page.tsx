"use client"; // This page will involve client-side interaction for the booking action

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBooking } from '@/app/actions/bookingActions';
import { Service } from '@prisma/client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { LoadingButton } from '@/components/ui/loading-button';
import toast from 'react-hot-toast';

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
          toast.error("Failed to load service details.");
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
    const result = await createBooking(serviceId);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.success && result.booking) {
      toast.success(`${result.success} Your booking ID is ${result.booking.id}. You will proceed to payment next.`);
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
        <div className='bg-white p-6 shadow-lg rounded-lg'>
          <h2 className='text-2xl font-semibold text-brand-primary mb-2'>{service.name}</h2>
          <p className='text-gray-700 mb-4'>
            You are about to book: <strong>{service.name}</strong>.
            {service.price && ` The price is Ksh ${service.price.toFixed(2)}.`}
          </p>
          <p className='text-sm text-gray-600 mb-6'>
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