import { Request, Response, NextFunction } from 'express';
import { WorkScheduleModel, SiteDefaultScheduleModel, CreateWorkScheduleInput, CreateSiteDefaultScheduleInput } from '../models/WorkSchedule';
import { EmployeeModel } from '../models/Employee';
import { SiteModel } from '../models/Site';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { logAudit } from '../utils/auditLogger';

/**
 * Get work schedules for an employee
 */
export const getEmployeeSchedules = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = req.params;
    const siteId = req.query.site_id as string | undefined;

    // Verify employee exists
    const employee = await EmployeeModel.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    const schedules = await WorkScheduleModel.findByEmployeeId(employeeId, siteId);
    res.json({ schedules });
  } catch (error) {
    next(error);
  }
};

/**
 * Create work schedule for an employee
 */
export const createEmployeeSchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = req.params;
    const { site_id, shift_type, day_of_week, start_time, end_time, grace_period_minutes } = req.body;

    // Verify employee exists
    const employee = await EmployeeModel.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    // Verify site exists
    if (site_id) {
      const site = await SiteModel.findById(site_id);
      if (!site) {
        throw new AppError('Site not found', 404);
      }
    }

    const scheduleData: CreateWorkScheduleInput = {
      site_id: site_id || (employee as any).site_id || '',
      employee_id: employeeId,
      shift_type,
      day_of_week: day_of_week !== undefined ? day_of_week : null,
      start_time,
      end_time,
      grace_period_minutes,
    };

    const schedule = await WorkScheduleModel.create(scheduleData);
    logger.info('Work schedule created', { scheduleId: schedule.id, employeeId, siteId: scheduleData.site_id });
    await logAudit(req, 'schedule.created', 'work_schedule', schedule.id, { employeeId, siteId: scheduleData.site_id });

    res.status(201).json(schedule);
  } catch (error) {
    next(error);
  }
};

/**
 * Update work schedule
 */
export const updateEmployeeSchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const schedule = await WorkScheduleModel.update(id, updates);
    logger.info('Work schedule updated', { scheduleId: id });
    await logAudit(req, 'schedule.updated', 'work_schedule', id, updates);

    res.json(schedule);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete work schedule
 */
export const deleteEmployeeSchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await WorkScheduleModel.delete(id);
    logger.info('Work schedule deleted', { scheduleId: id });
    await logAudit(req, 'schedule.deleted', 'work_schedule', id);

    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get site default schedules
 */
export const getSiteDefaultSchedules = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { siteId } = req.params;

    const schedules = await SiteDefaultScheduleModel.findBySiteId(siteId);
    res.json({ schedules });
  } catch (error) {
    next(error);
  }
};

/**
 * Create site default schedule
 */
export const createSiteDefaultSchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { siteId } = req.params;
    const { shift_type, day_of_week, start_time, end_time, grace_period_minutes } = req.body;

    // Verify site exists
    const site = await SiteModel.findById(siteId);
    if (!site) {
      throw new AppError('Site not found', 404);
    }

    const scheduleData: CreateSiteDefaultScheduleInput = {
      site_id: siteId,
      shift_type,
      day_of_week: day_of_week !== undefined ? day_of_week : null,
      start_time,
      end_time,
      grace_period_minutes,
    };

    const schedule = await SiteDefaultScheduleModel.create(scheduleData);
    logger.info('Site default schedule created', { scheduleId: schedule.id, siteId });
    await logAudit(req, 'site_schedule.created', 'site_default_schedule', schedule.id, { siteId });

    res.status(201).json(schedule);
  } catch (error) {
    next(error);
  }
};

/**
 * Update site default schedule
 */
export const updateSiteDefaultSchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const schedule = await SiteDefaultScheduleModel.update(id, updates);
    logger.info('Site default schedule updated', { scheduleId: id });
    await logAudit(req, 'site_schedule.updated', 'site_default_schedule', id, updates);

    res.json(schedule);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete site default schedule
 */
export const deleteSiteDefaultSchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await SiteDefaultScheduleModel.delete(id);
    logger.info('Site default schedule deleted', { scheduleId: id });
    await logAudit(req, 'site_schedule.deleted', 'site_default_schedule', id);

    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    next(error);
  }
};

