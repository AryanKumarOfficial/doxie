import { Router } from 'express';
import { AIService } from '../modules/ai/service';
import { isAuthenticated } from '../middleware/auth';

const router = Router();
const aiService = new AIService();

router.post('/generate', isAuthenticated, async (req, res) => {
    try {
        const { prompt, organizationId } = req.body;
        // User ID from token
        const userId = (req as any).user.sub || (req as any).user.id;

        const text = await aiService.generateText(prompt, userId, organizationId);
        res.json({ text });
    } catch (e: any) {
        console.error("AI Error:", e);
        res.status(500).json({ error: e.message });
    }
});

export default router;
