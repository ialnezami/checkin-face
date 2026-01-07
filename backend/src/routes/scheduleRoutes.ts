import express from 'express';
import { body, param, query as queryValidator } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import * as scheduleController from '../controllers/scheduleController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Employee schedule routes
router.get(
  '/employee/:employeeId',
  authorize('admin', 'manager'),
  scheduleController.getEmployeeSchedules
);

router.post(
  '/employee/:employeeId',
  authorize('admin', 'manager'),
  validate([
    body('site_id').isUUID().withMessage('Valid site ID is required'),
    body('shift_type').isIn(['morning', 'afternoon', 'night', 'flexible', 'custom']).withMessage('Invalid shift type'),
    body('day_of_week').optional().isInt({ min: 0, max: 6 }),
    body('start_time').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).withMessage('Invalid time format (HH:MM:SS)'),
    body('end_time').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).withMessage('Invalid time format (HH:MM:SS)'),
    body('grace_period_minutes').optional().isInt({ min: 0, max: 60 }),
  ]),
  scheduleController.createEmployeeSchedule
);

router.put(
  '/employee/:id',
  authorize('admin', 'manager'),
  validate([
    body('start_time').optional().matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/),
    body('end_time').optional().matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/),
    body('grace_period_minutes').optional().isInt({ min: 0, max: 60 }),
  ]),
  scheduleController.updateEmployeeSchedule
);

router.delete(
  '/employee/:id',
  authorize('admin', 'manager'),
  scheduleController.deleteEmployeeSchedule
);

// Site default schedule routes
router.get(
  '/site/:siteId/defaults',
  authorize('admin', 'manager'),
  scheduleController.getSiteDefaultSchedules
);

router.post(
  '/site/:siteId/defaults',
  authorize('admin', 'manager'),
  validate([
    body('shift_type').isIn(['morning', 'afternoon', 'night', 'flexible', 'custom']).withMessage('Invalid shift type'),
    body('day_of_week').optional().isInt({ min: 0, max: 6 }),
    body('start_time').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).withMessage('Invalid time format (HH:MM:SS)'),
    body('end_time').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).withMessage('Invalid time format (HH:MM:SS)'),
    body('grace_period_minutes').optional().isInt({ min: 0, max: 60 }),
  ]),
  scheduleController.createSiteDefaultSchedule
);

router.put(
  '/site/defaults/:id',
  authorize('admin', 'manager'),
  validate([
    body('start_time').optional().matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/),
    body('end_time').optional().matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/),
    body('grace_period_minutes').optional().isInt({ min: 0, max: 60 }),
  ]),
  scheduleController.updateSiteDefaultSchedule
);

router.delete(
  '/site/defaults/:id',
  authorize('admin', 'manager'),
  scheduleController.deleteSiteDefaultSchedule
);

export default router;

