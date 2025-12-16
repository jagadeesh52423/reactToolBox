import { BaseTextCaseStrategy } from './BaseTextCaseStrategy';

/**
 * Strategy for converting text to snake_case
 * Words separated by underscores, all lowercase
 */
export class SnakeCaseStrategy extends BaseTextCaseStrategy {
  constructor() {
    super(
      'snake_case',
      'hello_world',
      'Words separated by underscores in lowercase'
    );
  }

  convert(text: string): string {
    return text
      .replace(/\s+/g, '_')
      .replace(/[A-Z]/g, (match, index) =>
        index > 0 ? `_${match.toLowerCase()}` : match.toLowerCase()
      )
      .replace(/[-./]/g, '_')
      .replace(/_+/g, '_')
      .toLowerCase();
  }
}
