import { Router } from 'express';
import { register, login, me } from '../modules/auth/controller';
import { authenticateJWT } from '../modules/auth/middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateJWT, me);

export default router;
