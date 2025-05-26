"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function PaymentStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Verifying payment status...');

  useEffect(() => {
    const payment_intent = searchParams.get('payment_intent');
    const payment_intent_client_secret = searchParams.get('payment_intent_client_secret');
    const redirect_status = searchParams.get('redirect_status');
    const booking_id = searchParams.get('booking_id');

    if (!payment_intent || !payment_intent_client_secret || !redirect_status || !booking_id) {
      setStatus('error');
      setMessage('Invalid payment status parameters.');
      return;
    }

    // Verify the payment status with your backend
    fetch('/api/stripe/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payment_intent,
        payment_intent_client_secret,
        redirect_status,
        booking_id,
      }),
    })
    .then(async (res) => {
      if (!res.ok) {
        throw new Error('Failed to verify payment');
      }
      const data = await res.json();
      setStatus(data.status === 'succeeded' ? 'success' : 'error');
      setMessage(data.message || (data.status === 'succeeded' ? 'Payment successful!' : 'Payment failed.'));
    })
    .catch((error) => {
      console.error('Error verifying payment:', error);
      setStatus('error');
      setMessage('Failed to verify payment status. Please contact support.');
    });
  }, [searchParams]);

  const handleViewBooking = () => {
    const booking_id = searchParams.get('booking_id');
    if (booking_id) {
      router.push(`/dashboard/bookings?bookingId=${booking_id}`);
    } else {
      router.push('/dashboard/bookings');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Payment Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center py-4">
            {status === 'loading' && (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            )}
            {status === 'success' && (
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="h-12 w-12 text-red-500" />
            )}
          </div>

          <div className="text-center">
            <p className="text-lg font-medium mb-4">{message}</p>
            {status !== 'loading' && (
              <Button
                onClick={handleViewBooking}
                className="bg-brand-primary text-white hover:bg-brand-primary-hover"
              >
                View Booking
              </Button>
            )}
          </div>

          {status === 'error' && (
            <Alert variant="destructive">
              <AlertDescription>
                If you believe this is an error, please contact our support team for assistance.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 