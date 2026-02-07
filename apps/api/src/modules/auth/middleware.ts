import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { prisma } from '@doxie/db';
import { AppError } from '../../common/errors';

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

      if (!user) {
        return next(new AppError('User not found', 401));
      }

      (req as any).user = user;
      next();
    } catch (err) {
      return next(new AppError('Invalid token', 403));
    }
  } else {
    return next(new AppError('Authorization header missing', 401));
  }
};
