/**
 * Format HTML with proper indentation
 */
export function formatHtml(html: string, indentSize: number = 2): string {
  const indent = ' '.repeat(indentSize);
  let formattedHtml = '';
  let indentLevel = 0;
  let inTag = false;
  let inComment = false;
  let inContent = false;
  let lastChar = '';
  let currentTag = '';
  
  // List of tags that don't need to be indented
  const inlineTags = new Set(['span', 'a', 'strong', 'em', 'b', 'i', 'code', 'br', 'img', 'input', 'label']);
  
  // Process each character
  for (let i = 0; i < html.length; i++) {
    const char = html[i];
    
    // Handle comments
    if (i < html.length - 3 && html.substring(i, i + 4) === '<!--') {
      inComment = true;
      formattedHtml += '<!--';
      i += 3;
      continue;
    }
    
    if (inComment) {
      formattedHtml += char;
      if (i >= 2 && html.substring(i - 2, i + 1) === '-->') {
        inComment = false;
        formattedHtml += '\n' + indent.repeat(indentLevel);
      }
      continue;
    }
    
    // Start of tag
    if (char === '<' && html[i + 1] !== '/') {
      if (inContent) {
        formattedHtml += '\n' + indent.repeat(indentLevel);
        inContent = false;
      }
      
      inTag = true;
      currentTag = '';
      formattedHtml += char;
      continue;
    }
    
    // End of tag
    if (char === '>' && inTag) {
      inTag = false;
      formattedHtml += char;
      
      // Don't indent for inline tags
      if (!inlineTags.has(currentTag.toLowerCase())) {
        formattedHtml += '\n';
        
        // Check if it's a self-closing tag
        const isSelfClosing = lastChar === '/' || currentTag.toLowerCase() === 'br' || currentTag.toLowerCase() === 'hr';
        
        if (!isSelfClosing) indentLevel++;
        formattedHtml += indent.repeat(indentLevel);
      }
      
      inContent = true;
      continue;
    }
    
    // Closing tag
    if (i < html.length - 1 && char === '<' && html[i + 1] === '/') {
      if (inContent) {
        inContent = false;
      }
      
      // Extract the tag name
      let j = i + 2;
      let closingTag = '';
      while (j < html.length && html[j] !== '>') {
        closingTag += html[j];
        j++;
      }
      closingTag = closingTag.trim();
      
      // Don't indent for inline tags
      if (!inlineTags.has(closingTag.toLowerCase())) {
        indentLevel--;
        formattedHtml = formattedHtml.trimEnd();
        formattedHtml += '\n' + indent.repeat(indentLevel);
      }
      
      inTag = true;
      formattedHtml += char;
      continue;
    }
    
    // Collect tag name
    if (inTag && char !== ' ' && char !== '\t' && char !== '\n' && char !== '\r' && char !== '/') {
      currentTag += char;
    }
    
    formattedHtml += char;
    lastChar = char;
  }
  
  return formattedHtml;
}

/**
 * Basic HTML syntax highlighting
 */
export function highlightHtml(code: string): string {
  // Handle HTML entities first
  let result = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  // Style for tags
  result = result.replace(/&lt;(\/?[\w-]+)([^&]*?)(\/??)&gt;/g, '<span class="text-blue-600">&lt;$1</span><span class="text-green-600">$2</span><span class="text-blue-600">$3&gt;</span>');
  
  // Style for attributes
  result = result.replace(/(\s+[\w-]+)=/g, '<span class="text-purple-600">$1</span>=');
  
  // Style for attribute values
  result = result.replace(/=(".*?")/g, '=<span class="text-amber-600">$1</span>');
  
  // Style for comments
  result = result.replace(/&lt;!--(.+?)--&gt;/g, '<span class="text-gray-500">&lt;!--$1--&gt;</span>');
  
  return result;
}
