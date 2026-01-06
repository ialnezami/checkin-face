import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '8000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'checkin_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Face Recognition
  faceRecognition: {
    modelPath: process.env.FACE_RECOGNITION_MODEL_PATH || './models',
    threshold: parseFloat(process.env.FACE_RECOGNITION_THRESHOLD || '0.6'),
    confidence: parseFloat(process.env.FACE_DETECTION_CONFIDENCE || '0.7'),
  },

  // Fingerprint
  fingerprint: {
    devicePath: process.env.FINGERPRINT_DEVICE_PATH || '/dev/ttyUSB0',
    baudrate: parseInt(process.env.FINGERPRINT_BAUDRATE || '57600'),
  },

  // RFID
  rfid: {
    devicePath: process.env.RFID_DEVICE_PATH || '/dev/ttyUSB1',
    baudrate: parseInt(process.env.RFID_BAUDRATE || '9600'),
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png').split(','),
  },

  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10'),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
};

