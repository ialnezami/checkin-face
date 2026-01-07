import { Request, Response, NextFunction } from 'express';
import { AttendanceModel, CreateAttendanceInput } from '../models/Attendance';
import { EmployeeModel } from '../models/Employee';
import { AuthMethodModel } from '../models/AuthMethod';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export const checkInWithFace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { image } = req.body;

    if (!image) {
      throw new AppError('Image is required', 400);
    }

    // Dynamically import face recognition service
    const faceRecognitionService = await import('../services/faceRecognitionService');
    
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
    // TODO: Implement fingerprint check-in
    throw new AppError('Fingerprint check-in not yet implemented', 501);
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
    const authMethod = await AuthMethodModel.findByMethodData('rfid', tag_id);
    if (!authMethod) {
      throw new AppError('RFID tag not recognized', 404);
    }

    const employee = await EmployeeModel.findById(authMethod.employee_id);
    if (!employee || employee.status !== 'active') {
      throw new AppError('Employee not found or inactive', 404);
    }

    // Check for active check-in
    const activeCheckIn = await AttendanceModel.findActiveCheckIn(employee.id);
    if (activeCheckIn) {
      throw new AppError('Employee already checked in', 400);
    }

    // Create attendance record
    const attendanceData: CreateAttendanceInput = {
      employee_id: employee.id,
      auth_method_used: 'rfid',
    };

    const attendance = await AttendanceModel.create(attendanceData);
    logger.info('Check-in with RFID', { employeeId: employee.id, tagId: tag_id });

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

export const checkInManual = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employee_id, pin } = req.body;

    if (!employee_id) {
      throw new AppError('Employee ID is required', 400);
    }

    const employee = await EmployeeModel.findByEmployeeId(employee_id);
    if (!employee || employee.status !== 'active') {
      throw new AppError('Employee not found or inactive', 404);
    }

    // Verify PIN if provided
    if (pin) {
      const authMethod = await AuthMethodModel.findByMethodType(employee.id, 'pin');
      if (authMethod) {
        const { decrypt } = await import('../utils/encryption');
        const storedPin = decrypt(authMethod.method_data);
        if (storedPin !== pin) {
          throw new AppError('Invalid PIN', 401);
        }
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
      auth_method_used: 'manual',
    };

    const attendance = await AttendanceModel.create(attendanceData);
    logger.info('Manual check-in', { employeeId: employee.id });

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

    const activeCheckIn = await AttendanceModel.findActiveCheckIn(employeeId);
    if (!activeCheckIn) {
      throw new AppError('No active check-in found', 404);
    }

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
    if (employee_id) {
      records = await AttendanceModel.findByEmployeeId(
        employee_id as string,
        parseInt(limit as string) || 50,
        parseInt(offset as string) || 0
      );
    } else {
      const startDate = start_date ? new Date(start_date as string) : undefined;
      const endDate = end_date ? new Date(end_date as string) : undefined;
      records = await AttendanceModel.findByDateRange(startDate, endDate);
    }

    res.json({ records });
  } catch (error) {
    next(error);
  }
};

export const getMyAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.user?.userId;
    if (!employeeId) {
      throw new AppError('Not authenticated', 401);
    }

    const { start_date, end_date, limit, offset } = req.query;
    
    let records;
    if (start_date && end_date) {
      const start = new Date(start_date as string);
      const end = new Date(end_date as string);
      records = await AttendanceModel.findByDateRange(start, end);
      // Filter by employee
      records = records.filter((r: any) => r.employee_id === employeeId);
    } else {
      records = await AttendanceModel.findByEmployeeId(
        employeeId,
        parseInt(limit as string) || 50,
        parseInt(offset as string) || 0
      );
    }

    res.json({ records });
  } catch (error) {
    next(error);
  }
};

export const getMyAttendanceStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.user?.userId;
    if (!employeeId) {
      throw new AppError('Not authenticated', 401);
    }

    const { year, month } = req.query;
    const targetYear = year ? parseInt(year as string) : new Date().getFullYear();
    const targetMonth = month ? parseInt(month as string) : new Date().getMonth() + 1;

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const records = await AttendanceModel.findByDateRange(startDate, endDate);
    const myRecords = records.filter((r: any) => r.employee_id === employeeId);

    // Calculate stats
    const totalDays = new Date(targetYear, targetMonth, 0).getDate();
    const workingDays = myRecords.filter((r: any) => {
      const date = new Date(r.check_in_time);
      return date.getDay() !== 0 && date.getDay() !== 6; // Exclude weekends
    }).length;

    const presentDays = myRecords.length;
    const absentDays = totalDays - presentDays;
    const checkInCount = myRecords.length;
    const checkOutCount = myRecords.filter((r: any) => r.status === 'checked_out').length;

    res.json({
      year: targetYear,
      month: targetMonth,
      totalDays,
      workingDays,
      presentDays,
      absentDays,
      checkInCount,
      checkOutCount,
      attendanceRate: totalDays > 0 ? (presentDays / totalDays) * 100 : 0,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await AttendanceModel.getTodayStats();
    
    // Get late arrivals for today
    const { detectLateArrivals } = await import('../services/lateArrivalService');
    const lateArrivals = await detectLateArrivals(new Date());
    
    res.json({
      ...stats,
      lateArrivals: lateArrivals.length,
      lateArrivalRecords: lateArrivals.slice(0, 10), // Top 10 late arrivals
    });
  } catch (error) {
    next(error);
  }
};
