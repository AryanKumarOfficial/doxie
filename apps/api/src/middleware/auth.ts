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

export async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = await getToken({
      req: req as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Attach normalized user object
    req.user = {
      id: token.id as string,
      email: token.email as string | undefined,
      name: token.name as string | undefined,
      image: token.picture as string | undefined,
    };

    return next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
