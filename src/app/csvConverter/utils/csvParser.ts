/**
 * CSV Parser
 *
 * Parses CSV text into structured data and serializes structured data back to CSV.
 * Handles quoted fields, escaped quotes, and configurable delimiters.
 */

export interface ParsedData {
  headers: string[];
  rows: Record<string, string>[];
}

/**
 * Parse a single CSV line respecting quoted fields.
 * Fields may contain the delimiter, newlines, or escaped quotes ("").
 */
function parseCSVLine(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        current += char;
        i++;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
      } else if (char === delimiter) {
        fields.push(current);
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
  }

  fields.push(current);
  return fields;
}

/**
 * Split CSV text into logical lines, accounting for quoted fields
 * that may span multiple lines.
 */
function splitCSVLines(text: string): string[] {
  const lines: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && i + 1 < text.length && text[i + 1] === '\n') {
        i++;
      }
      if (current.trim().length > 0) {
        lines.push(current);
      }
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim().length > 0) {
    lines.push(current);
  }

  return lines;
}

/**
 * Parse CSV text into headers and rows.
 */
export function parseCSV(text: string, delimiter: string = ','): ParsedData {
  const trimmed = text.trim();
  if (!trimmed) {
    return { headers: [], rows: [] };
  }

  const lines = splitCSVLines(trimmed);
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = parseCSVLine(lines[0], delimiter).map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i], delimiter);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = j < values.length ? values[j].trim() : '';
    }
    rows.push(row);
  }

  return { headers, rows };
}

/**
 * Serialize structured data back to CSV text.
 */
export function serializeCSV(
  data: ParsedData,
  delimiter: string = ','
): string {
  const { headers, rows } = data;
  if (headers.length === 0) {
    return '';
  }

  const escapeField = (value: string): string => {
    if (
      value.includes(delimiter) ||
      value.includes('"') ||
      value.includes('\n') ||
      value.includes('\r')
    ) {
      return '"' + value.replace(/"/g, '""') + '"';
    }
    return value;
  };

  const headerLine = headers.map(escapeField).join(delimiter);
  const dataLines = rows.map((row) =>
    headers.map((h) => escapeField(row[h] ?? '')).join(delimiter)
  );

  return [headerLine, ...dataLines].join('\n');
}
