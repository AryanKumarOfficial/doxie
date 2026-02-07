import { Router } from 'express';
import { createOrg, getMyOrgs, addMember } from '../modules/organizations/controller';
import { authenticateJWT } from '../modules/auth/middleware';

const router = Router();

router.use(authenticateJWT);

router.post('/', createOrg);
router.get('/', getMyOrgs);
router.post('/:organizationId/members', addMember);

export default router;
