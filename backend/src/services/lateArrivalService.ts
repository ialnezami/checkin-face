import { AttendanceModel } from '../models/Attendance';
import { EmployeeModel } from '../models/Employee';
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
 * Detect late arrivals for a given date
 */
export const detectLateArrivals = async (
  date: Date,
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

    const expectedTime = new Date(date);
    expectedTime.setHours(standardStartHour, standardStartMinute, 0, 0);

    const lateArrivals: LateArrivalRecord[] = [];

    records.forEach(record => {
      const checkInTime = new Date(record.check_in_time);
      if (checkInTime > expectedTime) {
        const employee = employees.find(e => e.id === record.employee_id);
        const minutesLate = Math.floor((checkInTime.getTime() - expectedTime.getTime()) / (1000 * 60));

        lateArrivals.push({
          employee_id: employee?.employee_id || record.employee_id,
          employee_name: employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown',
          check_in_time: checkInTime,
          expected_time: expectedTime,
          minutes_late: minutesLate,
          department: employee?.department,
        });
      }
    });

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
      const lateArrivals = await detectLateArrivals(new Date(currentDate), standardStartHour);
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

