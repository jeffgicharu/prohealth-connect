import { NextResponse } from 'next/server';
import { StripeService } from '@/lib/services/stripe';

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'No signature found' },
        { status: 400 }
      );
    }

    const payload = await request.text();
    const stripeService = StripeService.getInstance();
    await stripeService.handleWebhookEvent(payload, signature);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to handle webhook' },
      { status: 400 }
    );
  }
}