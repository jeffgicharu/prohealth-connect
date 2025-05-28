"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import { LoadingButton } from "@/components/ui/loading-button"
import { handleApiError } from '@/lib/utils/errorHandling';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentIntentResponse {
  clientSecret: string;
  bookingAmount: number;
}

interface MpesaResponse {
  ResponseCode: string;
  errorMessage?: string;
  CustomerMessage?: string;
}

// CheckoutForm component
function CheckoutForm({ bookingId, bookingAmount }: { bookingId: string, bookingAmount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!stripe || !elements) {
      toast.error("Payment system is not ready. Please refresh the page and try again.");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/status?booking_id=${bookingId}`,
        },
      });

      if (error) {
        // Map Stripe error types to user-friendly messages
        let userMessage = "An unexpected error occurred. Please try again.";
        
        if (error.type === "card_error") {
          switch (error.code) {
            case "card_declined":
              userMessage = "Your card was declined. Please try a different card.";
              break;
            case "insufficient_funds":
              userMessage = "Your card has insufficient funds.";
              break;
            case "expired_card":
              userMessage = "Your card has expired. Please use a different card.";
              break;
            default:
              userMessage = error.message || "There was a problem with your card. Please try again.";
          }
        } else if (error.type === "validation_error") {
          userMessage = "Please check your card details and try again.";
        }
        
        toast.error(userMessage);
      }
    } catch (err) {
      console.error("Payment confirmation error:", err);
      toast.error("Something went wrong. Please try again or contact support if the issue persists.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement id="payment-element" />
      <LoadingButton
        type="submit"
        className="w-full bg-brand-primary text-white hover:bg-brand-primary-hover py-3 text-lg"
        isLoading={isLoading}
        loadingText="Processing..."
        disabled={!stripe || !elements}
      >
        Pay Ksh {bookingAmount.toFixed(2)}
      </LoadingButton>
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
  const [mpesaPhoneNumber, setMpesaPhoneNumber] = useState('');
  const [isMpesaLoading, setIsMpesaLoading] = useState(false);
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
          console.error('Payment intent creation failed:', {
            error: errorData,
            bookingId,
            status: res.status
          });
          throw new Error(errorData.error || `Failed to initialize payment (${res.status})`);
        }
        return res.json();
      })
      .then((data: PaymentIntentResponse) => {
        setClientSecret(data.clientSecret);
        setBookingAmount(data.bookingAmount);
      })
      .catch((err) => {
        handleApiError(err);
        router.push('/dashboard/bookings');
      })
      .finally(() => setLoading(false));
    } else if (status === 'loading') {
      // Wait for session status
    } else if(!bookingId) {
      toast.error("Invalid booking. Please try again or contact support.");
      router.push('/dashboard/bookings');
      setLoading(false);
    }
  }, [status, bookingId, router]);

  const handleMpesaPayment = async () => {
    if (!mpesaPhoneNumber.match(/^254\d{9}$/)) {
      toast.error("Please enter a valid M-Pesa number starting with 254 followed by 9 digits (e.g., 254712345678).");
      return;
    }
    setIsMpesaLoading(true);
    try {
      const response = await fetch('/api/mpesa/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, phoneNumber: mpesaPhoneNumber }),
      });
      const data: MpesaResponse = await response.json();
      if (!response.ok || data.ResponseCode !== "0") {
        throw new Error(data.errorMessage || data.CustomerMessage || 'Failed to initiate M-Pesa payment.');
      }
      const successMessage = `Payment request sent to ${mpesaPhoneNumber}. Please check your phone and enter your M-Pesa PIN to complete the payment of Ksh ${bookingAmount.toFixed(2)}.`;
      toast.success(successMessage);
    } catch (err) {
      console.error("M-Pesa payment error:", err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Unable to process M-Pesa payment. Please try again or contact support if the issue persists.";
      toast.error(errorMessage);
    } finally {
      setIsMpesaLoading(false);
    }
  };

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
          <Tabs defaultValue="card" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="card">Card Payment</TabsTrigger>
              <TabsTrigger value="mpesa">M-Pesa</TabsTrigger>
            </TabsList>
            <TabsContent value="card">
              <Elements options={options} stripe={stripePromise}>
                <CheckoutForm 
                  bookingId={bookingId} 
                  bookingAmount={bookingAmount} 
                />
              </Elements>
            </TabsContent>
            <TabsContent value="mpesa">
              <div className="space-y-4">
                <Input 
                  type="tel" 
                  placeholder="M-Pesa Number (e.g., 254712345678)" 
                  value={mpesaPhoneNumber}
                  onChange={(e) => setMpesaPhoneNumber(e.target.value)}
                  disabled={isMpesaLoading}
                />
                <LoadingButton
                  onClick={handleMpesaPayment}
                  className="w-full bg-green-600 text-white hover:bg-green-700 py-3 text-lg"
                  isLoading={isMpesaLoading}
                  loadingText="Initiating..."
                >
                  Pay Ksh {bookingAmount.toFixed(2)} with M-Pesa
                </LoadingButton>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}