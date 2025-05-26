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
    const { payment_intent, payment_intent_client_secret, redirect_status, booking_id } = body;

    if (!payment_intent || !payment_intent_client_secret || !redirect_status || !booking_id) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Verify the payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent);

    // Ensure the payment intent belongs to the user's booking
    const booking = await prisma.booking.findUnique({
      where: { 
        id: booking_id,
        userId: session.user.id,
      },
      include: {
        transaction: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found or access denied' }, { status: 404 });
    }

    if (paymentIntent.client_secret !== payment_intent_client_secret) {
      return NextResponse.json({ error: 'Invalid payment intent' }, { status: 400 });
    }

    // Update the booking and transaction status based on the payment result
    if (paymentIntent.status === 'succeeded') {
      // Update the booking status
      await prisma.booking.update({
        where: { id: booking_id },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
        },
      });

      // Update or create the transaction record
      if (booking.transaction) {
        await prisma.transaction.update({
          where: { id: booking.transaction.id },
          data: {
            status: 'completed',
            gatewayTransactionId: payment_intent,
          },
        });
      } else {
        await prisma.transaction.create({
          data: {
            bookingId: booking_id,
            amount: paymentIntent.amount / 100, // Convert from cents to dollars
            currency: paymentIntent.currency.toUpperCase(),
            paymentGateway: 'STRIPE',
            gatewayTransactionId: payment_intent,
            status: 'completed',
          },
        });
      }

      return NextResponse.json({
        status: 'succeeded',
        message: 'Payment successful! Your booking has been confirmed.',
      });
    } else {
      // Update the booking status for failed payment
      await prisma.booking.update({
        where: { id: booking_id },
        data: {
          paymentStatus: 'FAILED',
        },
      });

      // Update the transaction record if it exists
      if (booking.transaction) {
        await prisma.transaction.update({
          where: { id: booking.transaction.id },
          data: {
            status: 'failed',
          },
        });
      }

      return NextResponse.json({
        status: 'failed',
        message: 'Payment failed. Please try again or contact support.',
      });
    }
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
} 