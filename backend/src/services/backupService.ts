import { query } from '../config/database';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';
import { EmployeeModel } from '../models/Employee';
import { AttendanceModel } from '../models/Attendance';
import { AuthMethodModel } from '../models/AuthMethod';
import { UserModel } from '../models/User';

export interface BackupData {
  timestamp: string;
  employees: any[];
  attendance_records: any[];
  auth_methods: any[];
  users: any[];
  metadata: {
    version: string;
    total_employees: number;
    total_records: number;
  };
}

/**
 * Create a backup of all system data
 */
export const createBackup = async (): Promise<string> => {
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup-${timestamp}.json`;
    const backupPath = path.join(backupDir, backupFileName);

    // Fetch all data
    const employees = await EmployeeModel.findAll(10000, 0);
    const users = await UserModel.findAll(1000, 0);
    
    // Get attendance records for the last 90 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);
    const attendanceRecords = await AttendanceModel.findByDateRange(startDate, endDate);

    // Get all auth methods
    const authMethods: any[] = [];
    for (const employee of employees) {
      const methods = await AuthMethodModel.findByEmployeeId(employee.id);
      authMethods.push(...methods);
    }

    // Create backup data structure
    const backupData: BackupData = {
      timestamp: new Date().toISOString(),
      employees: employees.map(emp => ({
        ...emp,
        password_hash: undefined, // Don't backup password hashes
      })),
      attendance_records: attendanceRecords,
      auth_methods: authMethods.map(method => ({
        id: method.id,
        employee_id: method.employee_id,
        method_type: method.method_type,
        is_primary: method.is_primary,
        is_active: method.is_active,
        created_at: method.created_at,
        // Don't backup actual biometric data for security
      })),
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        // Don't backup password hashes
      })),
      metadata: {
        version: '1.0.0',
        total_employees: employees.length,
        total_records: attendanceRecords.length,
      },
    };

    // Write backup file
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    
    logger.info('Backup created', { backupPath, timestamp });
    return backupPath;
  } catch (error) {
    logger.error('Error creating backup', { error });
    throw error;
  }
};

/**
 * List all available backups
 */
export const listBackups = (): string[] => {
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      return [];
    }

    const files = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
      .sort()
      .reverse();

    return files.map(file => path.join(backupDir, file));
  } catch (error) {
    logger.error('Error listing backups', { error });
    return [];
  }
};

/**
 * Restore from backup file
 */
export const restoreBackup = async (backupPath: string): Promise<void> => {
  try {
    if (!fs.existsSync(backupPath)) {
      throw new Error('Backup file not found');
    }

    const backupData: BackupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

    // WARNING: This is a destructive operation
    // In production, you should:
    // 1. Create a backup before restoring
    // 2. Validate backup data
    // 3. Use transactions
    // 4. Have admin confirmation

    logger.warn('Restoring from backup', { backupPath, timestamp: backupData.timestamp });

    // Note: Full restore implementation would require:
    // - Truncating tables
    // - Re-inserting data
    // - Handling foreign key constraints
    // This is a placeholder for safety

    throw new Error('Restore functionality requires careful implementation and admin confirmation');
  } catch (error) {
    logger.error('Error restoring backup', { error });
    throw error;
  }
};

