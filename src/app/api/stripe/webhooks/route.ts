import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    if (!sig) {
      console.error('⚠️  Webhook signature missing!');
      return NextResponse.json({ error: 'Webhook signature missing' }, { status: 400 });
    }
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err: any) {
    console.error(`⚠️  Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object as Stripe.PaymentIntent;
      console.log('✅ PaymentIntent succeeded:', paymentIntentSucceeded.id);
      
      const bookingId = paymentIntentSucceeded.metadata.bookingId;
      const amountReceived = paymentIntentSucceeded.amount_received;
      const currency = paymentIntentSucceeded.currency;

      if (!bookingId) {
        console.warn(`⚠️  Booking ID missing in PaymentIntent metadata for PI: ${paymentIntentSucceeded.id}. This might be a PaymentIntent created outside the application.`);
        return NextResponse.json({ 
          received: true,
          warning: 'PaymentIntent processed but no booking ID found in metadata'
        });
      }

      try {
        // Update Booking status
        const updatedBooking = await prisma.booking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
          },
        });

        // Create or update Transaction record
        const existingTransaction = await prisma.transaction.findUnique({
          where: { bookingId },
        });

        if (existingTransaction) {
          await prisma.transaction.update({
            where: { id: existingTransaction.id },
            data: {
              status: 'completed',
              gatewayTransactionId: paymentIntentSucceeded.id,
            },
          });
        } else {
          await prisma.transaction.create({
            data: {
              bookingId,
              amount: amountReceived / 100,
              currency: currency.toUpperCase(),
              paymentGateway: 'STRIPE',
              gatewayTransactionId: paymentIntentSucceeded.id,
              status: 'completed',
            },
          });
        }
        console.log(`✅ Updated booking ${bookingId} to PAID and CONFIRMED.`);
      } catch (dbError) {
        console.error(`❌ Error updating database for booking ${bookingId}:`, dbError);
        return NextResponse.json({ error: 'Database update failed after payment.' }, { status: 500 });
      }
      break;

    case 'payment_intent.payment_failed':
      const paymentIntentFailed = event.data.object as Stripe.PaymentIntent;
      console.log('❌ PaymentIntent failed:', paymentIntentFailed.id);
      
      const failedBookingId = paymentIntentFailed.metadata.bookingId;
      if (!failedBookingId) {
        console.warn(`⚠️  Booking ID missing in failed PaymentIntent metadata for PI: ${paymentIntentFailed.id}. This might be a PaymentIntent created outside the application.`);
        return NextResponse.json({ 
          received: true,
          warning: 'PaymentIntent failed but no booking ID found in metadata'
        });
      }

      try {
        await prisma.booking.update({
          where: { id: failedBookingId },
          data: { 
            paymentStatus: 'FAILED',
            status: 'PENDING',
          },
        });

        // Update transaction record if it exists
        const existingTransaction = await prisma.transaction.findUnique({
          where: { bookingId: failedBookingId },
        });

        if (existingTransaction) {
          await prisma.transaction.update({
            where: { id: existingTransaction.id },
            data: {
              status: 'failed',
              gatewayTransactionId: paymentIntentFailed.id,
            },
          });
        }
        console.log(`✅ Updated booking ${failedBookingId} to FAILED.`);
      } catch (dbError) {
        console.error(`❌ Error updating booking ${failedBookingId} to FAILED:`, dbError);
        return NextResponse.json({ error: 'Database update failed after payment failure.' }, { status: 500 });
      }
      break;

    case 'charge.refunded':
      const chargeRefunded = event.data.object as Stripe.Charge;
      const refundedPaymentIntent = chargeRefunded.payment_intent as string;
      
      if (refundedPaymentIntent) {
        const paymentIntent = await stripe.paymentIntents.retrieve(refundedPaymentIntent);
        const refundedBookingId = paymentIntent.metadata.bookingId;

        if (!refundedBookingId) {
          console.warn(`⚠️  Booking ID missing in refunded PaymentIntent metadata for PI: ${refundedPaymentIntent}. This might be a PaymentIntent created outside the application.`);
          return NextResponse.json({ 
            received: true,
            warning: 'PaymentIntent refunded but no booking ID found in metadata'
          });
        }

        try {
          await prisma.booking.update({
            where: { id: refundedBookingId },
            data: {
              paymentStatus: 'REFUNDED',
              status: 'CANCELLED',
            },
          });

          // Update transaction record
          const existingTransaction = await prisma.transaction.findUnique({
            where: { bookingId: refundedBookingId },
          });

          if (existingTransaction) {
            await prisma.transaction.update({
              where: { id: existingTransaction.id },
              data: {
                status: 'refunded',
              },
            });
          }
          console.log(`✅ Updated booking ${refundedBookingId} to REFUNDED and CANCELLED.`);
        } catch (dbError) {
          console.error(`❌ Error updating booking ${refundedBookingId} for refund:`, dbError);
          return NextResponse.json({ error: 'Database update failed after refund.' }, { status: 500 });
        }
      }
      break;

    default:
      console.log(`ℹ️  Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
} 