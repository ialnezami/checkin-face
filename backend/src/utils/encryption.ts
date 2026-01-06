import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

// Get encryption key from environment or generate one
const getEncryptionKey = (): Buffer => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  // Ensure key is exactly 32 bytes (256 bits)
  return crypto.scryptSync(key, 'salt', KEY_LENGTH);
};

/**
 * Encrypts sensitive data (e.g., biometric data)
 */
export const encrypt = (text: string): string => {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  // Return iv:tag:encrypted
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
};

/**
 * Decrypts sensitive data
 */
export const decrypt = (encryptedData: string): string => {
  const key = getEncryptionKey();
  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const tag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

/**
 * Hashes a password using bcrypt (for PINs)
 */
export const hashPassword = async (password: string): Promise<string> => {
  const bcrypt = require('bcryptjs');
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compares a password with a hash
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(password, hash);
};

