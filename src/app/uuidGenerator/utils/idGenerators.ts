/**
 * ID Generator Utilities
 *
 * Pure functions for generating different types of unique identifiers.
 * Supports UUID v1, v4, v7, nanoid-compatible, and MongoDB ObjectId-style IDs.
 * Uses browser-native crypto APIs only -- no external dependencies.
 */

// Module-level counter for ObjectId generation, wraps at 0xFFFFFF
let objectIdCounter = Math.floor(Math.random() * 0xffffff);

export type IdType = 'uuid-v1' | 'uuid-v4' | 'uuid-v7' | 'nanoid' | 'objectid';

export interface FormatOptions {
  hyphens: boolean;
  uppercase: boolean;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToHyphenatedUuid(hex: string): string {
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function applyUuidFormat(hyphenated: string, format: FormatOptions): string {
  const withHyphens = format.hyphens ? hyphenated : hyphenated.replace(/-/g, '');
  return format.uppercase ? withHyphens.toUpperCase() : withHyphens;
}

/**
 * Number of milliseconds between the Gregorian epoch (1582-10-15) and the
 * Unix epoch (1970-01-01). Used to compute UUID v1's 60-bit timestamp field.
 */
const GREGORIAN_TO_UNIX_EPOCH_MS = Date.UTC(1970, 0, 1) - Date.UTC(1582, 9, 15);

// Sub-millisecond tiebreaker for UUID v1: JS only has ms-resolution clocks, so this
// fills the 100ns-unit digits with an incrementing counter instead of a fixed 0.
let v1SubMillisecondCounter = 0;

/**
 * Generate a UUID v1 (RFC 4122): a 60-bit Gregorian timestamp + a random
 * 14-bit clock sequence + a randomized 48-bit node identifier.
 *
 * There is no real MAC address available in a browser, so per RFC 4122 §4.5
 * the node ID is generated randomly with its multicast bit set to mark it as
 * non-hardware -- surfaced in the UI as "random node".
 */
export function generateUuidV1(format: FormatOptions): string {
  v1SubMillisecondCounter = (v1SubMillisecondCounter + 1) % 10000;
  const timestamp100ns =
    BigInt(Date.now() + GREGORIAN_TO_UNIX_EPOCH_MS) * BigInt(10000) + BigInt(v1SubMillisecondCounter);

  const timeLow = Number(timestamp100ns & BigInt(0xffffffff));
  const timeMid = Number((timestamp100ns >> BigInt(32)) & BigInt(0xffff));
  const timeHi = Number((timestamp100ns >> BigInt(48)) & BigInt(0x0fff));

  const clockSeq = crypto.getRandomValues(new Uint16Array(1))[0] & 0x3fff; // 14-bit clock sequence
  const clockSeqHiAndReserved = 0x80 | (clockSeq >> 8); // variant '10' + top 6 bits
  const clockSeqLow = clockSeq & 0xff;

  const node = crypto.getRandomValues(new Uint8Array(6));
  node[0] |= 0x01; // multicast bit set: signals a randomized, non-hardware node ID

  const hex =
    timeLow.toString(16).padStart(8, '0') +
    timeMid.toString(16).padStart(4, '0') +
    (0x1000 | timeHi).toString(16).padStart(4, '0') + // version 1 in the top nibble
    clockSeqHiAndReserved.toString(16).padStart(2, '0') +
    clockSeqLow.toString(16).padStart(2, '0') +
    bytesToHex(node);

  return applyUuidFormat(hexToHyphenatedUuid(hex), format);
}

/**
 * Generate a UUID v7 (RFC 9562): a 48-bit unix-ms timestamp followed by
 * version/variant bits and 74 random bits, making IDs coarsely time-ordered
 * while remaining unpredictable.
 */
export function generateUuidV7(format: FormatOptions): string {
  const bytes = new Uint8Array(16);

  let ms = Date.now();
  for (let i = 5; i >= 0; i--) {
    bytes[i] = ms % 256;
    ms = Math.floor(ms / 256);
  }

  const random = crypto.getRandomValues(new Uint8Array(10));
  bytes[6] = 0x70 | (random[0] & 0x0f); // version 7 + 4 random bits (rand_a high)
  bytes[7] = random[1]; // rand_a low 8 bits
  bytes[8] = 0x80 | (random[2] & 0x3f); // variant '10' + 6 random bits (rand_b high)
  bytes[9] = random[3];
  bytes[10] = random[4];
  bytes[11] = random[5];
  bytes[12] = random[6];
  bytes[13] = random[7];
  bytes[14] = random[8];
  bytes[15] = random[9];

  return applyUuidFormat(hexToHyphenatedUuid(bytesToHex(bytes)), format);
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
    case 'uuid-v1':
      return generateUuidV1(format);
    case 'uuid-v4':
      return generateUuidV4(format);
    case 'uuid-v7':
      return generateUuidV7(format);
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
    case 'uuid-v1':
      return 'UUID v1';
    case 'uuid-v4':
      return 'UUID v4';
    case 'uuid-v7':
      return 'UUID v7';
    case 'nanoid':
      return 'Nano ID';
    case 'objectid':
      return 'ObjectId';
    default:
      return 'Unknown';
  }
}
