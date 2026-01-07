import express from 'express';
import { query as queryValidator } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import * as lateArrivalService from '../services/lateArrivalService';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get late arrivals for a specific date
router.get(
  '/',
  validate([
    queryValidator('date').optional().isISO8601(),
    queryValidator('start_hour').optional().isInt({ min: 0, max: 23 }),
  ]),
  async (req, res, next) => {
    try {
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      const startHour = req.query.start_hour ? parseInt(req.query.start_hour as string) : 9;
      
      const lateArrivals = await lateArrivalService.detectLateArrivals(date, startHour);
      res.json({ lateArrivals });
    } catch (error) {
      next(error);
    }
  }
);

// Get late arrival statistics
router.get(
  '/stats',
  validate([
    queryValidator('start_date').isISO8601(),
    queryValidator('end_date').isISO8601(),
    queryValidator('start_hour').optional().isInt({ min: 0, max: 23 }),
  ]),
  async (req, res, next) => {
    try {
      const startDate = new Date(req.query.start_date as string);
      const endDate = new Date(req.query.end_date as string);
      const startHour = req.query.start_hour ? parseInt(req.query.start_hour as string) : 9;
      
      const stats = await lateArrivalService.getLateArrivalStats(startDate, endDate, startHour);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
);

export default router;

