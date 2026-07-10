/**
 * Shared row-building logic for JSON/YAML arrays that may mix plain objects with
 * primitives or nested arrays (e.g. [{"a":1}, "loose string", 42]).
 */

import type { ParsedData } from './csvParser';

const DEFAULT_VALUE_COLUMN = '_value';

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

/**
 * Builds headers + rows from an array of items. Items that aren't plain objects
 * (strings, numbers, booleans, arrays, null) are kept, not dropped: they're placed
 * under a dedicated value column so no entry silently disappears into an empty row.
 */
export function buildRowsFromItems(items: unknown[]): ParsedData {
  const headerSet = new Set<string>();
  let hasNonObjectItem = false;

  for (const item of items) {
    if (isPlainRecord(item)) {
      for (const key of Object.keys(item)) headerSet.add(key);
    } else {
      hasNonObjectItem = true;
    }
  }

  let valueColumn = DEFAULT_VALUE_COLUMN;
  while (headerSet.has(valueColumn)) valueColumn = '_' + valueColumn;
  if (hasNonObjectItem) headerSet.add(valueColumn);

  const headers = Array.from(headerSet);
  const rows = items.map((item) => {
    const row: Record<string, string> = {};
    for (const header of headers) row[header] = '';

    if (isPlainRecord(item)) {
      for (const header of headers) {
        if (header in item) row[header] = stringifyValue(item[header]);
      }
    } else {
      row[valueColumn] = stringifyValue(item);
    }

    return row;
  });

  return { headers, rows };
}
