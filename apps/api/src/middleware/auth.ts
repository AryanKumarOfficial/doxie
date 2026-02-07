import { Request, Response, NextFunction } from 'express';
import { getToken } from 'next-auth/jwt';

export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  try {
    const token = await getToken({
      req: req as any,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Attach user to req
    (req as any).user = token;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
