import Stripe from 'stripe';
import { env } from '../../config/env';

export class StripeService {
  public stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY || 'mock', {
      apiVersion: '2025-01-27.acacia' as any,
    });
  }

  async createCustomer(email: string, name?: string, metadata?: Record<string, string>) {
    return this.stripe.customers.create({
      email,
      name,
      metadata,
    });
  }

  async createSubscription(customerId: string, priceId: string) {
    return this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
  }

  async createPortalSession(customerId: string, returnUrl: string) {
    return this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  constructEvent(payload: string | Buffer, sig: string, secret: string) {
    return this.stripe.webhooks.constructEvent(payload, sig, secret);
  }
}

export const stripeService = new StripeService();
