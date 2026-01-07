import { EmployeeModel } from '../models/Employee';
import { AuthMethodModel } from '../models/AuthMethod';
import { logger } from '../utils/logger';
import { config } from '../config/env';
import fs from 'fs';
import path from 'path';

// Lazy load face-api.js and canvas to handle missing dependencies gracefully
let faceapi: any = null;
let Canvas: any = null;
let Image: any = null;
let ImageData: any = null;
let createCanvas: any = null;
let loadImage: any = null;

const loadDependencies = async () => {
  if (faceapi) return; // Already loaded
  
  try {
    faceapi = await import('face-api.js');
    const canvasModule = await import('canvas');
    Canvas = canvasModule.Canvas;
    Image = canvasModule.Image;
    ImageData = canvasModule.ImageData;
    createCanvas = canvasModule.createCanvas;
    loadImage = canvasModule.loadImage;
    
    // Extend face-api.js to work with Node.js canvas
    faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
  } catch (error) {
    logger.error('Failed to load face recognition dependencies', { error });
    throw new Error('Face recognition dependencies not available. Please install canvas and face-api.js packages.');
  }
};

let modelsLoaded = false;

/**
 * Load face-api.js models
 */
const loadModels = async (): Promise<void> => {
  if (modelsLoaded) return;

  try {
    // Load dependencies first
    await loadDependencies();
    
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
 * Convert base64 image to canvas
 */
const base64ToCanvas = async (base64String: string): Promise<HTMLCanvasElement> => {
  // Remove data URL prefix if present
  const base64Data = base64String.includes(',') 
    ? base64String.split(',')[1] 
    : base64String;
  
  const buffer = Buffer.from(base64Data, 'base64');
  const img = await loadImage(buffer);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return canvas as any;
};

/**
 * Encode face from image for storage
 */
export const encodeFace = async (imageData: string): Promise<number[]> => {
  try {
    await loadModels();

    const canvas = await base64ToCanvas(imageData);
    const detection = await faceapi
      .detectSingleFace(canvas)
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
        // Get stored face encodings (can be single encoding or array of encodings)
        const storedData = await AuthMethodModel.getMethodData(faceAuth);
        
        if (!storedData) {
          continue;
        }

        // Handle both single encoding (legacy) and multiple encodings (new format)
        const encodings: number[][] = Array.isArray(storedData[0]) 
          ? storedData // Already an array of encodings
          : [storedData]; // Single encoding, wrap in array

        // Compare against all stored encodings and use the best match
        let bestSimilarity = 0;
        for (const storedEncoding of encodings) {
          if (!Array.isArray(storedEncoding)) continue;
          
          const similarity = compareFaces(inputEncoding, storedEncoding);
          if (similarity > bestSimilarity) {
            bestSimilarity = similarity;
          }
        }

        // Check if best similarity meets threshold
        if (bestSimilarity >= config.faceRecognition.threshold) {
          if (!bestMatch || bestSimilarity > bestMatch.similarity) {
            bestMatch = {
              employeeId: employee.id,
              similarity: bestSimilarity,
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
    const canvas = await base64ToCanvas(imageData);
    const detection = await faceapi.detectSingleFace(canvas);
    return !!detection;
  } catch (error) {
    logger.error('Face detection error', { error });
    return false;
  }
};
