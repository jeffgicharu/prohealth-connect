import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

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

    console.log(`🔍 Creating PaymentIntent for booking: ${bookingId}`);

    // 1. Fetch the booking to get the amount and ensure it's unpaid
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId, userId: session.user.id }, // Ensure user owns the booking
      include: { service: true },
    });

    if (!booking) {
      console.error(`❌ Booking not found or access denied: ${bookingId}`);
      return NextResponse.json({ error: 'Booking not found or access denied' }, { status: 404 });
    }

    if (booking.paymentStatus === 'PAID') {
      console.error(`❌ Booking already paid: ${bookingId}`);
      return NextResponse.json({ error: 'Booking already paid' }, { status: 400 });
    }

    const amountInCents = Math.round(booking.service.price * 100); // Stripe expects amount in cents
    console.log(`💰 Amount in cents: ${amountInCents}`);

    // 2. Create a PaymentIntent with Stripe
    const metadata = {
      bookingId: booking.id,
      userId: session.user.id,
      serviceName: booking.service.name,
    };
    console.log(`📝 Setting PaymentIntent metadata:`, metadata);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'kes', // Using KES as default currency
      metadata,
    });

    console.log(`✅ PaymentIntent created: ${paymentIntent.id}`);
    console.log(`📝 PaymentIntent metadata:`, paymentIntent.metadata);

    // 3. Create a pending transaction record
    await prisma.transaction.create({
      data: {
        bookingId: booking.id,
        amount: booking.service.price,
        currency: 'KES',
        paymentGateway: 'STRIPE',
        gatewayTransactionId: paymentIntent.id,
        status: 'pending',
      },
    });

    console.log(`✅ Transaction record created for booking: ${booking.id}`);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      bookingAmount: booking.service.price,
    });

  } catch (error: any) {
    console.error('❌ Error creating PaymentIntent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create PaymentIntent' },
      { status: 500 }
    );
  }
} 