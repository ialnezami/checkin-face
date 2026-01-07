import express from 'express';
import { query as queryValidator } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import * as reportController from '../controllers/reportController';

const router = express.Router();

// All routes require authentication and admin/manager role
router.use(authenticate);
router.use(authorize('admin', 'manager'));

// Daily report
router.get(
  '/daily',
  validate([
    queryValidator('date').optional().isISO8601(),
  ]),
  reportController.getDailyReport
);

// Weekly report
router.get(
  '/weekly',
  validate([
    queryValidator('start_date').optional().isISO8601(),
  ]),
  reportController.getWeeklyReport
);

// Monthly report
router.get(
  '/monthly',
  validate([
    queryValidator('year').optional().isInt(),
    queryValidator('month').optional().isInt({ min: 1, max: 12 }),
  ]),
  reportController.getMonthlyReport
);

// Department report
router.get(
  '/department',
  validate([
    queryValidator('date').optional().isISO8601(),
  ]),
  reportController.getDepartmentReport
);

// Export CSV
router.get('/export/csv', reportController.exportCSV);

// Export JSON
router.get('/export/json', reportController.exportJSON);

export default router;

