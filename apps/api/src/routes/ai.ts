import { Router } from 'express';
import { AIService } from '../modules/ai/service';

const router = Router();
const aiService = new AIService();

router.post('/generate', async (req, res) => {
    try {
        const { prompt, userId, organizationId } = req.body;
        const text = await aiService.generateText(prompt, userId, organizationId);
        res.json({ text });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
