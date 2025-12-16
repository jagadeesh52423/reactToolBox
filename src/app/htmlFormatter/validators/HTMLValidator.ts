import { HTMLToken, TokenType, TagDisplayType } from '../models/HTMLToken';

/**
 * Validation error model
 */
export interface ValidationError {
  type: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  tagName?: string;
  suggestion?: string;
}

/**
 * Validation result model
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  info: ValidationError[];
}

/**
 * HTML Validator class
 * Validates HTML structure, nesting, attributes, and best practices
 */
export class HTMLValidator {
  private errors: ValidationError[] = [];
  private warnings: ValidationError[] = [];
  private info: ValidationError[] = [];

  /**
   * Validates HTML tokens and returns comprehensive validation result
   */
  public validate(tokens: HTMLToken[]): ValidationResult {
    this.reset();

    // Run all validation checks
    this.validateTagMatching(tokens);
    this.validateNesting(tokens);
    this.validateRequiredAttributes(tokens);
    this.validateDeprecatedTags(tokens);
    this.validateAccessibility(tokens);
    this.validateSEO(tokens);

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      info: this.info,
    };
  }

  private reset(): void {
    this.errors = [];
    this.warnings = [];
    this.info = [];
  }

  /**
   * Validates that all tags are properly matched and closed
   */
  private validateTagMatching(tokens: HTMLToken[]): void {
    const tagStack: { tagName: string; index: number }[] = [];

    tokens.forEach((token, index) => {
      if (token.type === TokenType.TAG_OPEN && token.tagName) {
        tagStack.push({ tagName: token.tagName, index });
      } else if (token.type === TokenType.TAG_CLOSE && token.tagName) {
        const expected = tagStack.pop();
        if (!expected) {
          this.errors.push({
            type: 'error',
            message: `Unexpected closing tag </${token.tagName}>`,
            tagName: token.tagName,
            suggestion: `Remove this closing tag or add a matching opening tag`,
          });
        } else if (expected.tagName !== token.tagName) {
          this.errors.push({
            type: 'error',
            message: `Mismatched tags: expected </${expected.tagName}>, found </${token.tagName}>`,
            tagName: token.tagName,
            suggestion: `Change to </${expected.tagName}> or check your tag structure`,
          });
          // Put the expected tag back for further checking
          tagStack.push(expected);
        }
      }
    });

    // Check for unclosed tags
    tagStack.forEach((unclosed) => {
      this.errors.push({
        type: 'error',
        message: `Unclosed tag <${unclosed.tagName}>`,
        tagName: unclosed.tagName,
        suggestion: `Add </${unclosed.tagName}> before the end of the document`,
      });
    });
  }

  /**
   * Validates proper nesting of HTML elements
   */
  private validateNesting(tokens: HTMLToken[]): void {
    const tagStack: string[] = [];

    // Invalid nesting rules
    const invalidNesting: Record<string, string[]> = {
      p: ['p', 'div', 'section', 'article', 'header', 'footer', 'main', 'aside'],
      a: ['a'], // No nested anchors
      button: ['a', 'button'], // No buttons inside anchors or buttons
      form: ['form'], // No nested forms
      label: ['label'], // No nested labels
    };

    tokens.forEach((token) => {
      if (token.type === TokenType.TAG_OPEN && token.tagName) {
        // Check if this tag is invalid inside current parent
        const parent = tagStack[tagStack.length - 1];
        if (parent && invalidNesting[parent]?.includes(token.tagName)) {
          this.errors.push({
            type: 'error',
            message: `Invalid nesting: <${token.tagName}> cannot be inside <${parent}>`,
            tagName: token.tagName,
            suggestion: `Move <${token.tagName}> outside of <${parent}>`,
          });
        }

        tagStack.push(token.tagName);
      } else if (token.type === TokenType.TAG_CLOSE && token.tagName) {
        tagStack.pop();
      }
    });
  }

  /**
   * Validates required attributes on specific tags
   */
  private validateRequiredAttributes(tokens: HTMLToken[]): void {
    const requiredAttrs: Record<string, { attrs: string[]; message: string }> = {
      img: {
        attrs: ['src', 'alt'],
        message: 'Images should have src and alt attributes',
      },
      a: {
        attrs: ['href'],
        message: 'Anchor tags should have href attribute',
      },
      form: {
        attrs: ['action'],
        message: 'Forms should have action attribute',
      },
      input: {
        attrs: ['type'],
        message: 'Input elements should have type attribute',
      },
      label: {
        attrs: ['for'],
        message: 'Labels should have for attribute linking to input',
      },
    };

    tokens.forEach((token) => {
      if (token.type === TokenType.TAG_OPEN && token.tagName) {
        const requirements = requiredAttrs[token.tagName];
        if (requirements) {
          const attributes = token.attributes?.toLowerCase() || '';
          requirements.attrs.forEach((attr) => {
            if (!attributes.includes(`${attr}=`)) {
              this.warnings.push({
                type: 'warning',
                message: `<${token.tagName}> missing ${attr} attribute`,
                tagName: token.tagName,
                suggestion: requirements.message,
              });
            }
          });
        }
      }
    });
  }

  /**
   * Checks for deprecated HTML tags
   */
  private validateDeprecatedTags(tokens: HTMLToken[]): void {
    const deprecatedTags: Record<string, string> = {
      center: 'Use CSS text-align: center instead',
      font: 'Use CSS for styling text',
      big: 'Use CSS font-size instead',
      strike: 'Use <del> or CSS text-decoration instead',
      tt: 'Use <code> or CSS font-family instead',
      acronym: 'Use <abbr> instead',
      applet: 'Use <object> or <embed> instead',
      basefont: 'Use CSS for font settings',
      dir: 'Use <ul> instead',
      frame: 'Use <iframe> or CSS layout instead',
      frameset: 'Use modern layout techniques',
      noframes: 'Not needed in modern HTML',
      s: 'Use <del> or CSS instead',
      u: 'Use CSS text-decoration instead',
    };

    tokens.forEach((token) => {
      if (
        (token.type === TokenType.TAG_OPEN || token.type === TokenType.TAG_CLOSE) &&
        token.tagName &&
        deprecatedTags[token.tagName]
      ) {
        this.warnings.push({
          type: 'warning',
          message: `Deprecated tag <${token.tagName}> found`,
          tagName: token.tagName,
          suggestion: deprecatedTags[token.tagName],
        });
      }
    });
  }

  /**
   * Validates accessibility best practices
   */
  private validateAccessibility(tokens: HTMLToken[]): void {
    let hasHtmlLang = false;
    let hasMainLandmark = false;
    let headingLevel = 0;
    const headingSequence: number[] = [];

    tokens.forEach((token) => {
      if (token.type === TokenType.TAG_OPEN && token.tagName) {
        // Check for lang attribute on html tag
        if (token.tagName === 'html' && token.attributes?.includes('lang')) {
          hasHtmlLang = true;
        }

        // Check for main landmark
        if (token.tagName === 'main') {
          hasMainLandmark = true;
        }

        // Check heading hierarchy
        if (token.tagName.match(/^h[1-6]$/)) {
          const level = parseInt(token.tagName[1]);
          headingSequence.push(level);
        }

        // Check for buttons without accessible text
        if (token.tagName === 'button') {
          // This is a simplified check - ideally would look at content
          if (!token.attributes?.includes('aria-label')) {
            this.info.push({
              type: 'info',
              message: 'Consider adding aria-label to buttons without text',
              tagName: token.tagName,
              suggestion: 'Add descriptive aria-label for screen readers',
            });
          }
        }
      }
    });

    if (!hasHtmlLang) {
      this.warnings.push({
        type: 'warning',
        message: 'Missing lang attribute on <html> tag',
        suggestion: 'Add lang="en" (or appropriate language) for accessibility',
      });
    }

    // Check heading hierarchy
    for (let i = 1; i < headingSequence.length; i++) {
      if (headingSequence[i] > headingSequence[i - 1] + 1) {
        this.warnings.push({
          type: 'warning',
          message: `Heading hierarchy skipped from h${headingSequence[i - 1]} to h${headingSequence[i]}`,
          suggestion: 'Maintain sequential heading levels for accessibility',
        });
        break; // Only report once
      }
    }
  }

  /**
   * Validates SEO best practices
   */
  private validateSEO(tokens: HTMLToken[]): void {
    let hasTitle = false;
    let hasMetaDescription = false;
    let hasH1 = false;
    let h1Count = 0;

    tokens.forEach((token) => {
      if (token.type === TokenType.TAG_OPEN && token.tagName) {
        if (token.tagName === 'title') {
          hasTitle = true;
        }

        if (token.tagName === 'meta' && token.attributes?.includes('name="description"')) {
          hasMetaDescription = true;
        }

        if (token.tagName === 'h1') {
          hasH1 = true;
          h1Count++;
        }
      }
    });

    if (!hasTitle) {
      this.info.push({
        type: 'info',
        message: 'Missing <title> tag in document',
        suggestion: 'Add a descriptive title for SEO',
      });
    }

    if (!hasMetaDescription) {
      this.info.push({
        type: 'info',
        message: 'Missing meta description',
        suggestion: 'Add <meta name="description" content="..."> for SEO',
      });
    }

    if (!hasH1) {
      this.info.push({
        type: 'info',
        message: 'Missing <h1> tag in document',
        suggestion: 'Add an h1 tag for better SEO',
      });
    } else if (h1Count > 1) {
      this.warnings.push({
        type: 'warning',
        message: `Multiple <h1> tags found (${h1Count})`,
        suggestion: 'Use only one h1 per page for best SEO practices',
      });
    }
  }
}
