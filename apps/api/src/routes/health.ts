import { Router } from 'express';
import { prisma } from '@doxie/db';

const router = Router();

router.get('/', async (req, res) => {
  try {
    // Check DB connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', db: 'disconnected', error: String(error) });
  }
});

export default router;
