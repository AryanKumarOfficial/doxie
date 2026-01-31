import { Router } from 'express';
import express from 'express';
import { StripeService } from '../modules/billing/stripe';
import { handleStripeWebhook } from '../modules/billing/webhook';

const router = Router();
const stripeService = new StripeService();

router.post('/checkout', async (req, res) => {
    try {
        const { priceId, customerId } = req.body;
        const subscription = await stripeService.createSubscription(customerId, priceId);
        res.json(subscription);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    if (typeof sig !== 'string') {
        res.status(400).send('Webhook Error: Missing signature');
        return;
    }

    try {
        await handleStripeWebhook(req.body, sig);
        res.json({ received: true });
    } catch (err: any) {
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

export default router;
