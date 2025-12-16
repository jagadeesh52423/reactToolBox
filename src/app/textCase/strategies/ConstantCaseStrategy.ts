import { BaseTextCaseStrategy } from './BaseTextCaseStrategy';

/**
 * Strategy for converting text to CONSTANT_CASE
 * Words separated by underscores, all uppercase
 */
export class ConstantCaseStrategy extends BaseTextCaseStrategy {
  constructor() {
    super(
      'CONSTANT_CASE',
      'HELLO_WORLD',
      'Words separated by underscores in uppercase'
    );
  }

  convert(text: string): string {
    return text
      .replace(/\s+/g, '_')
      .replace(/[A-Z]/g, (match, index) =>
        index > 0 ? `_${match}` : match
      )
      .replace(/[-./]/g, '_')
      .replace(/_+/g, '_')
      .toUpperCase();
  }
}
