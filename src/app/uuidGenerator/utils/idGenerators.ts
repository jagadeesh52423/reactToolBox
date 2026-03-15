/**
 * ID Generator Utilities
 *
 * Pure functions for generating different types of unique identifiers.
 * Supports UUID v4, nanoid-compatible, and MongoDB ObjectId-style IDs.
 * Uses browser-native crypto APIs only -- no external dependencies.
 */

// Module-level counter for ObjectId generation, wraps at 0xFFFFFF
let objectIdCounter = Math.floor(Math.random() * 0xffffff);

export type IdType = 'uuid-v4' | 'nanoid' | 'objectid';

export interface FormatOptions {
  hyphens: boolean;
  uppercase: boolean;
}

/**
 * Generate a UUID v4 using crypto.randomUUID().
 * Applies format options for hyphens and case.
 */
export function generateUuidV4(format: FormatOptions): string {
  let uuid = crypto.randomUUID();

  if (!format.hyphens) {
    uuid = uuid.replace(/-/g, '');
  }

  if (format.uppercase) {
    uuid = uuid.toUpperCase();
  }

  return uuid;
}

/**
 * Generate a nanoid-compatible URL-safe ID.
 * Alphabet: A-Za-z0-9_- (64 characters)
 * Length: 21 characters (standard nanoid length)
 * Uses crypto.getRandomValues for secure randomness.
 */
export function generateNanoid(format: FormatOptions): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  const size = 21;
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  let id = '';

  for (let i = 0; i < size; i++) {
    id += alphabet[bytes[i] & 63]; // modulo 64 via bitmask
  }

  if (format.uppercase) {
    id = id.toUpperCase();
  }

  return id;
}

/**
 * Generate a MongoDB ObjectId-style 24-character hex string.
 * Format:
 *   - 4 bytes: Unix timestamp in seconds
 *   - 5 bytes: random value
 *   - 3 bytes: incrementing counter (wraps at 0xFFFFFF)
 */
export function generateObjectId(format: FormatOptions): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const randomBytes = crypto.getRandomValues(new Uint8Array(5));

  objectIdCounter = (objectIdCounter + 1) & 0xffffff;

  const hex =
    timestamp.toString(16).padStart(8, '0') +
    Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('') +
    objectIdCounter.toString(16).padStart(6, '0');

  return format.uppercase ? hex.toUpperCase() : hex;
}

/**
 * Generate a single ID of the specified type.
 */
export function generateId(type: IdType, format: FormatOptions): string {
  switch (type) {
    case 'uuid-v4':
      return generateUuidV4(format);
    case 'nanoid':
      return generateNanoid(format);
    case 'objectid':
      return generateObjectId(format);
    default:
      return generateUuidV4(format);
  }
}

/**
 * Generate a batch of IDs.
 * @param type - The type of ID to generate
 * @param quantity - Number of IDs to generate (1-100)
 * @param format - Formatting options
 * @returns Array of generated ID strings
 */
export function generateBatch(
  type: IdType,
  quantity: number,
  format: FormatOptions
): string[] {
  const clamped = Math.max(1, Math.min(100, quantity));
  const ids: string[] = [];

  for (let i = 0; i < clamped; i++) {
    ids.push(generateId(type, format));
  }

  return ids;
}

/**
 * Get a human-readable label for an ID type.
 */
export function getIdTypeLabel(type: IdType): string {
  switch (type) {
    case 'uuid-v4':
      return 'UUID v4';
    case 'nanoid':
      return 'Nano ID';
    case 'objectid':
      return 'ObjectId';
    default:
      return 'Unknown';
  }
}
