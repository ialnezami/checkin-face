import { Request, Response, NextFunction } from 'express';
import { EmployeeModel } from '../models/Employee';
import { EmployeeCredentialModel } from '../models/EmployeeCredential';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { generateToken } from '../config/jwt';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employee_id, pin, username, password } = req.body;

    let employee;
    let credential;

    // Login by employee_id + PIN (quick login)
    if (employee_id && pin) {
      employee = await EmployeeModel.findByEmployeeId(employee_id);
      if (!employee) {
        throw new AppError('Employee not found', 404);
      }

      credential = await EmployeeCredentialModel.findByEmployeeId(employee.id);
      if (!credential || !credential.pin_code) {
        throw new AppError('PIN not set for this employee', 400);
      }

      const isValidPin = await EmployeeCredentialModel.verifyPin(credential, pin);
      if (!isValidPin) {
        throw new AppError('Invalid PIN', 401);
      }
    }
    // Login by username + password
    else if (username && password) {
      credential = await EmployeeCredentialModel.findByUsername(username);
      if (!credential) {
        throw new AppError('Invalid credentials', 401);
      }

      employee = await EmployeeModel.findById(credential.employee_id);
      if (!employee) {
        throw new AppError('Employee not found', 404);
      }

      const isValidPassword = await EmployeeCredentialModel.verifyPassword(credential, password);
      if (!isValidPassword) {
        throw new AppError('Invalid credentials', 401);
      }
    } else {
      throw new AppError('Employee ID + PIN or Username + Password required', 400);
    }

    if (!employee || employee.status !== 'active') {
      throw new AppError('Employee account is inactive', 403);
    }

    if (credential && !credential.is_active) {
      throw new AppError('Employee account is disabled', 403);
    }

    // Update last login
    if (credential) {
      await EmployeeCredentialModel.updateLastLogin(employee.id);
    }

    // Generate token
    const token = generateToken({
      userId: employee.id,
      username: employee.employee_id,
      role: 'employee',
    });

    logger.info('Employee logged in', { employeeId: employee.id, employee_id: employee.employee_id });

    res.json({
      token,
      employee: {
        id: employee.id,
        employee_id: employee.employee_id,
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        department: employee.department,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.user?.userId;
    if (!employeeId) {
      throw new AppError('Not authenticated', 401);
    }

    const employee = await EmployeeModel.findById(employeeId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    res.json({
      id: employee.id,
      employee_id: employee.employee_id,
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      department: employee.department,
      position: employee.position,
    });
  } catch (error) {
    next(error);
  }
};

