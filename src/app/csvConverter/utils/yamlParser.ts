/**
 * YAML Parser/Serializer using js-yaml
 *
 * Converts between YAML and the ParsedData format used by the CSV Converter.
 * Handles sequences of mappings (the most common data structure for tabular data).
 */

import yaml from 'js-yaml';
import type { ParsedData } from './csvParser';

/**
 * Parse a YAML string into structured data.
 */
export function parseYAML(text: string): ParsedData {
  const trimmed = text.trim();
  if (!trimmed) {
    return { headers: [], rows: [] };
  }

  const parsed = yaml.load(trimmed);

  // Handle array of objects (sequence of mappings)
  if (Array.isArray(parsed)) {
    if (parsed.length === 0) {
      return { headers: [], rows: [] };
    }

    // Extract headers from union of all keys
    const headerSet = new Set<string>();
    for (const item of parsed) {
      if (item && typeof item === 'object') {
        for (const key of Object.keys(item)) {
          headerSet.add(key);
        }
      }
    }

    const headers = Array.from(headerSet);
    const rows: Record<string, string>[] = parsed.map((item) => {
      const row: Record<string, string> = {};
      for (const h of headers) {
        const val = item && typeof item === 'object' ? (item as Record<string, unknown>)[h] : undefined;
        row[h] = val != null ? String(val) : '';
      }
      return row;
    });

    return { headers, rows };
  }

  // Handle single object
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const obj = parsed as Record<string, unknown>;
    const headers = Object.keys(obj);
    const row: Record<string, string> = {};
    for (const h of headers) {
      row[h] = obj[h] != null ? String(obj[h]) : '';
    }
    return { headers, rows: [row] };
  }

  return { headers: [], rows: [] };
}

/**
 * Serialize structured data to YAML format (sequence of mappings).
 */
export function serializeYAML(data: ParsedData): string {
  const { headers, rows } = data;
  if (headers.length === 0 || rows.length === 0) {
    return '';
  }

  const items = rows.map((row) => {
    const obj: Record<string, string> = {};
    for (const h of headers) {
      obj[h] = row[h] ?? '';
    }
    return obj;
  });

  return yaml.dump(items, { lineWidth: -1 });
}
