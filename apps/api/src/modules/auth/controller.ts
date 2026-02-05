import { Request, Response } from 'express';
import { AuthService } from './service';
import { asyncHandler } from '../../common/middleware';

const authService = new AuthService();

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const result = await authService.register(email, password, name);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.status(200).json(result);
});

export const me = asyncHandler(async (req: Request, res: Response) => {
    // req.user is populated by middleware
    res.json({ success: true, data: (req as any).user });
});
