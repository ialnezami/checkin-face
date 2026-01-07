import { logger } from '../utils/logger';
import { config } from '../config/env';
import { AuthMethodModel } from '../models/AuthMethod';
import { EmployeeModel } from '../models/Employee';
import { decrypt } from '../utils/encryption';

/**
 * Compare two fingerprint templates
 * In production, this would use specialized fingerprint matching algorithms
 * For now, we use a simple similarity comparison
 */
const compareFingerprintTemplates = (template1: string, template2: string): number => {
  // Simple string similarity for demonstration
  // In production, use actual fingerprint matching algorithm (e.g., minutiae matching)
  if (template1 === template2) {
    return 1.0; // Exact match
  }
  
  // Calculate similarity based on common patterns
  const minLength = Math.min(template1.length, template2.length);
  let matches = 0;
  for (let i = 0; i < minLength; i++) {
    if (template1[i] === template2[i]) {
      matches++;
    }
  }
  
  return matches / Math.max(template1.length, template2.length);
};

/**
 * Fingerprint recognition service
 * Recognizes employee from fingerprint template data
 */
export const recognizeFingerprint = async (fingerprintData: string): Promise<string | null> => {
  try {
    if (!fingerprintData) {
      logger.warn('No fingerprint data provided');
      return null;
    }

    const SIMILARITY_THRESHOLD = 0.85; // Minimum similarity for match
    
    // Get all employees with fingerprint authentication
    const employees = await EmployeeModel.findAll(1000, 0);
    let bestMatch: { employeeId: string; similarity: number } | null = null;
    
    for (const employee of employees) {
      const fingerprintAuth = await AuthMethodModel.findByMethodType(employee.id, 'fingerprint');
      if (!fingerprintAuth) continue;

      try {
        // Get stored fingerprint template (decrypted)
        const storedData = await AuthMethodModel.getMethodData(fingerprintAuth);
        
        if (!storedData) {
          continue;
        }

        // Handle both string template and object with template field
        const storedTemplate = typeof storedData === 'string' 
          ? storedData 
          : storedData.template || storedData.fingerprint_data || JSON.stringify(storedData);

        // Compare templates
        const similarity = compareFingerprintTemplates(fingerprintData, storedTemplate);
        
        if (similarity >= SIMILARITY_THRESHOLD) {
          if (!bestMatch || similarity > bestMatch.similarity) {
            bestMatch = {
              employeeId: employee.id,
              similarity,
            };
          }
        }
      } catch (error) {
        logger.warn('Error checking fingerprint', { employeeId: employee.id, error });
        continue;
      }
    }

    if (bestMatch) {
      logger.info('Fingerprint recognized', {
        employeeId: bestMatch.employeeId,
        similarity: bestMatch.similarity,
      });
      return bestMatch.employeeId;
    }

    logger.warn('Fingerprint not recognized', { fingerprintDataLength: fingerprintData.length });
    return null;
  } catch (error) {
    logger.error('Fingerprint recognition error', { error });
    throw error;
  }
};

/**
 * Capture fingerprint from scanner
 * In production, this would connect to actual fingerprint scanner hardware
 * For now, it accepts fingerprint data from frontend
 */
export const captureFingerprint = async (fingerprintData?: string): Promise<string> => {
  try {
    // In production, this would:
    // 1. Initialize scanner connection (Serial/USB)
    // 2. Wait for finger placement
    // 3. Capture fingerprint template
    // 4. Return template data
    
    if (fingerprintData) {
      // If data is provided (from frontend simulation), use it
      return fingerprintData;
    }
    
    // TODO: Implement hardware scanner integration
    // Example for common scanners:
    // const SerialPort = require('serialport');
    // const port = new SerialPort(config.fingerprint.devicePath, { baudRate: config.fingerprint.baudrate });
    // // Send capture command and wait for response
    // return capturedTemplate;
    
    throw new Error('Fingerprint capture requires fingerprint data or hardware scanner');
  } catch (error) {
    logger.error('Fingerprint capture error', { error });
    throw error;
  }
};

