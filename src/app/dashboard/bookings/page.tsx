"use client"

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { getUserBookings } from "@/app/actions/bookingActions";
import { LoadingButton } from "@/components/ui/loading-button";
import { useState, useEffect } from "react";

interface Service {
  id: string;
  name: string;
  price: number;
  description: string | null;
  duration: number | null;
  category: string | null;
  imageUrl: string | null;
  practitionerName: string | null;
}

interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  bookingDate: Date | string; // Allow string for serialized dates
  status: string;
  paymentStatus: string;
  createdAt: Date | string; // Allow string for serialized dates
  updatedAt: Date | string; // Allow string for serialized dates
  service: Service;
}

interface BookingCardProps {
  booking: Booking;
}

function BookingCard({ booking }: BookingCardProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    if (!status) return "outline"; // Handle null/undefined status
    
    switch (status.toUpperCase()) {
      case "CONFIRMED":
      case "PAID":
        return "default";
      case "PENDING":
      case "UNPAID":
        return "secondary";
      case "CANCELLED":
      case "FAILED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handlePaymentNavigation = async () => {
    setIsNavigating(true);
    try {
      await router.push(`/payment/${booking.id}`);
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      // Always reset loading state
      setIsNavigating(false);
    }
  };

  // Safe date formatting with error handling
  const formatBookingDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
      }
      return format(dateObj, "PPP p");
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  return (
    <Card className="mb-4 shadow-md">
      <CardHeader>
        <CardTitle className="text-brand-dark">
          {booking.service?.name || 'Service name unavailable'}
        </CardTitle>
        <CardDescription>
          Booked on: {formatBookingDate(booking.createdAt)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Booking Status:</span>
          <Badge variant={getStatusVariant(booking.status)}>
            {booking.status || 'Unknown'}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Payment Status:</span>
          <Badge variant={getStatusVariant(booking.paymentStatus)}>
            {booking.paymentStatus || 'Unknown'}
          </Badge>
        </div>
        {booking.service?.price && (
          <p className="text-sm text-gray-600">
            Price: Ksh {Number(booking.service.price).toFixed(2)}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        {booking.paymentStatus === "UNPAID" && booking.status !== "CANCELLED" && (
          <LoadingButton
            onClick={handlePaymentNavigation}
            className="bg-brand-primary text-white hover:bg-brand-primary-hover"
            isLoading={isNavigating}
            loadingText="Redirecting..."
          >
            Proceed to Payment
          </LoadingButton>
        )}
      </CardFooter>
    </Card>
  );
}

// Create a client component for the bookings list
function BookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const result = await getUserBookings();
        
        if ('error' in result && result.error) {
          setError(result.error);
        } else if ('bookings' in result) {
          setBookings(result.bookings || []);
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-10 bg-white shadow-md rounded-lg">
          <p className="text-xl text-brand-light-gray mb-4">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-10 bg-white shadow-md rounded-lg">
          <p className="text-xl text-red-500 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-brand-primary text-white hover:bg-brand-primary-hover"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-8">My Bookings</h1>
      {bookings.length === 0 ? (
        <div className="text-center py-10 bg-white shadow-md rounded-lg">
          <p className="text-xl text-brand-light-gray mb-4">You have no bookings yet.</p>
          <Link href="/services">
            <Button className="bg-brand-primary text-white hover:bg-brand-primary-hover">
              Explore Services
            </Button>
          </Link>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}

// Main component - now purely client-side
export default function BookingsPage() {
  return <BookingsList />;
}