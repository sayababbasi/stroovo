import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export type AuthRequest = Request & {
  user?: {
    id: string;
    email: string;
    tenantId: string;
    role: string;
  };
};

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'revotic-ai-workflow-secret-2026') as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};
