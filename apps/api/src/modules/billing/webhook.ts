import { StripeService } from './stripe';
import { prisma } from '@doxie/db';
import Stripe from 'stripe';

const stripeService = new StripeService();

export async function handleStripeWebhook(payload: Buffer, signature: string) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not defined');

  let event: Stripe.Event;

  try {
    event = stripeService.constructEvent(payload, signature, secret);
  } catch (err: any) {
    throw new Error(`Webhook Error: ${err.message}`);
  }

  // Record event
  await prisma.webhookEvent.create({
    data: {
      source: 'stripe',
      externalId: event.id,
      type: event.type,
      data: event.data.object as any,
      status: 'processed',
    },
  });

  switch (event.type) {
    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if ((invoice as any).subscription) {
    const sub = (invoice as any).subscription;
    const subId = typeof sub === 'string' ? sub : sub.id;

    try {
      await prisma.subscription.update({
        where: { stripeSubscriptionId: subId },
        data: {
          status: 'ACTIVE',
          // Real implementation would parse lines[0].period.end etc
        },
      });
    } catch (e) {
      console.error(`Subscription not found for invoice ${subId}`, e);
    }
  }
}
