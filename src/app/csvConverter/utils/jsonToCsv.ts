/**
 * JSON to CSV Conversion Utilities
 *
 * Handles parsing JSON input and converting structured data to JSON output.
 */

import type { ParsedData } from './csvParser';

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

  let items: Record<string, unknown>[];

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) {
      return { headers: [], rows: [] };
    }
    items = parsed;
  } else if (parsed !== null && typeof parsed === 'object') {
    items = [parsed as Record<string, unknown>];
  } else {
    throw new Error('JSON must be an array of objects or a single object');
  }

  // Extract headers from the union of all keys
  const headerSet = new Set<string>();
  for (const item of items) {
    if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
      for (const key of Object.keys(item)) {
        headerSet.add(key);
      }
    }
  }

  const headers = Array.from(headerSet);
  const rows: Record<string, string>[] = items.map((item) => {
    const row: Record<string, string> = {};
    for (const h of headers) {
      const val = (item as Record<string, unknown>)[h];
      if (val === null || val === undefined) {
        row[h] = '';
      } else if (typeof val === 'object') {
        row[h] = JSON.stringify(val);
      } else {
        row[h] = String(val);
      }
    }
    return row;
  });

  return { headers, rows };
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
