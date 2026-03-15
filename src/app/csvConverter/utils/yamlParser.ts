/**
 * Minimal YAML Parser/Serializer
 *
 * Supports sequences of mappings (the most common data structure for tabular data).
 * This is NOT a full YAML parser -- it handles the tabular data use case only.
 *
 * Example supported format:
 *   - name: Alice
 *     age: 30
 *   - name: Bob
 *     age: 25
 */

import type { ParsedData } from './csvParser';

/**
 * Strip surrounding quotes from a YAML value string.
 */
function stripQuotes(val: string): string {
  const trimmed = val.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

/**
 * Parse a minimal YAML string into structured data.
 */
export function parseYAML(text: string): ParsedData {
  const trimmed = text.trim();
  if (!trimmed) {
    return { headers: [], rows: [] };
  }

  const lines = trimmed.split(/\r?\n/);
  const items: Record<string, string>[] = [];
  let currentItem: Record<string, string> | null = null;

  for (const rawLine of lines) {
    // Skip empty lines and comments
    if (rawLine.trim() === '' || rawLine.trim().startsWith('#')) {
      continue;
    }

    // New sequence item: "- key: value" or just "- key:"
    const seqMatch = rawLine.match(/^(\s*)-\s+(.*)/);
    if (seqMatch) {
      // Save previous item
      if (currentItem !== null) {
        items.push(currentItem);
      }
      currentItem = {};

      // The rest after "- " may contain a key: value pair
      const rest = seqMatch[2];
      const kvMatch = rest.match(/^([^:]+):\s*(.*)/);
      if (kvMatch) {
        const key = kvMatch[1].trim();
        const value = stripQuotes(kvMatch[2]);
        currentItem[key] = value;
      }
      continue;
    }

    // Continuation key: value (indented, no "- " prefix)
    const kvMatch = rawLine.match(/^\s+([^:]+):\s*(.*)/);
    if (kvMatch && currentItem !== null) {
      const key = kvMatch[1].trim();
      const value = stripQuotes(kvMatch[2]);
      currentItem[key] = value;
      continue;
    }

    // Top-level key: value without sequence marker (single object)
    const topKvMatch = rawLine.match(/^([^:\s-][^:]*):\s*(.*)/);
    if (topKvMatch) {
      if (currentItem === null) {
        currentItem = {};
      }
      const key = topKvMatch[1].trim();
      const value = stripQuotes(topKvMatch[2]);
      currentItem[key] = value;
    }
  }

  // Push the last item
  if (currentItem !== null) {
    items.push(currentItem);
  }

  if (items.length === 0) {
    return { headers: [], rows: [] };
  }

  // Extract headers from union of all keys
  const headerSet = new Set<string>();
  for (const item of items) {
    for (const key of Object.keys(item)) {
      headerSet.add(key);
    }
  }

  const headers = Array.from(headerSet);
  const rows: Record<string, string>[] = items.map((item) => {
    const row: Record<string, string> = {};
    for (const h of headers) {
      row[h] = item[h] ?? '';
    }
    return row;
  });

  return { headers, rows };
}

/**
 * Serialize structured data to YAML format (sequence of mappings).
 */
export function serializeYAML(data: ParsedData): string {
  const { headers, rows } = data;
  if (headers.length === 0 || rows.length === 0) {
    return '';
  }

  const needsQuote = (val: string): boolean => {
    if (val === '') return true;
    if (val.includes(':') || val.includes('#') || val.includes('\n')) return true;
    if (val.startsWith(' ') || val.endsWith(' ')) return true;
    if (val === 'true' || val === 'false' || val === 'null') return true;
    if (/^[\d.]+$/.test(val) && !isNaN(Number(val))) return true;
    return false;
  };

  const formatValue = (val: string): string => {
    if (needsQuote(val)) {
      return '"' + val.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
    }
    return val;
  };

  return rows
    .map((row) => {
      const lines: string[] = [];
      headers.forEach((h, idx) => {
        const prefix = idx === 0 ? '- ' : '  ';
        lines.push(`${prefix}${h}: ${formatValue(row[h] ?? '')}`);
      });
      return lines.join('\n');
    })
    .join('\n');
}
