/**
 * JSON to CSV Conversion Utilities
 *
 * Handles parsing JSON input and converting structured data to JSON output.
 */

import type { ParsedData } from './csvParser';
import { buildRowsFromItems } from './tabularRows';

/**
 * Parse a JSON string into structured data (headers + rows).
 * Expects an array of objects, or a single object (which will be wrapped in an array).
 */
export function parseJSON(text: string): ParsedData {
  const trimmed = text.trim();
  if (!trimmed) {
    return { headers: [], rows: [] };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error('Invalid JSON: ' + (trimmed.length > 80 ? 'parse error' : 'could not parse input'));
  }

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) {
      return { headers: [], rows: [] };
    }
    return buildRowsFromItems(parsed);
  }

  if (parsed !== null && typeof parsed === 'object') {
    return buildRowsFromItems([parsed]);
  }

  throw new Error('JSON must be an array of objects or a single object');
}

/**
 * Serialize structured data to a pretty-printed JSON string.
 */
export function serializeJSON(data: ParsedData): string {
  const { headers, rows } = data;
  if (headers.length === 0 || rows.length === 0) {
    return '[]';
  }

  const objects = rows.map((row) => {
    const obj: Record<string, string> = {};
    for (const h of headers) {
      obj[h] = row[h] ?? '';
    }
    return obj;
  });

  return JSON.stringify(objects, null, 2);
}
