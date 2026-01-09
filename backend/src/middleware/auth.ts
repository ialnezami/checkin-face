import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../config/jwt';
import { logger } from '../utils/logger';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      logger.warn('Invalid token', { error, ip: req.ip });
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token is invalid or expired',
      });
    }
  } catch (error) {
    logger.error('Authentication error', { error });
    return res.status(500).json({
      error: 'Authentication failed',
      message: 'An error occurred during authentication',
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.userId,
        role: req.user.role,
        requiredRoles: roles,
      });
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this resource',
      });
    }

    next();
  };
};

/**
 * Middleware to ensure manager can only access their own site's resources
 */
export const requireManagerSite = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
    });
  }

  // Admin can access all sites
  if (req.user.role === 'admin') {
    return next();
  }

  // Manager must have a site_id
  if (req.user.role === 'manager') {
    const { UserModel } = await import('../models/User');
    const user = await UserModel.findById(req.user.userId);
    
    if (!user || !user.site_id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Manager must be assigned to a site',
      });
    }

    // Store manager's site_id in request for use in controllers
    (req as any).managerSiteId = user.site_id;
    return next();
  }

  return res.status(403).json({
    error: 'Forbidden',
    message: 'This endpoint is only available to admins and managers',
  });
};

/**
 * Middleware to authenticate employees (can be employee or admin)
 */
export const authenticateEmployee = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided',
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      
      // Allow both employees and admins/managers
      // Employee tokens have userId pointing to employee_id
      // Admin tokens have userId pointing to user_id
      next();
    } catch (error) {
      logger.warn('Invalid token', { error, ip: req.ip });
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token is invalid or expired',
      });
    }
  } catch (error) {
    logger.error('Authentication error', { error });
    return res.status(500).json({
      error: 'Authentication failed',
      message: 'An error occurred during authentication',
    });
  }
};

