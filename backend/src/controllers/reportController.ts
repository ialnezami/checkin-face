import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import * as reportService from '../services/reportService';

export const getDailyReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date } = req.query;
    const reportDate = date ? new Date(date as string) : new Date();

    const report = await reportService.generateDailyReport(reportDate);
    res.json(report);
  } catch (error) {
    next(error);
  }
};

export const getWeeklyReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { start_date } = req.query;
    const startDate = start_date ? new Date(start_date as string) : new Date();

    const reports = await reportService.generateWeeklyReport(startDate);
    res.json({ reports });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { year, month } = req.query;
    const reportYear = year ? parseInt(year as string) : new Date().getFullYear();
    const reportMonth = month ? parseInt(month as string) : new Date().getMonth() + 1;

    const reports = await reportService.generateMonthlyReport(reportYear, reportMonth);
    res.json({ reports });
  } catch (error) {
    next(error);
  }
};

export const getDepartmentReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date } = req.query;
    const reportDate = date ? new Date(date as string) : new Date();

    const reports = await reportService.generateDepartmentReport(reportDate);
    res.json({ reports });
  } catch (error) {
    next(error);
  }
};

export const exportCSV = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { start_date, end_date, format: exportFormat } = req.query;

    if (!start_date || !end_date) {
      throw new AppError('Start date and end date are required', 400);
    }

    const startDate = new Date(start_date as string);
    const endDate = new Date(end_date as string);

    const { AttendanceModel } = await import('../models/Attendance');
    const { EmployeeModel } = await import('../models/Employee');

    const records = await AttendanceModel.findByDateRange(startDate, endDate);
    const employees = await EmployeeModel.findAll(1000, 0);

    // Create CSV content
      const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
      };

      const formatDateTime = (date: Date) => {
        return date.toISOString().replace('T', ' ').split('.')[0];
      };

      const headers = ['Date', 'Employee ID', 'Employee Name', 'Check-In Time', 'Check-Out Time', 'Method', 'Status'];
      const rows = records.map(record => {
        const employee = employees.find(e => e.id === record.employee_id);
        return [
          formatDate(new Date(record.check_in_time)),
          employee?.employee_id || record.employee_id,
          employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown',
          formatDateTime(new Date(record.check_in_time)),
          record.check_out_time ? formatDateTime(new Date(record.check_out_time)) : '',
          record.auth_method_used,
          record.status,
        ];
      });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance-${formatDate(startDate)}-to-${formatDate(endDate)}.csv`);
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};

export const exportJSON = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      throw new AppError('Start date and end date are required', 400);
    }

    const startDate = new Date(start_date as string);
    const endDate = new Date(end_date as string);

    // Helper function
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    const { AttendanceModel } = await import('../models/Attendance');
    const { EmployeeModel } = await import('../models/Employee');

    const records = await AttendanceModel.findByDateRange(startDate, endDate);
    const employees = await EmployeeModel.findAll(1000, 0);

    const enrichedRecords = records.map(record => {
      const employee = employees.find(e => e.id === record.employee_id);
      return {
        ...record,
        employee: employee ? {
          employee_id: employee.employee_id,
          name: `${employee.first_name} ${employee.last_name}`,
          department: employee.department,
        } : null,
      };
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=attendance-${formatDate(startDate)}-to-${formatDate(endDate)}.json`);
    res.json({ records: enrichedRecords });
  } catch (error) {
    next(error);
  }
};

