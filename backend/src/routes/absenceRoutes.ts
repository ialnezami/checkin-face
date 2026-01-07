import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as absenceController from '../controllers/absenceController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get absence alerts (admin sees all, manager sees their site)
router.get('/alerts', absenceController.getAbsenceAlerts);

// Get absence alerts count (for dashboard badge)
router.get('/alerts/count', absenceController.getAbsenceAlertsCount);

export default router;

