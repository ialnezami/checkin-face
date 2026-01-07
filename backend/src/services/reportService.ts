import { AttendanceModel } from '../models/Attendance';
import { EmployeeModel } from '../models/Employee';
import { logger } from '../utils/logger';

export interface AttendanceReport {
  date: string;
  totalEmployees: number;
  checkedIn: number;
  checkedOut: number;
  currentlyCheckedIn: number;
  lateArrivals: number;
  absences: number;
  records: any[];
}

export interface DepartmentReport {
  department: string;
  totalEmployees: number;
  checkedIn: number;
  attendanceRate: number;
}

/**
 * Generate daily attendance report
 */
export const generateDailyReport = async (date: Date): Promise<AttendanceReport> => {
  try {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const records = await AttendanceModel.findByDateRange(startDate, endDate);
    const allEmployees = await EmployeeModel.findAll(1000, 0);
    const activeEmployees = allEmployees.filter(emp => emp.status === 'active');

    const checkedIn = records.length;
    const checkedOut = records.filter(r => r.status === 'checked_out').length;
    const currentlyCheckedIn = records.filter(r => r.status === 'checked_in').length;

    // Calculate late arrivals (assuming 9 AM as standard start time)
    const standardStartHour = 9;
    const lateArrivals = records.filter(r => {
      const checkInHour = new Date(r.check_in_time).getHours();
      return checkInHour >= standardStartHour && checkInHour > standardStartHour;
    }).length;

    const absences = activeEmployees.length - checkedIn;

    return {
      date: date.toISOString().split('T')[0],
      totalEmployees: activeEmployees.length,
      checkedIn,
      checkedOut,
      currentlyCheckedIn,
      lateArrivals,
      absences,
      records,
    };
  } catch (error) {
    logger.error('Error generating daily report', { error });
    throw error;
  }
};

/**
 * Generate weekly attendance report
 */
export const generateWeeklyReport = async (startDate: Date): Promise<AttendanceReport[]> => {
  const reports: AttendanceReport[] = [];
  const currentDate = new Date(startDate);

  for (let i = 0; i < 7; i++) {
    const report = await generateDailyReport(currentDate);
    reports.push(report);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return reports;
};

/**
 * Generate monthly attendance report
 */
export const generateMonthlyReport = async (year: number, month: number): Promise<AttendanceReport[]> => {
  const reports: AttendanceReport[] = [];
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const report = await generateDailyReport(new Date(currentDate));
    reports.push(report);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return reports;
};

/**
 * Generate department-wise report
 */
export const generateDepartmentReport = async (date: Date): Promise<DepartmentReport[]> => {
  try {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const records = await AttendanceModel.findByDateRange(startDate, endDate);
    const employees = await EmployeeModel.findAll(1000, 0);

    // Group by department
    const departmentMap = new Map<string, { employees: string[]; checkedIn: Set<string> }>();

    employees.forEach(emp => {
      if (emp.status === 'active' && emp.department) {
        if (!departmentMap.has(emp.department)) {
          departmentMap.set(emp.department, { employees: [], checkedIn: new Set() });
        }
        departmentMap.get(emp.department)!.employees.push(emp.id);
      }
    });

    records.forEach(record => {
      const emp = employees.find(e => e.id === record.employee_id);
      if (emp && emp.department) {
        const dept = departmentMap.get(emp.department);
        if (dept) {
          dept.checkedIn.add(record.employee_id);
        }
      }
    });

    const reports: DepartmentReport[] = [];
    departmentMap.forEach((data, department) => {
      reports.push({
        department,
        totalEmployees: data.employees.length,
        checkedIn: data.checkedIn.size,
        attendanceRate: (data.checkedIn.size / data.employees.length) * 100,
      });
    });

    return reports;
  } catch (error) {
    logger.error('Error generating department report', { error });
    throw error;
  }
};

