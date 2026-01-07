import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import * as employeeAuthController from '../controllers/employeeAuthController';

const router = express.Router();

// Employee login (public)
router.post(
  '/login',
  validate([
    body('employee_id').optional().notEmpty(),
    body('pin').optional().notEmpty(),
    body('username').optional().notEmpty(),
    body('password').optional().notEmpty(),
  ]),
  employeeAuthController.login
);

// Get current employee (authenticated)
router.get('/me', authenticate, employeeAuthController.getCurrentEmployee);

export default router;

