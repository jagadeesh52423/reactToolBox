import { BaseTextCaseStrategy } from './BaseTextCaseStrategy';

/**
 * Strategy for converting text to aLtErNaTiNg CaSe
 * Alternates between lowercase and uppercase for each character
 */
export class AlternatingCaseStrategy extends BaseTextCaseStrategy {
  constructor() {
    super(
      'aLtErNaTiNg CaSe',
      'hElLo WoRlD',
      'Alternates between lowercase and uppercase characters'
    );
  }

  convert(text: string): string {
    return text
      .split('')
      .map((char, index) =>
        index % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
      )
      .join('');
  }
}
