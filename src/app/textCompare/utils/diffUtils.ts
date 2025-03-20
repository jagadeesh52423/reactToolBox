export interface DiffResult {
  left: Array<{ text: string, type: 'unchanged' | 'removed' | 'changed' }>;
  right: Array<{ text: string, type: 'unchanged' | 'added' | 'changed' }>;
}

export function computeDiff(leftText: string, rightText: string): DiffResult {
  const leftLines = leftText.split('\n');
  const rightLines = rightText.split('\n');
  
  const result: DiffResult = {
    left: [],
    right: []
  };
  
  // Simple diff algorithm that compares lines
  let leftIndex = 0;
  let rightIndex = 0;
  
  while (leftIndex < leftLines.length || rightIndex < rightLines.length) {
    // Both sides have reached the end
    if (leftIndex >= leftLines.length && rightIndex >= rightLines.length) {
      break;
    }
    
    // Left side has reached the end, remaining lines on right are additions
    if (leftIndex >= leftLines.length) {
      result.right.push({ text: rightLines[rightIndex], type: 'added' });
      // Add an empty line on the left side to keep alignment
      result.left.push({ text: '', type: 'unchanged' });
      rightIndex++;
      continue;
    }
    
    // Right side has reached the end, remaining lines on left are removals
    if (rightIndex >= rightLines.length) {
      result.left.push({ text: leftLines[leftIndex], type: 'removed' });
      // Add an empty line on the right side to keep alignment
      result.right.push({ text: '', type: 'unchanged' });
      leftIndex++;
      continue;
    }
    
    const leftLine = leftLines[leftIndex];
    const rightLine = rightLines[rightIndex];
    
    // Lines are the same
    if (leftLine === rightLine) {
      result.left.push({ text: leftLine, type: 'unchanged' });
      result.right.push({ text: rightLine, type: 'unchanged' });
      leftIndex++;
      rightIndex++;
      continue;
    }
    
    // Try to find the current left line in the right text ahead
    const leftLineInRight = rightLines.slice(rightIndex).indexOf(leftLine);
    
    // Try to find the current right line in the left text ahead
    const rightLineInLeft = leftLines.slice(leftIndex).indexOf(rightLine);
    
    // If left line appears later in right, right has added lines
    if (leftLineInRight !== -1 && (rightLineInLeft === -1 || leftLineInRight < rightLineInLeft)) {
      // Add lines that appear in right but not left
      for (let i = 0; i < leftLineInRight; i++) {
        result.right.push({ text: rightLines[rightIndex + i], type: 'added' });
        result.left.push({ text: '', type: 'unchanged' });
      }
      rightIndex += leftLineInRight;
    } 
    // If right line appears later in left, left has removed lines
    else if (rightLineInLeft !== -1 && (leftLineInRight === -1 || rightLineInLeft < leftLineInRight)) {
      // Add lines that appear in left but not right
      for (let i = 0; i < rightLineInLeft; i++) {
        result.left.push({ text: leftLines[leftIndex + i], type: 'removed' });
        result.right.push({ text: '', type: 'unchanged' });
      }
      leftIndex += rightLineInLeft;
    } 
    // The lines are different but not found later - mark as changed
    else {
      result.left.push({ text: leftLine, type: 'changed' });
      result.right.push({ text: rightLine, type: 'changed' });
      leftIndex++;
      rightIndex++;
    }
  }
  
  return result;
}
