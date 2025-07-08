import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  role: string;
}

export function verifyJwt(requiredRole?: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const token = header.split(' ')[1];
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as AuthUser;
      (req as any).authUser = payload;
      if (requiredRole && payload.role !== requiredRole) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }
      next();
    } catch {
      res.status(401).json({ message: 'Invalid token' });
    }
  };
}
