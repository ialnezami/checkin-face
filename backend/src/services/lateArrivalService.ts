import { AttendanceModel } from '../models/Attendance';
import { EmployeeModel } from '../models/Employee';
import { WorkScheduleModel, SiteDefaultScheduleModel } from '../models/WorkSchedule';
import { logger } from '../utils/logger';

export interface LateArrivalRecord {
  employee_id: string;
  employee_name: string;
  check_in_time: Date;
  expected_time: Date;
  minutes_late: number;
  department?: string;
}

/**
 * Get expected start time for an employee on a specific date
 */
const getExpectedStartTime = async (
  employeeId: string,
  siteId: string,
  date: Date
): Promise<{ expectedTime: Date; gracePeriod: number } | null> => {
  try {
    // Try to get employee-specific schedule
    const employeeSchedule = await WorkScheduleModel.getScheduleForEmployee(employeeId, siteId, date);
    
    if (employeeSchedule) {
      const [hours, minutes] = employeeSchedule.start_time.split(':').map(Number);
      const expectedTime = new Date(date);
      expectedTime.setHours(hours, minutes, 0, 0);
      return {
        expectedTime,
        gracePeriod: employeeSchedule.grace_period_minutes,
      };
    }

    // Fall back to site default schedule
    const siteSchedule = await SiteDefaultScheduleModel.getSiteDefaultSchedule(siteId, date);
    
    if (siteSchedule) {
      const [hours, minutes] = siteSchedule.start_time.split(':').map(Number);
      const expectedTime = new Date(date);
      expectedTime.setHours(hours, minutes, 0, 0);
      return {
        expectedTime,
        gracePeriod: siteSchedule.grace_period_minutes,
      };
    }

    // Default fallback: 9:00 AM with 15 minutes grace
    const expectedTime = new Date(date);
    expectedTime.setHours(9, 0, 0, 0);
    return {
      expectedTime,
      gracePeriod: 15,
    };
  } catch (error) {
    logger.error('Error getting expected start time', { error, employeeId, siteId });
    // Fallback to default
    const expectedTime = new Date(date);
    expectedTime.setHours(9, 0, 0, 0);
    return {
      expectedTime,
      gracePeriod: 15,
    };
  }
};

/**
 * Detect late arrivals for a given date using work schedules
 */
export const detectLateArrivals = async (
  date: Date,
  siteId?: string,
  standardStartHour: number = 9,
  standardStartMinute: number = 0
): Promise<LateArrivalRecord[]> => {
  try {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const records = await AttendanceModel.findByDateRange(startDate, endDate);
    const employees = await EmployeeModel.findAll(1000, 0);

    const lateArrivals: LateArrivalRecord[] = [];

    for (const record of records) {
      const employee = employees.find(e => e.id === record.employee_id);
      if (!employee) continue;

      // Get employee's site (from record or employee)
      const employeeSiteId = (record as any).site_id || employee.site_id || siteId;
      if (!employeeSiteId) {
        // Fallback to default time if no site
        const expectedTime = new Date(date);
        expectedTime.setHours(standardStartHour, standardStartMinute, 0, 0);
        const checkInTime = new Date(record.check_in_time);
        if (checkInTime > expectedTime) {
          const minutesLate = Math.floor((checkInTime.getTime() - expectedTime.getTime()) / (1000 * 60));
          lateArrivals.push({
            employee_id: employee.employee_id,
            employee_name: `${employee.first_name} ${employee.last_name}`,
            check_in_time: checkInTime,
            expected_time: expectedTime,
            minutes_late: minutesLate,
            department: employee.department,
          });
        }
        continue;
      }

      // Get expected start time from schedule
      const scheduleInfo = await getExpectedStartTime(employee.id, employeeSiteId, date);
      if (!scheduleInfo) continue;

      const { expectedTime, gracePeriod } = scheduleInfo;
      const checkInTime = new Date(record.check_in_time);
      
      // Add grace period to expected time
      const latestAcceptableTime = new Date(expectedTime.getTime() + gracePeriod * 60 * 1000);
      
      if (checkInTime > latestAcceptableTime) {
        const minutesLate = Math.floor((checkInTime.getTime() - latestAcceptableTime.getTime()) / (1000 * 60));

        lateArrivals.push({
          employee_id: employee.employee_id,
          employee_name: `${employee.first_name} ${employee.last_name}`,
          check_in_time: checkInTime,
          expected_time: latestAcceptableTime,
          minutes_late: minutesLate,
          department: employee.department,
        });
      }
    }

    // Sort by minutes late (descending)
    lateArrivals.sort((a, b) => b.minutes_late - a.minutes_late);

    return lateArrivals;
  } catch (error) {
    logger.error('Error detecting late arrivals', { error });
    throw error;
  }
};

/**
 * Get late arrival statistics
 */
export const getLateArrivalStats = async (
  startDate: Date,
  endDate: Date,
  standardStartHour: number = 9
): Promise<{
  totalLateArrivals: number;
  averageMinutesLate: number;
  mostLateEmployee: { employee_id: string; name: string; count: number } | null;
}> => {
  try {
    const allLateArrivals: LateArrivalRecord[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const lateArrivals = await detectLateArrivals(new Date(currentDate), undefined, standardStartHour);
      allLateArrivals.push(...lateArrivals);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const totalLateArrivals = allLateArrivals.length;
    const averageMinutesLate = totalLateArrivals > 0
      ? allLateArrivals.reduce((sum, record) => sum + record.minutes_late, 0) / totalLateArrivals
      : 0;

    // Count late arrivals per employee
    const employeeCounts = new Map<string, { name: string; count: number }>();
    allLateArrivals.forEach(record => {
      const key = record.employee_id;
      if (!employeeCounts.has(key)) {
        employeeCounts.set(key, { name: record.employee_name, count: 0 });
      }
      employeeCounts.get(key)!.count++;
    });

    // Find most late employee
    let mostLateEmployee: { employee_id: string; name: string; count: number } | null = null;
    employeeCounts.forEach((value, key) => {
      if (!mostLateEmployee || value.count > mostLateEmployee.count) {
        mostLateEmployee = { employee_id: key, name: value.name, count: value.count };
      }
    });

    return {
      totalLateArrivals,
      averageMinutesLate: Math.round(averageMinutesLate),
      mostLateEmployee,
    };
  } catch (error) {
    logger.error('Error getting late arrival stats', { error });
    throw error;
  }
};

