/**
 * Utility functions for file operations
 */

/**
 * Downloads text content as a file
 * @param content - The text content to download
 * @param filename - The name of the file
 * @param mimeType - The MIME type (default: text/html)
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string = 'text/html'
): void {
  // Create a Blob from the content
  const blob = new Blob([content], { type: mimeType });

  // Create a temporary URL for the blob
  const url = URL.createObjectURL(blob);

  // Create a temporary anchor element and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates a filename with timestamp
 * @param prefix - The filename prefix
 * @param extension - The file extension (default: .html)
 * @returns Filename with timestamp
 */
export function generateFilename(prefix: string = 'formatted', extension: string = 'html'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  return `${prefix}-${timestamp}-${time}.${extension}`;
}

/**
 * Validates if a filename has a valid HTML extension
 * @param filename - The filename to validate
 * @returns True if valid HTML file
 */
export function isValidHTMLFilename(filename: string): boolean {
  return /\.(html?|htm)$/i.test(filename);
}

/**
 * Extracts the filename without extension
 * @param filename - The full filename
 * @returns Filename without extension
 */
export function getFilenameWithoutExtension(filename: string): string {
  return filename.replace(/\.(html?|htm)$/i, '');
}
