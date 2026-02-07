import { Request, Response } from 'express';
import { stripeService } from './stripe';
import { prisma } from '@doxie/db';
import Stripe from 'stripe';
import { SubscriptionStatus } from '@prisma/client';
import { env } from '../../config/env';

export const handleWebhook = async (req: Request, res: Response) => {
  let sig = req.headers['stripe-signature'];

  if (!sig || !env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).send('Webhook Error: Missing signature or secret');
  }

  if (Array.isArray(sig)) {
    sig = sig[0];
  }

  let event: Stripe.Event;

  try {
    event = stripeService.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
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

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionEvent(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.send();
  } catch (error) {
    console.error('Error handling webhook event:', error);
    return res.status(500).send('Internal Server Error');
  }
};

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const inv = invoice as any;

  if (!inv.subscription) return;

  const subId =
    typeof inv.subscription === 'string'
      ? inv.subscription
      : inv.subscription.id;

  await prisma.invoice.upsert({
    where: { stripeId: inv.id },
    create: {
      stripeId: inv.id,
      amount: inv.amount_paid,
      currency: inv.currency,
      status: inv.status || 'unknown',
      periodStart: new Date(inv.period_start * 1000),
      periodEnd: new Date(inv.period_end * 1000),
      customerId:
        typeof inv.customer === 'string'
          ? inv.customer
          : (inv.customer as any).id,
      subscriptionId: subId,
    },
    update: {
      status: inv.status || 'unknown',
      amount: inv.amount_paid,
    },
  });
}

async function handleSubscriptionEvent(subscription: Stripe.Subscription) {
  const sub = subscription as any;

  const statusMap: Record<string, SubscriptionStatus> = {
    active: 'ACTIVE',
    canceled: 'CANCELED',
    incomplete: 'INCOMPLETE',
    incomplete_expired: 'INCOMPLETE_EXPIRED',
    past_due: 'PAST_DUE',
    trialing: 'TRIALING',
    unpaid: 'UNPAID',
    paused: 'PAUSED',
  };

  const status = statusMap[sub.status] || 'INCOMPLETE';
  const organizationId = sub.metadata?.organizationId;

  const data = {
    stripeSubscriptionId: sub.id,
    stripeCustomerId:
      typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
    status,
    plan: sub.items.data[0]?.price.id || 'unknown',
    currentPeriodStart: new Date(sub.current_period_start * 1000),
    currentPeriodEnd: new Date(sub.current_period_end * 1000),
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  };

  if (!organizationId) {
    const existing = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: sub.id },
    });

    if (!existing) {
      console.error(
        `Cannot create subscription ${sub.id} without organizationId in metadata`
      );
      return;
    }

    await prisma.subscription.update({
      where: { stripeSubscriptionId: sub.id },
      data,
    });

    return;
  }

  await prisma.subscription.upsert({
    where: { organizationId },
    create: {
      organizationId,
      ...data,
    },
    update: data,
  });
}
