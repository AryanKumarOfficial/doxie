import { Request, Response, NextFunction } from 'express';
import { AppError } from './errors';
import { ServiceResponse } from './response';

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(ServiceResponse.failure(err.message, null, err.statusCode));
  }

  return res.status(500).json(ServiceResponse.failure('Internal Server Error', null, 500));
};
