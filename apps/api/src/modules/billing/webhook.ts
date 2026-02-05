import { Request, Response } from 'express';
import { stripeService } from './stripe';
import { prisma } from '@doxie/db';
import { env } from '../../config/env';

export const handleWebhook = async (req: Request, res: Response) => {
  let sig = req.headers['stripe-signature'];

  if (!sig || !env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).send('Webhook Error: Missing signature or secret');
  }

  if (Array.isArray(sig)) {
    sig = sig[0];
  }

  let event;

  try {
    event = stripeService.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as any;
        await upsertSubscription(subscription);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error('Error handling webhook event:', error);
    return res.status(500).send('Internal Server Error');
  }

  res.send();
};

async function upsertSubscription(subscription: any) {
    const statusMap: Record<string, any> = {
        'active': 'ACTIVE',
        'canceled': 'CANCELED',
        'incomplete': 'INCOMPLETE',
        'incomplete_expired': 'INCOMPLETE_EXPIRED',
        'past_due': 'PAST_DUE',
        'trialing': 'TRIALING',
        'unpaid': 'UNPAID',
        'paused': 'PAUSED'
    };

    const status = statusMap[subscription.status] || 'INCOMPLETE';
    const orgId = subscription.metadata?.organizationId;

    if (!orgId) {
        // Try to find by stripeSubscriptionId if update
        const existing = await prisma.subscription.findUnique({
            where: { stripeSubscriptionId: subscription.id }
        });
        if (!existing) {
             console.error('Missing organizationId in metadata for new subscription');
             return;
        }
    }

    const data = {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        status: status,
        plan: subscription.items.data[0].price.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
    };

    if (orgId) {
        await prisma.subscription.upsert({
            where: { organizationId: orgId },
            create: {
                organizationId: orgId,
                ...data
            },
            update: data
        });
    } else {
         await prisma.subscription.update({
            where: { stripeSubscriptionId: subscription.id },
            data: data
        });
    }
}
