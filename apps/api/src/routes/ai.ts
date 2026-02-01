import { Router } from 'express';
import { AIService } from '../modules/ai/service';
import { authenticateJWT } from '../modules/auth/middleware';
import { asyncHandler } from '../common/middleware';

const router = Router();
const aiService = new AIService();

router.use(authenticateJWT);

router.post('/generate', asyncHandler(async (req, res) => {
    const { prompt, organizationId, provider, model } = req.body;
    const userId = (req as any).user.id;
    const result = await aiService.generateText(prompt, userId, organizationId, provider, model);
    res.json(result);
}));

router.get('/job/:id', asyncHandler(async (req, res) => {
    const result = await aiService.getJobStatus(req.params.id);
    res.json(result);
}));

export default router;
