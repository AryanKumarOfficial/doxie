import { Request, Response, NextFunction } from 'express';
import { getToken } from 'next-auth/jwt';

// Extend Express Request to include user session
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        name?: string;
        image?: string;
      };
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // If the request comes from another internal service (like a webhook or admin task),
    // we might want a different auth mechanism (like a secret key).
    // For now, we focus on user session.

    const token = await getToken({
      req: req as any,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || !token.id) {
       res.status(401).json({ error: 'Unauthorized' });
       return;
    }

    req.user = {
      id: token.id as string,
      email: token.email as string | undefined,
      name: token.name as string | undefined,
      image: token.picture as string | undefined,
    };

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};
