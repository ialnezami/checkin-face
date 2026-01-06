import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import * as adminController from '../controllers/adminController';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// User management
router.get('/users', adminController.getAllUsers);
router.post(
  '/users',
  validate([
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['admin', 'manager', 'viewer']).withMessage('Invalid role'),
  ]),
  adminController.createUser
);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// System settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Audit logs
router.get('/audit-logs', adminController.getAuditLogs);

// Backup and restore
router.post('/backup', adminController.createBackup);
router.post('/restore', adminController.restoreBackup);

export default router;

