"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { LoadingButton } from "@/components/ui/loading-button"
import { handleApiError } from '@/lib/utils/errorHandling';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CenteredSpinnerMessage } from '@/components/loading/CenteredSpinnerMessage';

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

// Define the M-Pesa form schema
const mpesaFormSchema = z.object({
  phoneNumber: z.string()
    .regex(/^254\d{9}$/, "Phone number must be in format 254XXXXXXXXX (e.g., 254712345678)")
    .min(12, "Phone number must be 12 digits")
    .max(12, "Phone number must be 12 digits"),
});

type MpesaFormData = z.infer<typeof mpesaFormSchema>;

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

// M-Pesa Payment Form component
function MpesaPaymentForm({ bookingId, bookingAmount }: { bookingId: string, bookingAmount: number }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MpesaFormData>({
    resolver: zodResolver(mpesaFormSchema),
    mode: "onTouched"
  });

  const onSubmit = async (data: MpesaFormData) => {
    try {
      const response = await fetch('/api/mpesa/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, phoneNumber: data.phoneNumber }),
      });
      const responseData: MpesaResponse = await response.json();
      
      if (!response.ok || responseData.ResponseCode !== "0") {
        // Map M-Pesa error codes to user-friendly messages
        const errorMessages: { [key: string]: string } = {
          "1": "The M-Pesa service is currently unavailable. Please try again later.",
          "2": "Your M-Pesa account has insufficient funds. Please top up and try again.",
          "3": "The phone number is not registered for M-Pesa. Please use a registered M-Pesa number.",
          "4": "The transaction was cancelled. Please try again if you wish to proceed.",
          "5": "The transaction has expired. Please initiate a new payment.",
          "6": "The M-Pesa service is temporarily unavailable. Please try again in a few minutes.",
          "7": "Invalid phone number format. Please enter a valid M-Pesa number starting with 254.",
          "8": "The transaction amount is too low. Please contact support for assistance.",
          "9": "The transaction amount is too high. Please contact support for assistance.",
          "10": "Your M-Pesa account is inactive. Please contact Safaricom for assistance.",
        };

        const errorMessage = errorMessages[responseData.ResponseCode] || 
          responseData.errorMessage || 
          responseData.CustomerMessage || 
          'Unable to process M-Pesa payment. Please try again or contact support if the issue persists.';
        
        throw new Error(errorMessage);
      }

      const successMessage = `Payment request sent to ${data.phoneNumber}. Please check your phone and enter your M-Pesa PIN to complete the payment of Ksh ${bookingAmount.toFixed(2)}.`;
      toast.success(successMessage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unable to process M-Pesa payment. Please try again or contact support if the issue persists.';
      console.error("M-Pesa payment error:", err);
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Input 
          type="tel" 
          placeholder="M-Pesa Number (e.g., 254712345678)" 
          {...register("phoneNumber")}
          disabled={isSubmitting}
          className="border-brand-light-gray/30 focus:border-brand-primary"
        />
        {errors.phoneNumber && (
          <p className="text-sm text-red-500 mt-1">{errors.phoneNumber.message}</p>
        )}
      </div>
      <LoadingButton
        type="submit"
        className="w-full bg-green-600 text-white hover:bg-green-700 py-3 text-lg"
        isLoading={isSubmitting}
        loadingText="Initiating..."
      >
        Pay Ksh {bookingAmount.toFixed(2)} with M-Pesa
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
  const { status } = useSession();
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
          if (res.status === 429) {
            throw new Error('You\'ve made too many payment attempts. Please wait a moment before trying again.');
          }
          throw new Error(errorData.error || errorData.message || `Failed to initialize payment (${res.status})`);
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

  if (status === 'loading' || loading) {
    return <CenteredSpinnerMessage message="Loading payment details..." />;
  }

  const options: StripeElementsOptions = {
    clientSecret: clientSecret || undefined,
    appearance: {
      theme: 'stripe',
    },
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="card" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="card" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Card Payment
              </TabsTrigger>
              <TabsTrigger value="mpesa" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                M-Pesa
              </TabsTrigger>
            </TabsList>
            <TabsContent value="card">
              {clientSecret && (
                <Elements stripe={stripePromise} options={options}>
                  <CheckoutForm bookingId={bookingId} bookingAmount={bookingAmount} />
                </Elements>
              )}
            </TabsContent>
            <TabsContent value="mpesa">
              <MpesaPaymentForm bookingId={bookingId} bookingAmount={bookingAmount} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}