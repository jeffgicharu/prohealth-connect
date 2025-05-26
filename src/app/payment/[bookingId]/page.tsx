"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// CheckoutForm component
function CheckoutForm({ bookingId, bookingAmount }: { bookingId: string, bookingAmount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    if (!stripe || !elements) {
      setErrorMessage("Stripe is not ready. Please try again in a moment.");
      setIsLoading(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/status?booking_id=${bookingId}`,
      },
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setErrorMessage(error.message || "An unexpected error occurred.");
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement id="payment-element" />
      <Button
        disabled={isLoading || !stripe || !elements}
        type="submit"
        className="w-full bg-brand-primary text-white hover:bg-brand-primary-hover py-3 text-lg"
      >
        {isLoading ? "Processing..." : `Pay Ksh ${bookingAmount.toFixed(2)}`}
      </Button>
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}

// Main Payment Page Component
export default function PaymentPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [bookingAmount, setBookingAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/payment/${bookingId}`);
      return;
    }

    if (status === 'authenticated' && bookingId) {
      fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `Failed to initialize payment (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        setClientSecret(data.clientSecret);
        setBookingAmount(data.bookingAmount);
      })
      .catch((err: unknown) => {
        console.error("Error fetching client secret:", err);
        const errorMessage = err instanceof Error ? err.message : "Could not initialize payment. Please try again.";
        setError(errorMessage);
      })
      .finally(() => setLoading(false));
    } else if (status === 'loading') {
      // Wait for session status
    } else if(!bookingId) {
      setError("Booking ID is missing.");
      setLoading(false);
    }
  }, [bookingId, status, session, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">Loading Payment Gateway...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret || !bookingAmount) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">Could not load payment form. Please try again.</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: { theme: 'stripe' },
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Complete Your Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm 
              bookingId={bookingId} 
              bookingAmount={bookingAmount} 
            />
          </Elements>
        </CardContent>
      </Card>
    </div>
  );
}