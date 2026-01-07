import { AuditLogModel, CreateAuditLogInput } from '../models/AuditLog';
import { Request } from 'express';

/**
 * Log an audit event
 */
export const logAudit = async (
  req: Request | null,
  action: string,
  resourceType?: string,
  resourceId?: string,
  details?: any
): Promise<void> => {
  try {
    const auditData: CreateAuditLogInput = {
      user_id: req?.user?.userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
      ip_address: req?.ip,
      user_agent: req?.get('user-agent'),
    };

    await AuditLogModel.create(auditData);
  } catch (error) {
    // Don't throw error - audit logging should not break the main flow
    console.error('Failed to log audit event', error);
  }
};

/**
 * Middleware to automatically log requests
 */
export const auditMiddleware = (action: string) => {
  return async (req: Request, res: Response, next: any) => {
    // Log after response is sent
    const originalSend = res.send;
    res.send = function (body: any) {
      logAudit(req, action, undefined, undefined, {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
      });
      return originalSend.call(this, body);
    };
    next();
  };
};

