import { BaseTextCaseStrategy } from './BaseTextCaseStrategy';

/**
 * Strategy for converting text to path/case
 * Words separated by forward slashes, all lowercase
 */
export class PathCaseStrategy extends BaseTextCaseStrategy {
  constructor() {
    super(
      'path/case',
      'hello/world',
      'Words separated by forward slashes in lowercase'
    );
  }

  convert(text: string): string {
    return text
      .replace(/\s+/g, '/')
      .replace(/[A-Z]/g, (match, index) =>
        index > 0 ? `/${match.toLowerCase()}` : match.toLowerCase()
      )
      .replace(/[-_.]/g, '/')
      .replace(/\/+/g, '/')
      .toLowerCase();
  }
}
