import { EmployeeModel } from '../models/Employee';
import { AttendanceModel } from '../models/Attendance';
import { WorkScheduleModel, SiteDefaultScheduleModel } from '../models/WorkSchedule';
import { logger } from '../utils/logger';

export interface AbsenceAlert {
  id: string;
  employee_id: string;
  employee_name: string;
  site_id: string;
  site_name: string;
  expected_check_in_time: Date;
  minutes_overdue: number;
  department?: string;
  shift_type: string;
}

/**
 * Check for absences - employees who should have checked in but haven't
 * Alerts are generated 30 minutes after expected check-in time
 */
export const detectAbsences = async (siteId?: string): Promise<AbsenceAlert[]> => {
  try {
    const now = new Date();
    const alerts: AbsenceAlert[] = [];

    // Get all active employees
    const employees = await EmployeeModel.findAll(1000, 0, siteId);
    const activeEmployees = employees.filter(emp => emp.status === 'active');

    for (const employee of activeEmployees) {
      const employeeSiteId = (employee as any).site_id || siteId;
      if (!employeeSiteId) continue;

      // Get expected check-in time for today
      const scheduleInfo = await getExpectedStartTime(employee.id, employeeSiteId, now);
      if (!scheduleInfo) continue;

      const { expectedTime, shiftType } = scheduleInfo;
      
      // Check if employee already checked in today
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);

      const todayAttendance = await AttendanceModel.findByDateRange(todayStart, todayEnd);
      const hasCheckedIn = todayAttendance.some(
        record => record.employee_id === employee.id
      );

      if (hasCheckedIn) continue; // Employee already checked in

      // Calculate minutes overdue (30 minutes after expected time)
      const alertThreshold = new Date(expectedTime.getTime() + 30 * 60 * 1000); // 30 minutes after expected time
      
      if (now >= alertThreshold) {
        const minutesOverdue = Math.floor((now.getTime() - alertThreshold.getTime()) / (1000 * 60));
        
        // Get site name
        const { SiteModel } = await import('../models/Site');
        const site = await SiteModel.findById(employeeSiteId);

        alerts.push({
          id: `${employee.id}-${now.toISOString().split('T')[0]}`,
          employee_id: employee.employee_id,
          employee_name: `${employee.first_name} ${employee.last_name}`,
          site_id: employeeSiteId,
          site_name: site?.name || 'Unknown Site',
          expected_check_in_time: expectedTime,
          minutes_overdue: minutesOverdue,
          department: employee.department,
          shift_type: shiftType,
        });
      }
    }

    // Sort by minutes overdue (most overdue first)
    alerts.sort((a, b) => b.minutes_overdue - a.minutes_overdue);

    return alerts;
  } catch (error) {
    logger.error('Error detecting absences', { error });
    throw error;
  }
};

/**
 * Get expected start time and shift type for an employee
 */
const getExpectedStartTime = async (
  employeeId: string,
  siteId: string,
  date: Date
): Promise<{ expectedTime: Date; shiftType: string } | null> => {
  try {
    // Try to get employee-specific schedule
    const employeeSchedule = await WorkScheduleModel.getScheduleForEmployee(employeeId, siteId, date);
    
    if (employeeSchedule) {
      const [hours, minutes] = employeeSchedule.start_time.split(':').map(Number);
      const expectedTime = new Date(date);
      expectedTime.setHours(hours, minutes, 0, 0);
      return {
        expectedTime,
        shiftType: employeeSchedule.shift_type,
      };
    }

    // Fall back to site default schedule
    const siteSchedules = await SiteDefaultScheduleModel.findBySiteId(siteId);
    const matchingSchedule = siteSchedules.find(s => {
      if (s.day_of_week === null) return true;
      return s.day_of_week === date.getDay();
    });
    
    if (matchingSchedule) {
      const [hours, minutes] = matchingSchedule.start_time.split(':').map(Number);
      const expectedTime = new Date(date);
      expectedTime.setHours(hours, minutes, 0, 0);
      return {
        expectedTime,
        shiftType: matchingSchedule.shift_type,
      };
    }

    return null;
  } catch (error) {
    logger.error('Error getting expected start time', { error, employeeId, siteId });
    return null;
  }
};

/**
 * Get absence alerts for a specific site (for managers)
 */
export const getSiteAbsenceAlerts = async (siteId: string): Promise<AbsenceAlert[]> => {
  const allAlerts = await detectAbsences(siteId);
  return allAlerts.filter(alert => alert.site_id === siteId);
};

