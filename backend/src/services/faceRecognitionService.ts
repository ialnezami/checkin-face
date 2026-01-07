import * as faceapi from 'face-api.js';
import { Canvas, Image, ImageData } from 'canvas';
import { EmployeeModel } from '../models/Employee';
import { AuthMethodModel } from '../models/AuthMethod';
import { logger } from '../utils/logger';
import { config } from '../config/env';
import fs from 'fs';
import path from 'path';

// Extend face-api.js to work with Node.js canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let modelsLoaded = false;

/**
 * Load face-api.js models
 */
const loadModels = async (): Promise<void> => {
  if (modelsLoaded) return;

  try {
    const modelPath = path.join(process.cwd(), config.faceRecognition.modelPath);
    
    // Create models directory if it doesn't exist
    if (!fs.existsSync(modelPath)) {
      fs.mkdirSync(modelPath, { recursive: true });
      logger.warn('Face recognition models directory created. Please download models.');
      throw new Error('Face recognition models not found. Please download models to ' + modelPath);
    }

    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath),
      faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath),
      faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath),
    ]);

    modelsLoaded = true;
    logger.info('Face recognition models loaded successfully');
  } catch (error) {
    logger.error('Failed to load face recognition models', { error });
    throw error;
  }
};

/**
 * Convert base64 image to ImageData
 */
const base64ToImage = (base64String: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img as any);
    img.onerror = reject;
    
    // Remove data URL prefix if present
    const base64Data = base64String.includes(',') 
      ? base64String.split(',')[1] 
      : base64String;
    
    img.src = Buffer.from(base64Data, 'base64');
  });
};

/**
 * Encode face from image for storage
 */
export const encodeFace = async (imageData: string): Promise<number[]> => {
  try {
    await loadModels();

    const img = await base64ToImage(imageData);
    const detection = await faceapi
      .detectSingleFace(img as any)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      throw new Error('No face detected in image');
    }

    // Return face descriptor as array
    return Array.from(detection.descriptor);
  } catch (error) {
    logger.error('Face encoding error', { error });
    throw error;
  }
};

/**
 * Compare two face encodings and return similarity score
 */
export const compareFaces = (encoding1: number[], encoding2: number[]): number => {
  if (encoding1.length !== encoding2.length) {
    return 0;
  }

  // Calculate cosine similarity
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < encoding1.length; i++) {
    dotProduct += encoding1[i] * encoding2[i];
    norm1 += encoding1[i] * encoding1[i];
    norm2 += encoding2[i] * encoding2[i];
  }

  const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  return Math.max(0, Math.min(1, similarity)); // Clamp between 0 and 1
};

/**
 * Recognize face from image data
 */
export const recognizeFace = async (imageData: string): Promise<string | null> => {
  try {
    await loadModels();

    // Encode the input face
    const inputEncoding = await encodeFace(imageData);

    // Get all employees with face authentication
    const employees = await EmployeeModel.findAll(1000, 0); // Get all employees
    let bestMatch: { employeeId: string; similarity: number } | null = null;

    for (const employee of employees) {
      // Get face auth method for this employee
      const faceAuth = await AuthMethodModel.findByMethodType(employee.id, 'face');
      if (!faceAuth) continue;

      try {
        // Get stored face encoding
        const storedEncoding = await AuthMethodModel.getMethodData(faceAuth);
        
        if (!storedEncoding || !Array.isArray(storedEncoding)) {
          continue;
        }

        // Compare faces
        const similarity = compareFaces(inputEncoding, storedEncoding);

        // Check if similarity meets threshold
        if (similarity >= config.faceRecognition.threshold) {
          if (!bestMatch || similarity > bestMatch.similarity) {
            bestMatch = {
              employeeId: employee.id,
              similarity,
            };
          }
        }
      } catch (error) {
        logger.warn('Error comparing face for employee', { 
          employeeId: employee.id, 
          error 
        });
        continue;
      }
    }

    if (bestMatch) {
      logger.info('Face recognized', {
        employeeId: bestMatch.employeeId,
        similarity: bestMatch.similarity,
      });
      return bestMatch.employeeId;
    }

    logger.warn('Face not recognized - no match found above threshold');
    return null;
  } catch (error) {
    logger.error('Face recognition error', { error });
    throw error;
  }
};

/**
 * Detect if image contains a face
 */
export const detectFace = async (imageData: string): Promise<boolean> => {
  try {
    await loadModels();
    const img = await base64ToImage(imageData);
    const detection = await faceapi.detectSingleFace(img as any);
    return !!detection;
  } catch (error) {
    logger.error('Face detection error', { error });
    return false;
  }
};
