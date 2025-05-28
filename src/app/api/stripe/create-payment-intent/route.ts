import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { StripeService } from '@/lib/services/stripe';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

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
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}