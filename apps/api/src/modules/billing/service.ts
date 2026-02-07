import { prisma } from '@doxie/db';
import { AppError } from '../../common/errors';
import { stripeService } from './stripe';
import { ServiceResponse } from '../../common/response';

export class BillingService {
  async createCheckoutSession(userId: string, organizationId: string, priceId: string) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { subscription: true }
    });

    if (!org) throw new AppError('Organization not found', 404);

    let customerId = org.subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripeService.createCustomer(org.name, undefined, { organizationId });
      customerId = customer.id;
    }

    const session = await stripeService.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/${organizationId}/billing?success=true`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/${organizationId}/billing?canceled=true`,
      metadata: {
        organizationId
      }
    });

    return ServiceResponse.success('Checkout session created', { url: session.url });
  }

  async createPortalSession(userId: string, organizationId: string) {
      const org = await prisma.organization.findUnique({
          where: { id: organizationId },
          include: { subscription: true }
      });

      if (!org || !org.subscription?.stripeCustomerId) {
          throw new AppError('No subscription found', 404);
      }

      const session = await stripeService.createPortalSession(
          org.subscription.stripeCustomerId,
          `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/${organizationId}/billing`
      );

      return ServiceResponse.success('Portal session created', { url: session.url });
  }

  async checkLimit(organizationId: string, feature: string): Promise<boolean> {
      // Logic to check usage vs plan limits
      // This would read from a Config/Plan definition
      return true;
  }
}
