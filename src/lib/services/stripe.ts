import Stripe from 'stripe';

interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

interface PaymentVerificationResponse {
  status: string;
  paymentIntentId: string;
}

export class StripeService {
  private static instance: StripeService;
  private stripe: Stripe;

  private constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-04-30.basil',
    });
  }

  static getInstance(): StripeService {
    if (!this.instance) {
      this.instance = new StripeService();
    }
    return this.instance;
  }

  async createPaymentIntent(amount: number, currency: string = 'kes'): Promise<PaymentIntentResponse> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret!,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  async verifyPayment(paymentIntentId: string): Promise<PaymentVerificationResponse> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        status: paymentIntent.status,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw new Error('Failed to verify payment');
    }
  }

  async handleWebhookEvent(payload: string, signature: string): Promise<void> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          // Handle successful payment
          break;
        case 'payment_intent.payment_failed':
          // Handle failed payment
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw new Error('Failed to handle webhook event');
    }
  }
}