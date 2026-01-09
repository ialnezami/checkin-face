import express from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, authenticateEmployee } from '../middleware/auth';
import * as employeeLocationController from '../controllers/employeeLocationController';

const router = express.Router();

// Employee routes
router.post(
  '/',
  authenticateEmployee,
  validate([
    body('site_id').isUUID().withMessage('Valid site ID is required'),
    body('section_id').optional().isUUID().withMessage('Valid section ID is required'),
    body('location_type').optional().isString(),
    body('notes').optional().isString(),
  ]),
  employeeLocationController.updateLocation
);

router.get(
  '/me',
  authenticateEmployee,
  employeeLocationController.getMyLocation
);

router.get(
  '/me/history',
  authenticateEmployee,
  validate([
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
  ]),
  employeeLocationController.getMyLocationHistory
);

router.post(
  '/exit/:id',
  authenticateEmployee,
  validate([
    param('id').isUUID().withMessage('Valid location ID is required'),
  ]),
  employeeLocationController.exitLocation
);

// Admin routes
router.get(
  '/section/:sectionId',
  authenticate,
  validate([
    param('sectionId').isUUID().withMessage('Valid section ID is required'),
  ]),
  employeeLocationController.getEmployeesInSection
);

router.get(
  '/site/:siteId',
  authenticate,
  validate([
    param('siteId').isUUID().withMessage('Valid site ID is required'),
  ]),
  employeeLocationController.getEmployeesInSite
);

export default router;

