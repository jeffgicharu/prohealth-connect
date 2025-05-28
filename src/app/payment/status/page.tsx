"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { handleApiError } from '@/lib/utils/errorHandling';
import toast from 'react-hot-toast';

export default function PaymentStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'processing' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Verifying payment status...');

  useEffect(() => {
    const payment_intent = searchParams.get('payment_intent');
    const payment_intent_client_secret = searchParams.get('payment_intent_client_secret');
    const redirect_status = searchParams.get('redirect_status');
    const booking_id = searchParams.get('booking_id');

    if (!payment_intent || !payment_intent_client_secret || !redirect_status || !booking_id) {
      setStatus('error');
      setMessage('Invalid payment status parameters.');
      toast.error('Invalid payment status parameters.');
      return;
    }

    // Set initial status based on redirect_status
    if (redirect_status === 'succeeded') {
      setStatus('success');
      setMessage('Your payment was successful! Your booking is confirmed. You will receive a confirmation email shortly.');
      toast.success('Payment successful! Your booking is confirmed.');
    } else if (redirect_status === 'processing') {
      setStatus('processing');
      setMessage('Your payment is processing. We will update you when payment has been received.');
      toast.loading('Payment is processing...', { duration: 4000 });
    } else if (redirect_status === 'requires_payment_method') {
      setStatus('error');
      setMessage('Payment failed. Please try another payment method.');
      toast.error('Payment failed. Please try another payment method.');
    } else {
      setStatus('error');
      setMessage('Something went wrong with your payment. Please try again or contact support.');
      toast.error('Something went wrong with your payment. Please try again or contact support.');
    }
  }, [searchParams]);

  const handleViewBooking = () => {
    router.push('/dashboard');
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
            {status === 'processing' && (
              <AlertTriangle className="h-12 w-12 text-yellow-500" />
            )}
            {status === 'error' && (
              <XCircle className="h-12 w-12 text-red-500" />
            )}
          </div>

          <div className="text-center">
            <p className="text-lg font-medium mb-4">{message}</p>
            <div className="space-y-4">
              {status !== 'loading' && (
                <Button
                  onClick={handleViewBooking}
                  className="w-full bg-brand-primary text-white hover:bg-brand-primary-hover"
                >
                  View My Bookings
                </Button>
              )}
              {status === 'error' && searchParams.get('booking_id') && (
                <Link href={`/payment/${searchParams.get('booking_id')}`}>
                  <Button variant="outline" className="w-full border-brand-primary text-brand-primary">
                    Try Payment Again
                  </Button>
                </Link>
              )}
              <Link href="/services">
                <Button variant="ghost" className="w-full text-brand-primary">
                  Explore More Services
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 