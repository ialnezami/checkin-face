import express from 'express';
import { body, query as queryValidator } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import * as managerController from '../controllers/managerController';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Get all managers
router.get(
  '/',
  validate([
    queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
    queryValidator('offset').optional().isInt({ min: 0 }),
    queryValidator('site_id').optional().isUUID(),
  ]),
  managerController.getAllManagers
);

// Get manager by ID
router.get('/:id', managerController.getManagerById);

// Create manager
router.post(
  '/',
  validate([
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('site_id').isUUID().withMessage('Valid site ID is required'),
  ]),
  managerController.createManager
);

// Update manager
router.put(
  '/:id',
  validate([
    body('username').optional().notEmpty(),
    body('email').optional().isEmail(),
    body('password').optional().isLength({ min: 6 }),
    body('site_id').optional().isUUID(),
  ]),
  managerController.updateManager
);

// Delete manager
router.delete('/:id', managerController.deleteManager);

export default router;

