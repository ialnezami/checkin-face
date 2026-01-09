import express from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import * as siteSectionController from '../controllers/siteSectionController';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);

router.post(
  '/',
  validate([
    body('site_id').isUUID().withMessage('Valid site ID is required'),
    body('name').notEmpty().withMessage('Section name is required'),
    body('code').notEmpty().withMessage('Section code is required'),
    body('description').optional().isString(),
    body('section_type').optional().isString(),
    body('coordinates').optional(),
    body('capacity').optional().isInt({ min: 1 }),
  ]),
  siteSectionController.createSection
);

router.get(
  '/site/:siteId',
  validate([
    param('siteId').isUUID().withMessage('Valid site ID is required'),
  ]),
  siteSectionController.getSectionsBySite
);

router.get(
  '/:id',
  validate([
    param('id').isUUID().withMessage('Valid section ID is required'),
  ]),
  siteSectionController.getSectionById
);

router.put(
  '/:id',
  validate([
    param('id').isUUID().withMessage('Valid section ID is required'),
  ]),
  siteSectionController.updateSection
);

router.delete(
  '/:id',
  validate([
    param('id').isUUID().withMessage('Valid section ID is required'),
  ]),
  siteSectionController.deleteSection
);

export default router;

