// Case transformation functions
export function toUpperCase(text: string): string {
  return text.toUpperCase();
}

export function toLowerCase(text: string): string {
  return text.toLowerCase();
}

export function toTitleCase(text: string): string {
  return text.replace(
    /\w\S*/g,
    (word) => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase()
  );
}

export function toCamelCase(text: string): string {
  return text
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '');
}

export function toPascalCase(text: string): string {
  return text
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '');
}

export function toSnakeCase(text: string): string {
  return text
    .replace(/\s+/g, '_')
    .replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`)
    .replace(/^_/, '')
    .replace(/-/g, '_')
    .replace(/_+/g, '_');
}

export function toKebabCase(text: string): string {
  return text
    .replace(/\s+/g, '-')
    .replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
    .replace(/^-/, '')
    .replace(/_/g, '-')
    .replace(/-+/g, '-');
}

export function toSentenceCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function toConstantCase(text: string): string {
  return text
    .replace(/\s+/g, '_')
    .replace(/[A-Z]/g, (match, index) => index > 0 ? `_${match}` : match)
    .replace(/[-./]/g, '_')
    .replace(/_+/g, '_')
    .toUpperCase();
}

export function toDotCase(text: string): string {
  return text
    .replace(/\s+/g, '.')
    .replace(/[A-Z]/g, (match, index) => index > 0 ? `.${match.toLowerCase()}` : match.toLowerCase())
    .replace(/[-_/]/g, '.')
    .replace(/\.+/g, '.')
    .toLowerCase();
}

export function toPathCase(text: string): string {
  return text
    .replace(/\s+/g, '/')
    .replace(/[A-Z]/g, (match, index) => index > 0 ? `/${match.toLowerCase()}` : match.toLowerCase())
    .replace(/[-_.]/g, '/')
    .replace(/\/+/g, '/')
    .toLowerCase();
}

export function toAlternatingCase(text: string): string {
  return text
    .split('')
    .map((char, index) => index % 2 === 0 ? char.toLowerCase() : char.toUpperCase())
    .join('');
}

export function toInverseCase(text: string): string {
  return text
    .split('')
    .map(char => char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase())
    .join('');
}

// Formatting functions
export function trimWhitespace(text: string): string {
  return text.trim();
}

export function removeExtraSpaces(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*/g, '\n')
    .trim();
}

// Encoding functions
export function encodeURL(text: string): string {
  return encodeURIComponent(text);
}

export function decodeURL(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch (error) {
    return 'Error decoding URL: Invalid encoding';
  }
}

// Counting functions
export function countCharacters(text: string): number {
  return text.length;
}

export function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

export function countLines(text: string): number {
  if (!text) return 0;
  return text.split('\n').length;
}
