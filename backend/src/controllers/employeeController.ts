import { Request, Response, NextFunction } from 'express';
import { EmployeeModel, CreateEmployeeInput, UpdateEmployeeInput } from '../models/Employee';
import { AuthMethodModel, CreateAuthMethodInput } from '../models/AuthMethod';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export const getAllEmployees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const search = req.query.search as string;

    let employees;
    if (search) {
      employees = await EmployeeModel.search(search, limit);
    } else {
      employees = await EmployeeModel.findAll(limit, offset);
    }

    res.json({
      employees,
      pagination: {
        limit,
        offset,
        total: employees.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const employee = await EmployeeModel.findById(id);

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    // Get auth methods for this employee
    const authMethods = await AuthMethodModel.findByEmployeeId(id);

    res.json({
      ...employee,
      authMethods: authMethods.map(method => ({
        id: method.id,
        method_type: method.method_type,
        is_primary: method.is_primary,
        is_active: method.is_active,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: CreateEmployeeInput = req.body;

    // Check if employee_id already exists
    const existing = await EmployeeModel.findByEmployeeId(data.employee_id);
    if (existing) {
      throw new AppError('Employee ID already exists', 400);
    }

    // Check if email already exists
    const existingEmail = await EmployeeModel.findByEmail(data.email);
    if (existingEmail) {
      throw new AppError('Email already exists', 400);
    }

    const employee = await EmployeeModel.create(data);
    logger.info('Employee created', { employeeId: employee.id, employee_id: employee.employee_id });

    res.status(201).json(employee);
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data: UpdateEmployeeInput = req.body;

    const employee = await EmployeeModel.update(id, data);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    logger.info('Employee updated', { employeeId: id });
    res.json(employee);
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deleted = await EmployeeModel.delete(id);

    if (!deleted) {
      throw new AppError('Employee not found', 404);
    }

    logger.info('Employee deleted', { employeeId: id });
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const enrollAuthMethod = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { method_type, method_data, is_primary } = req.body;

    // Verify employee exists
    const employee = await EmployeeModel.findById(id);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    let processedData = method_data;

    // Process face data: encode the face if it's a face enrollment
    if (method_type === 'face' && typeof method_data === 'string') {
      try {
        const { encodeFace } = await import('../services/faceRecognitionService');
        const faceEncoding = await encodeFace(method_data);
        processedData = faceEncoding; // Store the encoding array instead of raw image
        logger.info('Face encoded for enrollment', { employeeId: id });
      } catch (error: any) {
        logger.error('Face encoding failed', { error: error.message });
        throw new AppError('Failed to process face image: ' + error.message, 400);
      }
    }

    // Process RFID data: ensure it's in the correct format
    if (method_type === 'rfid') {
      processedData = { tagId: method_data };
    }

    // Process PIN data: hash it
    if (method_type === 'pin') {
      const { hashPassword } = await import('../utils/encryption');
      processedData = { pinHash: await hashPassword(method_data) };
    }

    const authMethodData: CreateAuthMethodInput = {
      employee_id: id,
      method_type,
      method_data: processedData,
      is_primary: is_primary || false,
    };

    const authMethod = await AuthMethodModel.create(authMethodData);
    logger.info('Auth method enrolled', {
      employeeId: id,
      methodType: method_type,
      authMethodId: authMethod.id,
    });

    res.status(201).json({
      id: authMethod.id,
      method_type: authMethod.method_type,
      is_primary: authMethod.is_primary,
      is_active: authMethod.is_active,
    });
  } catch (error) {
    next(error);
  }
};

