import { StripeService } from './stripe';
import { prisma } from '@doxie/db';
import Stripe from 'stripe';
import { SubscriptionStatus } from '@prisma/client';

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
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
       await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
       break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const inv = invoice as any;
  if (inv.subscription) {
    const subId = typeof inv.subscription === 'string' ? inv.subscription : inv.subscription.id;

    await prisma.invoice.upsert({
        where: { stripeId: inv.id },
        create: {
            stripeId: inv.id,
            amount: inv.amount_paid,
            currency: inv.currency,
            status: inv.status || 'unknown',
            periodStart: new Date(inv.period_start * 1000),
            periodEnd: new Date(inv.period_end * 1000),
            customerId: typeof inv.customer === 'string' ? inv.customer : (inv.customer as any).id,
            subscriptionId: subId
        },
        update: {
            status: inv.status || 'unknown',
            amount: inv.amount_paid
        }
    });
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const sub = subscription as any;
    const statusMap: Record<string, SubscriptionStatus> = {
        active: 'ACTIVE',
        canceled: 'CANCELED',
        incomplete: 'INCOMPLETE',
        incomplete_expired: 'INCOMPLETE_EXPIRED',
        past_due: 'PAST_DUE',
        trialing: 'TRIALING',
        unpaid: 'UNPAID',
        paused: 'PAUSED'
    };

    const status = statusMap[sub.status] || 'ACTIVE';
    const organizationId = sub.metadata?.organizationId;

    if (!organizationId) {
        // Try to find existing subscription to update without needing orgId
        const existing = await prisma.subscription.findUnique({
            where: { stripeSubscriptionId: sub.id }
        });

        if (!existing) {
             console.error(`Cannot create subscription ${sub.id} without organizationId in metadata`);
             return;
        }

        // Update existing
         await prisma.subscription.update({
            where: { stripeSubscriptionId: sub.id },
            data: {
                 status: status,
                 currentPeriodStart: new Date(sub.current_period_start * 1000),
                 currentPeriodEnd: new Date(sub.current_period_end * 1000),
                 cancelAtPeriodEnd: sub.cancel_at_period_end,
            }
        });
        return;
    }

    await prisma.subscription.upsert({
        where: { stripeSubscriptionId: sub.id },
        create: {
             stripeSubscriptionId: sub.id,
             stripeCustomerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
             status: status,
             plan: sub.items.data[0]?.price.id || 'unknown',
             currentPeriodStart: new Date(sub.current_period_start * 1000),
             currentPeriodEnd: new Date(sub.current_period_end * 1000),
             cancelAtPeriodEnd: sub.cancel_at_period_end,
             organizationId: organizationId
        },
        update: {
             status: status,
             currentPeriodStart: new Date(sub.current_period_start * 1000),
             currentPeriodEnd: new Date(sub.current_period_end * 1000),
             cancelAtPeriodEnd: sub.cancel_at_period_end,
        }
    });
}
