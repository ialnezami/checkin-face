import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { EmployeeStatusModel, CreateEmployeeStatusInput } from '../models/EmployeeStatus';
import { EmployeeModel } from '../models/Employee';

export const createStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.user?.userId || req.body.employee_id;
    
    if (!employeeId) {
      throw new AppError('Employee ID is required', 400);
    }

    const { status_text, status_type, duration_minutes } = req.body;

    if (!status_text || !duration_minutes) {
      throw new AppError('Status text and duration are required', 400);
    }

    // Verify employee exists
    const employee = await EmployeeModel.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    // Deactivate any existing active status
    const currentStatus = await EmployeeStatusModel.getCurrentStatus(employeeId);
    if (currentStatus) {
      await EmployeeStatusModel.update(currentStatus.id, { is_active: false });
    }

    const statusData: CreateEmployeeStatusInput = {
      employee_id: employeeId,
      status_text,
      status_type: status_type || 'activity',
      duration_minutes,
    };

    const status = await EmployeeStatusModel.create(statusData);
    logger.info('Employee status created', { employeeId, statusId: status.id });

    res.status(201).json({
      message: 'Status updated successfully',
      status,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.user?.userId;
    if (!employeeId) {
      throw new AppError('Not authenticated', 401);
    }

    const currentStatus = await EmployeeStatusModel.getCurrentStatus(employeeId);
    res.json({ status: currentStatus });
  } catch (error) {
    next(error);
  }
};

export const getMyStatusHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.user?.userId;
    if (!employeeId) {
      throw new AppError('Not authenticated', 401);
    }

    const history = await EmployeeStatusModel.findByEmployeeId(employeeId);
    res.json({ history });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const employeeId = req.user?.userId;
    
    if (!employeeId) {
      throw new AppError('Not authenticated', 401);
    }

    const status = await EmployeeStatusModel.findById(id);
    if (!status) {
      throw new AppError('Status not found', 404);
    }

    if (status.employee_id !== employeeId) {
      throw new AppError('Unauthorized', 403);
    }

    const updates = req.body;
    const updatedStatus = await EmployeeStatusModel.update(id, updates);
    
    logger.info('Employee status updated', { employeeId, statusId: id });
    res.json({ status: updatedStatus });
  } catch (error) {
    next(error);
  }
};

export const deleteStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const employeeId = req.user?.userId;
    
    if (!employeeId) {
      throw new AppError('Not authenticated', 401);
    }

    const status = await EmployeeStatusModel.findById(id);
    if (!status) {
      throw new AppError('Status not found', 404);
    }

    if (status.employee_id !== employeeId) {
      throw new AppError('Unauthorized', 403);
    }

    await EmployeeStatusModel.delete(id);
    logger.info('Employee status deleted', { employeeId, statusId: id });
    res.json({ message: 'Status deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllEmployeeStatuses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Admin only - get all active statuses
    const { EmployeeModel } = await import('../models/Employee');
    const employees = await EmployeeModel.findAll(1000, 0);
    
    const statuses = await Promise.all(
      employees.map(async (emp) => {
        const status = await EmployeeStatusModel.getCurrentStatus(emp.id);
        return {
          employee: {
            id: emp.id,
            employee_id: emp.employee_id,
            name: `${emp.first_name} ${emp.last_name}`,
          },
          status,
        };
      })
    );

    res.json({ statuses: statuses.filter(s => s.status !== null) });
  } catch (error) {
    next(error);
  }
};

