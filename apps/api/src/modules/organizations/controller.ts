import { Request, Response } from 'express';
import { OrganizationService } from './service';
import { asyncHandler } from '../../common/middleware';

const orgService = new OrganizationService();

export const createOrg = asyncHandler(async (req: Request, res: Response) => {
  const { name, slug } = req.body;
  const userId = (req as any).user.id;
  const result = await orgService.createOrganization(userId, name, slug);
  res.status(201).json(result);
});

export const getMyOrgs = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await orgService.getMyOrganizations(userId);
  res.status(200).json(result);
});

export const addMember = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.params;
  const { email, role } = req.body;
  const userId = (req as any).user.id;
  const result = await orgService.addMember(userId, organizationId, email, role);
  res.status(200).json(result);
});
