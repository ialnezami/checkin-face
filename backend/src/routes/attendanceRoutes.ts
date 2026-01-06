import express from 'express';
import { body, query as queryValidator } from 'express-validator';
import { validate } from '../middleware/validation';
import * as attendanceController from '../controllers/attendanceController';

const router = express.Router();

// Check-in with face recognition
router.post(
  '/checkin/face',
  validate([
    body('image').notEmpty().withMessage('Image is required'),
  ]),
  attendanceController.checkInWithFace
);

// Check-in with fingerprint
router.post(
  '/checkin/fingerprint',
  validate([
    body('fingerprint_data').notEmpty().withMessage('Fingerprint data is required'),
  ]),
  attendanceController.checkInWithFingerprint
);

// Check-in with RFID
router.post(
  '/checkin/rfid',
  validate([
    body('tag_id').notEmpty().withMessage('Tag ID is required'),
  ]),
  attendanceController.checkInWithRFID
);

// Manual check-in (name search)
router.post(
  '/checkin/manual',
  validate([
    body('employee_id').notEmpty().withMessage('Employee ID is required'),
    body('pin').optional().isString(),
  ]),
  attendanceController.checkInManual
);

// Check-out
router.post(
  '/checkout/:employeeId',
  attendanceController.checkOut
);

// Get attendance records
router.get(
  '/',
  validate([
    queryValidator('employee_id').optional().isUUID(),
    queryValidator('start_date').optional().isISO8601(),
    queryValidator('end_date').optional().isISO8601(),
    queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
    queryValidator('offset').optional().isInt({ min: 0 }),
  ]),
  attendanceController.getAttendanceRecords
);

// Get dashboard data
router.get('/dashboard', attendanceController.getDashboardData);

export default router;

