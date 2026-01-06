import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import * as authController from '../controllers/authController';

const router = express.Router();

// Login
router.post(
  '/login',
  validate([
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  authController.login
);

// Refresh token
router.post('/refresh', authController.refreshToken);

// Logout (requires authentication)
router.post('/logout', authenticate, authController.logout);

// Get current user
router.get('/me', authenticate, authController.getCurrentUser);

export default router;

