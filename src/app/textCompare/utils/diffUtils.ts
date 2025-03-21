export interface DiffLine {
  text: string;
  type: string; // 'added', 'removed', 'unchanged', 'changed'
  lineNumber: number; // Added line number field
}

export interface DiffResult {
  left: DiffLine[];
  right: DiffLine[];
}

export function computeDiff(leftText: string, rightText: string): DiffResult {
  const leftLines = leftText.split('\n');
  const rightLines = rightText.split('\n');
  
  const result: DiffResult = {
    left: [],
    right: []
  };
  
  let i = 0, j = 0;
  
  while (i < leftLines.length || j < rightLines.length) {
    // Both texts have lines remaining
    if (i < leftLines.length && j < rightLines.length) {
      if (leftLines[i] === rightLines[j]) {
        // Lines are identical
        result.left.push({ text: leftLines[i], type: 'unchanged', lineNumber: i + 1 });
        result.right.push({ text: rightLines[j], type: 'unchanged', lineNumber: j + 1 });
        i++;
        j++;
      } else {
        // Lines are different - check if next line matches
        const lookAhead1 = (i + 1 < leftLines.length) && leftLines[i + 1] === rightLines[j];
        const lookAhead2 = (j + 1 < rightLines.length) && leftLines[i] === rightLines[j + 1];
        
        if (lookAhead1) {
          // Left has added a line
          result.left.push({ text: leftLines[i], type: 'removed', lineNumber: i + 1 });
          result.right.push({ text: '', type: 'placeholder', lineNumber: 0 });
          i++;
        } else if (lookAhead2) {
          // Right has added a line
          result.left.push({ text: '', type: 'placeholder', lineNumber: 0 });
          result.right.push({ text: rightLines[j], type: 'added', lineNumber: j + 1 });
          j++;
        } else {
          // Lines are changed
          result.left.push({ text: leftLines[i], type: 'changed', lineNumber: i + 1 });
          result.right.push({ text: rightLines[j], type: 'changed', lineNumber: j + 1 });
          i++;
          j++;
        }
      }
    } 
    // Only left has lines remaining
    else if (i < leftLines.length) {
      result.left.push({ text: leftLines[i], type: 'removed', lineNumber: i + 1 });
      result.right.push({ text: '', type: 'placeholder', lineNumber: 0 });
      i++;
    } 
    // Only right has lines remaining
    else {
      result.left.push({ text: '', type: 'placeholder', lineNumber: 0 });
      result.right.push({ text: rightLines[j], type: 'added', lineNumber: j + 1 });
      j++;
    }
  }
  
  return result;
}
