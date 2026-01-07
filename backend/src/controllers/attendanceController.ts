import { Request, Response, NextFunction } from 'express';
import { AttendanceModel, CreateAttendanceInput } from '../models/Attendance';
import { EmployeeModel } from '../models/Employee';
import { AuthMethodModel } from '../models/AuthMethod';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import * as faceRecognitionService from '../services/faceRecognitionService';

export const checkInWithFace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { image } = req.body;

    if (!image) {
      throw new AppError('Image is required', 400);
    }

    // Recognize face
    const employeeId = await faceRecognitionService.recognizeFace(image);
    if (!employeeId) {
      throw new AppError('Face not recognized', 404);
    }

    // Check if employee exists and is active
    const employee = await EmployeeModel.findById(employeeId);
    if (!employee || employee.status !== 'active') {
      throw new AppError('Employee not found or inactive', 404);
    }

    // Check for active check-in
    const activeCheckIn = await AttendanceModel.findActiveCheckIn(employeeId);
    if (activeCheckIn) {
      throw new AppError('Employee already checked in', 400);
    }

    // Create attendance record
    const attendanceData: CreateAttendanceInput = {
      employee_id: employeeId,
      auth_method_used: 'face',
    };

    const attendance = await AttendanceModel.create(attendanceData);
    logger.info('Check-in with face', { employeeId, attendanceId: attendance.id });

    res.status(201).json({
      message: 'Checked in successfully',
      attendance,
      employee: {
        id: employee.id,
        employee_id: employee.employee_id,
        name: `${employee.first_name} ${employee.last_name}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const checkInWithFingerprint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fingerprint_data } = req.body;

    if (!fingerprint_data) {
      throw new AppError('Fingerprint data is required', 400);
    }

    // Fingerprint recognition logic would go here
    throw new AppError('Fingerprint recognition not implemented', 501);
  } catch (error) {
    next(error);
  }
};

export const checkInWithRFID = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tag_id } = req.body;

    if (!tag_id) {
      throw new AppError('Tag ID is required', 400);
    }

    // Find employee by RFID tag
    // TODO: Implement RFID tag matching logic
    // This would require querying auth_methods where method_type = 'rfid' 
    // and method_data contains the matching tag_id
    throw new AppError('RFID recognition not fully implemented', 501);
  } catch (error) {
    next(error);
  }
};

export const checkInManual = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employee_id, pin } = req.body;

    if (!employee_id) {
      throw new AppError('Employee ID is required', 400);
    }

    // Find employee
    const employee = await EmployeeModel.findByEmployeeId(employee_id);
    if (!employee || employee.status !== 'active') {
      throw new AppError('Employee not found or inactive', 404);
    }

    // If PIN provided, verify it
    if (pin) {
      const pinMethod = await AuthMethodModel.findByMethodType(employee.id, 'pin');
      if (pinMethod) {
        const methodData = await AuthMethodModel.getMethodData(pinMethod);
        // PIN verification logic would go here
      }
    }

    // Check for active check-in
    const activeCheckIn = await AttendanceModel.findActiveCheckIn(employee.id);
    if (activeCheckIn) {
      throw new AppError('Employee already checked in', 400);
    }

    // Create attendance record
    const attendanceData: CreateAttendanceInput = {
      employee_id: employee.id,
      auth_method_used: 'pin',
    };

    const attendance = await AttendanceModel.create(attendanceData);
    logger.info('Manual check-in', { employeeId: employee.id, attendanceId: attendance.id });

    res.status(201).json({
      message: 'Checked in successfully',
      attendance,
      employee: {
        id: employee.id,
        employee_id: employee.employee_id,
        name: `${employee.first_name} ${employee.last_name}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const checkOut = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = req.params;

    // Find active check-in
    const activeCheckIn = await AttendanceModel.findActiveCheckIn(employeeId);
    if (!activeCheckIn) {
      throw new AppError('No active check-in found', 404);
    }

    // Check out
    const attendance = await AttendanceModel.checkOut(activeCheckIn.id);
    logger.info('Check-out', { employeeId, attendanceId: attendance.id });

    res.json({
      message: 'Checked out successfully',
      attendance,
    });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceRecords = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employee_id, start_date, end_date, limit, offset } = req.query;

    let records;
    if (start_date && end_date) {
      records = await AttendanceModel.findByDateRange(
        new Date(start_date as string),
        new Date(end_date as string),
        employee_id as string
      );
    } else if (employee_id) {
      records = await AttendanceModel.findByEmployeeId(
        employee_id as string,
        parseInt(limit as string) || 50,
        parseInt(offset as string) || 0
      );
    } else {
      throw new AppError('employee_id or date range is required', 400);
    }

    res.json({ records });
  } catch (error) {
    next(error);
  }
};

export const getDashboardData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await AttendanceModel.getTodayStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

