import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { StripeService } from '@/lib/services/stripe';
import { BookingService } from '@/lib/services/booking';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { paymentIntentId } = body;

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Payment Intent ID is required' }, { status: 400 });
    }

    const stripeService = StripeService.getInstance();
    const paymentStatus = await stripeService.verifyPayment(paymentIntentId);

    if (paymentStatus.status === 'succeeded') {
      const bookingService = BookingService.getInstance();
      // Update booking status to paid
      await bookingService.updateBookingStatus(
        paymentStatus.paymentIntentId,
        'CONFIRMED',
        'PAID'
      );
    }

    return NextResponse.json(paymentStatus);
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to verify payment' },
      { status: 500 }
    );
  }
}