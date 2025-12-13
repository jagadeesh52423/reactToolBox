/**
 * Format HTML with proper indentation
 */
export function formatHtml(html: string, indentSize: number = 2): string {
  const indent = ' '.repeat(indentSize);

  // Normalize whitespace but be more careful about preserving meaningful spaces
  let cleaned = html.replace(/\s+/g, ' ').trim();


  // Self-closing tags
  const selfClosingTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

  // Inline tags
  const inlineTags = new Set(['a', 'span', 'strong', 'em', 'b', 'i', 'code', 'small', 'sub', 'sup']);

  let result = '';
  let indentLevel = 0;

  // Split into tokens while preserving tags and handling whitespace better
  const tokens = cleaned.split(/(<[^>]*>)/g).filter(token => token.length > 0);

  // Function to check if we're currently in an inline context
  function isInInlineContext(tokenIndex: number): boolean {
    // Look backward to see if we have unclosed inline tags
    let openInlineTags = 0;
    for (let j = tokenIndex - 1; j >= 0; j--) {
      const prevToken = tokens[j];
      if (prevToken.startsWith('<')) {
        const tagName = prevToken.match(/<\/?([a-zA-Z][a-zA-Z0-9]*)/i)?.[1]?.toLowerCase();
        if (tagName && inlineTags.has(tagName)) {
          if (prevToken.startsWith('</')) {
            openInlineTags--;
          } else {
            openInlineTags++;
            if (openInlineTags > 0) return true;
          }
        } else if (!prevToken.startsWith('<!--') && !prevToken.startsWith('<!')) {
          // Hit a block element, stop looking
          break;
        }
      }
    }
    return false;
  }

  // Function to check if content has inline elements mixed in
  function hasInlineElementsNearby(tokenIndex: number): boolean {
    // Look for inline elements in the immediate vicinity (not too far)
    const checkRange = 3;
    let hasInlineElementsInSequence = false;

    // Check tokens around this one for inline elements
    for (let j = Math.max(0, tokenIndex - checkRange); j < Math.min(tokens.length, tokenIndex + checkRange); j++) {
      if (j === tokenIndex) continue;
      const token = tokens[j];
      if (token.startsWith('<')) {
        const tagName = token.match(/<\/?([a-zA-Z][a-zA-Z0-9]*)/i)?.[1]?.toLowerCase();
        if (tagName && inlineTags.has(tagName)) {
          hasInlineElementsInSequence = true;
          break;
        }
      }
    }

    // Additional check: if this text is sandwiched between inline elements
    const prevToken = tokens[tokenIndex - 1];
    const nextToken = tokens[tokenIndex + 1];

    if (prevToken && nextToken) {
      const prevIsInline = prevToken.startsWith('<') &&
        inlineTags.has(prevToken.match(/<\/?([a-zA-Z][a-zA-Z0-9]*)/i)?.[1]?.toLowerCase() || '');
      const nextIsInline = nextToken.startsWith('<') &&
        inlineTags.has(nextToken.match(/<\/?([a-zA-Z][a-zA-Z0-9]*)/i)?.[1]?.toLowerCase() || '');

      if (prevIsInline && nextIsInline) {
        return true;
      }
    }

    return hasInlineElementsInSequence;
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.startsWith('<')) {
      // It's a tag
      if (token.startsWith('<!DOCTYPE') || token.startsWith('<!doctype')) {
        result += token + '\n';
      } else if (token.startsWith('<!--')) {
        result += indent.repeat(indentLevel) + token + '\n';
      } else if (token.startsWith('</')) {
        // Closing tag
        const tagName = token.match(/<\/([a-zA-Z][a-zA-Z0-9]*)/i)?.[1]?.toLowerCase() || '';

        if (inlineTags.has(tagName)) {
          result += token;
        } else {
          indentLevel--;
          result += indent.repeat(indentLevel) + token + '\n';
        }
      } else {
        // Opening tag
        const tagMatch = token.match(/<([a-zA-Z][a-zA-Z0-9]*)/i);
        const tagName = tagMatch?.[1]?.toLowerCase() || '';
        const isSelfClosing = token.endsWith('/>') || selfClosingTags.has(tagName);

        if (inlineTags.has(tagName)) {
          result += token;
        } else {
          result += indent.repeat(indentLevel) + token + '\n';
          if (!isSelfClosing) {
            indentLevel++;
          }
        }
      }
    } else {
      // It's text content
      const trimmedToken = token.trim();
      if (!trimmedToken) continue;

      // Check if we're in an inline context or if this text has inline elements nearby
      const inInlineContext = isInInlineContext(i);
      const hasInlineNearby = hasInlineElementsNearby(i);

      // Special case: check if this is just content of a simple element (like <h1>Welcome</h1>)
      const prevToken = tokens[i - 1];
      const nextToken = tokens[i + 1];

      const isSimpleContent = prevToken && nextToken &&
        prevToken.startsWith('<') && !prevToken.startsWith('</') &&
        nextToken.startsWith('<') && nextToken.startsWith('</') &&
        !inlineTags.has(prevToken.match(/<([a-zA-Z][a-zA-Z0-9]*)/i)?.[1]?.toLowerCase() || '');

      // Special case: if we have a single inline element as the only content of a block element
      // (like <li><a href="#">Home</a></li>), treat it as inline
      const isSingleInlineInBlock = prevToken && nextToken &&
        prevToken.startsWith('<') && !prevToken.startsWith('</') &&
        nextToken.startsWith('<') && nextToken.startsWith('</') &&
        inlineTags.has(nextToken.match(/<\/([a-zA-Z][a-zA-Z0-9]*)/i)?.[1]?.toLowerCase() || '');

      // Also check if the previous token is an opening inline tag
      const prevIsOpeningInlineTag = prevToken && prevToken.startsWith('<') && !prevToken.startsWith('</') &&
        inlineTags.has(prevToken.match(/<([a-zA-Z][a-zA-Z0-9]*)/i)?.[1]?.toLowerCase() || '');

      // Check if this is content that should be treated as part of a block element with only inline content
      // Look for patterns like: <li> ... <a> ... text ... </a> ... </li>
      const isInSimpleBlockWithInline = (function() {
        // Look backwards to find the containing block element
        let openBlockTags = 0;
        let foundInlineTag = false;

        for (let j = i - 1; j >= 0; j--) {
          const checkToken = tokens[j];
          if (checkToken.startsWith('</')) {
            const tagName = checkToken.match(/<\/([a-zA-Z][a-zA-Z0-9]*)/i)?.[1]?.toLowerCase();
            if (tagName && !inlineTags.has(tagName)) {
              openBlockTags++;
            } else if (tagName && inlineTags.has(tagName)) {
              foundInlineTag = true;
            }
          } else if (checkToken.startsWith('<') && !checkToken.startsWith('<!--')) {
            const tagName = checkToken.match(/<([a-zA-Z][a-zA-Z0-9]*)/i)?.[1]?.toLowerCase();
            if (tagName && !inlineTags.has(tagName)) {
              openBlockTags--;
              if (openBlockTags < 0) {
                // We found our containing block element
                return foundInlineTag;
              }
            }
          }
        }
        return false;
      })();

      if ((inInlineContext || hasInlineNearby || isSingleInlineInBlock || prevIsOpeningInlineTag || isInSimpleBlockWithInline) && !isSimpleContent) {
        // This text is part of an inline sequence
        // Preserve the original spacing from the token
        result += token;
      } else {
        // Regular text content, add with proper indentation
        result += indent.repeat(indentLevel) + trimmedToken + '\n';
      }
    }
  }

  // Post-process to fix simple inline-only patterns
  result = result.replace(
    /(<li[^>]*>)\n(<a[^>]*>[^<]*<\/a>)\s*\n(\s*<\/li>)/gi,
    '$1$2$3'
  );

  // Also handle other inline elements in list items
  result = result.replace(
    /(<li[^>]*>)\n(<(?:span|strong|em|b|i|code)[^>]*>[^<]*<\/(?:span|strong|em|b|i|code)>)\s*\n(\s*<\/li>)/gi,
    '$1$2$3'
  );

  return result.trim();
}

/**
 * Helper function to get the last opened tag from a line
 */
function getLastOpenTag(line: string): string {
  const tagMatch = line.match(/<([a-zA-Z][a-zA-Z0-9]*)[^>]*>(?!.*<\/\1>)$/i);
  return tagMatch ? tagMatch[1].toLowerCase() : '';
}

/**
 * Basic HTML syntax highlighting
 */
export function highlightHtml(code: string): string {
  // Escape HTML entities first
  let result = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Style for HTML comments
  result = result.replace(
    /&lt;!--(.*?)--&gt;/g,
    '<span class="text-gray-500">&lt;!--$1--&gt;</span>'
  );

  // Style for DOCTYPE
  result = result.replace(
    /&lt;(!DOCTYPE[^&]*?)&gt;/gi,
    '<span class="text-purple-600">&lt;$1&gt;</span>'
  );

  // Style for opening and closing tags
  result = result.replace(
    /&lt;(\/?)([\w-]+)([^&]*?)&gt;/g,
    (match, slash, tagName, attributes) => {
      let styledTag = `<span class="text-blue-600">&lt;${slash}${tagName}</span>`;

      if (attributes) {
        // Style attributes
        let styledAttributes = attributes.replace(
          /([\w-]+)(=)(".*?"|'.*?')/g,
          '<span class="text-purple-600">$1</span><span class="text-gray-600">$2</span><span class="text-green-600">$3</span>'
        );
        styledTag += styledAttributes;
      }

      styledTag += '<span class="text-blue-600">&gt;</span>';
      return styledTag;
    }
  );

  return result;
}
