import { BaseTextCaseStrategy } from './BaseTextCaseStrategy';

/**
 * Strategy for converting text to Title Case
 * Capitalizes the first letter of each word
 */
export class TitleCaseStrategy extends BaseTextCaseStrategy {
  constructor() {
    super(
      'Title Case',
      'Hello World',
      'Capitalizes the first letter of each word'
    );
  }

  convert(text: string): string {
    return text.replace(
      /\w\S*/g,
      (word) => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase()
    );
  }
}
