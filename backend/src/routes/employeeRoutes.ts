import express from 'express';
import { body, query as queryValidator } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import * as employeeController from '../controllers/employeeController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all employees
router.get(
  '/',
  validate([
    queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
    queryValidator('offset').optional().isInt({ min: 0 }),
    queryValidator('search').optional().isString(),
  ]),
  employeeController.getAllEmployees
);

// Get employee by ID
router.get('/:id', employeeController.getEmployeeById);

// Create employee (admin/manager only)
router.post(
  '/',
  authorize('admin', 'manager'),
  validate([
    body('employee_id').notEmpty().withMessage('Employee ID is required'),
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
  ]),
  employeeController.createEmployee
);

// Update employee (admin/manager only)
router.put(
  '/:id',
  authorize('admin', 'manager'),
  employeeController.updateEmployee
);

// Delete employee (admin only)
router.delete('/:id', authorize('admin'), employeeController.deleteEmployee);

// Enroll authentication method
router.post(
  '/:id/enroll',
  authorize('admin', 'manager'),
  validate([
    body('method_type').isIn(['face', 'fingerprint', 'rfid', 'pin']).withMessage('Invalid method type'),
    body('method_data').notEmpty().withMessage('Method data is required'),
  ]),
  employeeController.enrollAuthMethod
);

// Get all face images for an employee
router.get(
  '/:id/face-images',
  authorize('admin', 'manager'),
  employeeController.getFaceImages
);

// Remove a specific face image by index
router.delete(
  '/:id/face-images/:index',
  authorize('admin', 'manager'),
  employeeController.removeFaceImage
);

export default router;

