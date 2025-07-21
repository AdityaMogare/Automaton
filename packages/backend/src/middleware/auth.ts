import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.',
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Here you would typically fetch the user from the database
    // For now, we'll use the decoded token data
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      organizationId: decoded.organizationId,
      role: decoded.role,
      createdAt: new Date(decoded.createdAt),
      updatedAt: new Date(decoded.updatedAt),
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token.',
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Access denied. User not authenticated.',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions.',
      });
      return;
    }

    next();
  };
}; 