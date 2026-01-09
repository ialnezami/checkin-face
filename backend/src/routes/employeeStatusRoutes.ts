import express from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, authenticateEmployee } from '../middleware/auth';
import * as employeeStatusController from '../controllers/employeeStatusController';

const router = express.Router();

// Employee routes (authenticated as employee)
router.post(
  '/',
  authenticateEmployee,
  validate([
    body('status_text').notEmpty().withMessage('Status text is required'),
    body('duration_minutes').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
    body('status_type').optional().isString(),
  ]),
  employeeStatusController.createStatus
);

router.get(
  '/me',
  authenticateEmployee,
  employeeStatusController.getMyStatus
);

router.get(
  '/me/history',
  authenticateEmployee,
  employeeStatusController.getMyStatusHistory
);

router.put(
  '/:id',
  authenticateEmployee,
  validate([
    param('id').isUUID().withMessage('Invalid status ID'),
  ]),
  employeeStatusController.updateStatus
);

router.delete(
  '/:id',
  authenticateEmployee,
  validate([
    param('id').isUUID().withMessage('Invalid status ID'),
  ]),
  employeeStatusController.deleteStatus
);

// Admin routes (get all employee statuses)
router.get(
  '/all',
  authenticate,
  employeeStatusController.getAllEmployeeStatuses
);

export default router;

