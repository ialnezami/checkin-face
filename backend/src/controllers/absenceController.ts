import { Request, Response, NextFunction } from 'express';
import { detectAbsences, getSiteAbsenceAlerts } from '../services/absenceService';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { UserModel } from '../models/User';

/**
 * Get absence alerts for all sites (admin) or specific site (manager)
 */
export const getAbsenceAlerts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    let alerts;
    
    if (user.role === 'admin') {
      // Admin sees all alerts
      alerts = await detectAbsences();
    } else if (user.role === 'manager' && user.site_id) {
      // Manager sees only their site's alerts
      alerts = await getSiteAbsenceAlerts(user.site_id);
    } else {
      throw new AppError('Unauthorized', 403);
    }

    res.json({ alerts, count: alerts.length });
  } catch (error) {
    next(error);
  }
};

/**
 * Get absence alerts count (for dashboard badge)
 */
export const getAbsenceAlertsCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    let alerts;
    
    if (user.role === 'admin') {
      alerts = await detectAbsences();
    } else if (user.role === 'manager' && user.site_id) {
      alerts = await getSiteAbsenceAlerts(user.site_id);
    } else {
      return res.json({ count: 0 });
    }

    res.json({ count: alerts.length });
  } catch (error) {
    next(error);
  }
};

