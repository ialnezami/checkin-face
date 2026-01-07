import express from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import * as siteController from '../controllers/siteController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all sites
router.get('/', siteController.getSites);

// Get enabled methods for a site (public endpoint for check-in)
router.get('/:id/enabled-methods', siteController.getEnabledMethods);

// Get site details
router.get('/:id', siteController.getSite);

// Create site (admin/manager only)
router.post(
  '/',
  authorize('admin', 'manager'),
  validate([
    body('name').notEmpty().withMessage('Name is required'),
    body('code').notEmpty().withMessage('Code is required'),
  ]),
  siteController.createSite
);

// Update site (admin/manager only)
router.put(
  '/:id',
  authorize('admin', 'manager'),
  siteController.updateSite
);

// Delete site (admin only)
router.delete(
  '/:id',
  authorize('admin'),
  siteController.deleteSite
);

// Get site auth methods
router.get('/:id/auth-methods', siteController.getSiteAuthMethods);

// Update site auth method (admin/manager only)
router.put(
  '/:id/auth-methods',
  authorize('admin', 'manager'),
  validate([
    body('method_type').isIn(['face', 'fingerprint', 'rfid', 'name_search', 'pin']),
    body('is_enabled').isBoolean(),
  ]),
  siteController.updateSiteAuthMethod
);

export default router;

