import { prisma } from '@doxie/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AppError } from '../../common/errors';
import { ServiceResponse } from '../../common/response';

export class AuthService {
  async register(email: string, password: string, name?: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const token = this.signToken(user.id);
    return ServiceResponse.success('User registered', { user, token });
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      throw new AppError('Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = this.signToken(user.id);
    return ServiceResponse.success('Login successful', { user, token });
  }

  signToken(userId: string) {
    return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '7d' });
  }
}
