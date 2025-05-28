import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { StripeService } from '@/lib/services/stripe';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Define the payment intent schema
const paymentIntentSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let requestBody: unknown;
  try {
    requestBody = await request.json();
  
    // Validate input using Zod schema
    const validation = paymentIntentSchema.safeParse(requestBody);

    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { bookingId } = validation.data;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId, userId: session.user.id },
      include: { service: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found or access denied' }, { status: 404 });
    }
    if (booking.paymentStatus === 'PAID') {
      return NextResponse.json({ error: 'Booking already paid' }, { status: 400 });
    }

    const amount = Math.round(booking.service.price);
    if (amount < 1) {
      return NextResponse.json({ error: 'Amount must be at least 1 KES' }, { status: 400 });
    }

    const stripeService = StripeService.getInstance();
    const paymentIntent = await stripeService.createPaymentIntent(amount);

    console.log('Created payment intent:', paymentIntent);

    return NextResponse.json({
      clientSecret: paymentIntent.clientSecret,
      bookingAmount: amount
    });
  } catch (error) {
    // Log detailed error information for debugging
    console.error('Error creating payment intent:', {
      error,
      userId: session.user.id,
      bookingId: requestBody && typeof requestBody === 'object' && 'bookingId' in requestBody 
        ? String(requestBody.bookingId) 
        : undefined,
      timestamp: new Date().toISOString()
    });

    // Map common Stripe errors to user-friendly messages
    if (error instanceof Error) {
      const errorMessages: { [key: string]: string } = {
        "card_error": "There was a problem with your card. Please check your card details and try again.",
        "invalid_request_error": "The payment request was invalid. Please try again.",
        "api_error": "The payment service is currently unavailable. Please try again later.",
        "rate_limit_error": "Too many payment attempts. Please wait a moment and try again.",
        "authentication_error": "Unable to authenticate with the payment service. Please try again.",
        "permission_error": "You don't have permission to make this payment. Please contact support.",
        "invalid_grant": "The payment session has expired. Please try again.",
        "booking_not_found": "The booking could not be found. Please try again or contact support.",
        "booking_already_paid": "This booking has already been paid for.",
        "invalid_amount": "The payment amount is invalid. Please contact support.",
        "service_unavailable": "The payment service is temporarily unavailable. Please try again later.",
      };

      // Check if the error message matches any known error patterns
      for (const [key, message] of Object.entries(errorMessages)) {
        if (error.message.toLowerCase().includes(key)) {
          return NextResponse.json({ 
            error: message,
            message: message
          }, { status: 400 });
        }
      }

      // If it's a known Stripe error but not in our mapping, use a generic message
      if (error.message.includes('Stripe') || error.message.includes('payment')) {
        return NextResponse.json(
          { 
            error: 'Unable to process payment. Please try again or contact support.',
            message: 'Unable to process payment. Please try again or contact support.'
          },
          { status: 400 }
        );
      }
    }

    // For unknown errors, return a generic message
    return NextResponse.json(
      { 
        error: 'Unable to process payment. Please try again or contact support if the issue persists.',
        message: 'Unable to process payment. Please try again or contact support if the issue persists.'
      },
      { status: 500 }
    );
  }
}