import express from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import * as leaveRequestController from '../controllers/leaveRequestController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Employee routes
router.post(
  '/',
  validate([
    body('leave_type').isIn(['vacation', 'sick', 'personal', 'other']),
    body('start_date').isISO8601(),
    body('end_date').isISO8601(),
    body('reason').optional().isString(),
  ]),
  leaveRequestController.createLeaveRequest
);

router.get('/my-requests', leaveRequestController.getMyLeaveRequests);
router.get('/my-stats', leaveRequestController.getLeaveRequestStats);

// Admin/Manager routes
router.get(
  '/',
  authorize('admin', 'manager'),
  validate([
    query('status').optional().isIn(['pending', 'approved', 'rejected', 'cancelled']),
  ]),
  leaveRequestController.getAllLeaveRequests
);

router.put(
  '/:id/status',
  authorize('admin', 'manager'),
  validate([
    body('status').isIn(['approved', 'rejected', 'cancelled']),
    body('rejection_reason').optional().isString(),
  ]),
  leaveRequestController.updateLeaveRequestStatus
);

export default router;

