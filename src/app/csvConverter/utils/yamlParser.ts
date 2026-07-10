/**
 * YAML Parser/Serializer using js-yaml
 *
 * Converts between YAML and the ParsedData format used by the CSV Converter.
 * Handles sequences of mappings (the most common data structure for tabular data).
 */

import yaml from 'js-yaml';
import type { ParsedData } from './csvParser';
import { buildRowsFromItems } from './tabularRows';

/**
 * Parse a YAML string into structured data.
 */
export function parseYAML(text: string): ParsedData {
  const trimmed = text.trim();
  if (!trimmed) {
    return { headers: [], rows: [] };
  }

  let parsed: unknown;
  try {
    parsed = yaml.load(trimmed);
  } catch {
    throw new Error('Invalid YAML: could not parse input');
  }

  // Handle sequence (array), which may mix mappings with bare scalars
  if (Array.isArray(parsed)) {
    if (parsed.length === 0) {
      return { headers: [], rows: [] };
    }
    return buildRowsFromItems(parsed);
  }

  // Handle single mapping (object)
  if (parsed !== null && typeof parsed === 'object') {
    return buildRowsFromItems([parsed]);
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
