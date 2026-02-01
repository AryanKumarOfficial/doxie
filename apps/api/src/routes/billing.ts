import { Router } from 'express';
import express from 'express';
import { handleWebhook } from '../modules/billing/webhook';
import { BillingService } from '../modules/billing/service';
import { authenticateJWT } from '../modules/auth/middleware';
import { asyncHandler } from '../common/middleware';

const router = Router();
const billingService = new BillingService();

// Webhook must be raw for signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

router.post('/checkout', authenticateJWT, asyncHandler(async (req, res) => {
    const { organizationId, priceId } = req.body;
    const userId = (req as any).user.id;
    const result = await billingService.createCheckoutSession(userId, organizationId, priceId);
    res.json(result);
}));

router.post('/portal', authenticateJWT, asyncHandler(async (req, res) => {
    const { organizationId } = req.body;
    const userId = (req as any).user.id;
    const result = await billingService.createPortalSession(userId, organizationId);
    res.json(result);
}));

export default router;
