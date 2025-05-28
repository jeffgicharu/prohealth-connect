import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { MpesaService } from '@/lib/services/mpesa';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Define the STK push schema
const stkPushSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  phoneNumber: z.string()
    .regex(/^254\d{9}$/, 'Phone number must be in format 254XXXXXXXXX (e.g., 254712345678)')
    .min(12, 'Phone number must be 12 digits')
    .max(12, 'Phone number must be 12 digits'),
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
    const validation = stkPushSchema.safeParse(requestBody);

    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { bookingId, phoneNumber } = validation.data;

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

    const mpesaService = MpesaService.getInstance();
    const response = await mpesaService.initiateSTKPush(bookingId, phoneNumber, amount);

    if (response.CheckoutRequestID) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { gatewayCheckoutId: response.CheckoutRequestID },
      });
    }

    return NextResponse.json(response);

  } catch (error) {
    // Log detailed error information for debugging
    console.error("Error initiating M-Pesa STK Push:", {
      error,
      userId: session.user.id,
      bookingId: requestBody && typeof requestBody === 'object' && 'bookingId' in requestBody 
        ? String(requestBody.bookingId) 
        : undefined,
      timestamp: new Date().toISOString()
    });

    // Map common M-Pesa errors to user-friendly messages
    if (error instanceof Error) {
      const errorMessages: { [key: string]: string } = {
        "INVALID_AMOUNT": "The payment amount is invalid. Please try again or contact support.",
        "INVALID_PHONE": "The phone number is not registered for M-Pesa. Please use a registered M-Pesa number.",
        "INSUFFICIENT_FUNDS": "Your M-Pesa account has insufficient funds. Please top up and try again.",
        "SERVICE_UNAVAILABLE": "The M-Pesa service is currently unavailable. Please try again later.",
        "TIMEOUT": "The request timed out. Please try again.",
        "INVALID_ACCOUNT": "Your M-Pesa account is inactive. Please contact Safaricom for assistance.",
      };

      // Check if the error message matches any known error patterns
      for (const [key, message] of Object.entries(errorMessages)) {
        if (error.message.includes(key)) {
          return NextResponse.json({ error: message }, { status: 400 });
        }
      }

      // If it's a known error type but not in our mapping, use a generic message
      if (error.message.includes('M-Pesa') || error.message.includes('Safaricom')) {
        return NextResponse.json(
          { error: 'Unable to process M-Pesa payment. Please try again or contact support.' },
          { status: 400 }
        );
      }
    }

    // For unknown errors, return a generic message
    return NextResponse.json(
      { error: 'Unable to process payment. Please try again or contact support if the issue persists.' },
      { status: 500 }
    );
  }
}