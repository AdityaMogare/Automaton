import { Request, Response, NextFunction } from 'express';
import { User } from '../types';
export interface AuthenticatedRequest extends Request {
    user?: User;
}
export declare const authMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireRole: (roles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map