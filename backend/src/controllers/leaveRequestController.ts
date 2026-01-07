import { Request, Response, NextFunction } from 'express';
import { LeaveRequestModel, CreateLeaveRequestInput } from '../models/LeaveRequest';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { logAudit } from '../utils/auditLogger';

export const createLeaveRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.user?.userId;
    if (!employeeId) {
      throw new AppError('Not authenticated', 401);
    }

    const { leave_type, start_date, end_date, reason } = req.body;

    if (!leave_type || !start_date || !end_date) {
      throw new AppError('Leave type, start date, and end date are required', 400);
    }

    const start = new Date(start_date);
    const end = new Date(end_date);

    if (start > end) {
      throw new AppError('Start date must be before end date', 400);
    }

    if (start < new Date()) {
      throw new AppError('Cannot request leave for past dates', 400);
    }

    const data: CreateLeaveRequestInput = {
      employee_id: employeeId,
      leave_type,
      start_date: start,
      end_date: end,
      reason,
    };

    const leaveRequest = await LeaveRequestModel.create(data);
    logger.info('Leave request created', { leaveRequestId: leaveRequest.id, employeeId });
    await logAudit(req, 'leave_request.created', 'leave_request', leaveRequest.id, {
      leave_type,
      days: leaveRequest.days_requested,
    });

    res.status(201).json(leaveRequest);
  } catch (error) {
    next(error);
  }
};

export const getMyLeaveRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.user?.userId;
    if (!employeeId) {
      throw new AppError('Not authenticated', 401);
    }

    const requests = await LeaveRequestModel.findByEmployeeId(employeeId);
    res.json({ requests });
  } catch (error) {
    next(error);
  }
};

export const getLeaveRequestStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.user?.userId;
    if (!employeeId) {
      throw new AppError('Not authenticated', 401);
    }

    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
    const stats = await LeaveRequestModel.getEmployeeStats(employeeId, year);

    res.json({ ...stats, year });
  } catch (error) {
    next(error);
  }
};

export const getAllLeaveRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    const requests = await LeaveRequestModel.findByStatus(status as any || 'pending');
    res.json({ requests });
  } catch (error) {
    next(error);
  }
};

export const updateLeaveRequestStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;
    const approvedBy = req.user?.userId;

    if (!status || !['approved', 'rejected', 'cancelled'].includes(status)) {
      throw new AppError('Valid status is required', 400);
    }

    const leaveRequest = await LeaveRequestModel.updateStatus(
      id,
      status as any,
      approvedBy,
      rejection_reason
    );

    logger.info('Leave request status updated', { leaveRequestId: id, status, approvedBy });
    await logAudit(req, 'leave_request.updated', 'leave_request', id, { status });

    res.json(leaveRequest);
  } catch (error) {
    next(error);
  }
};

