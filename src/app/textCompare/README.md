# Text Compare - Refactored Architecture

## Overview
This module has been refactored from a monolithic component into a properly architected solution following **SOLID principles** and **design patterns**.

## Issues Fixed

### Before Refactoring:
1. ❌ **Monolithic component** - 157 lines mixing UI, logic, and rendering
2. ❌ **Mixed concerns** - diff computation, rendering, and state management all in one place
3. ❌ **Procedural algorithms** - not encapsulated in classes
4. ❌ **Hard to extend** - adding new diff algorithms requires modifying existing code
5. ❌ **No design patterns** - just functional/procedural code
6. ❌ **Limited features** - no statistics, options, swap functionality

### After Refactoring:
1. ✅ **Modular architecture** with clear separation of concerns
2. ✅ **Strategy pattern** for diff algorithms
3. ✅ **Encapsulated algorithms** in dedicated classes
4. ✅ **Service layer** for business logic
5. ✅ **SOLID principles** throughout
6. ✅ **Enhanced features** - statistics, options, swap, reset

## Architecture

### Design Patterns Used

1. **Strategy Pattern**
   - `ITextDiffAlgorithm` - Interface for diff algorithms
   - `LineDiffAlgorithm` - Line-by-line diff with look-ahead
   - Easy to add new algorithms (character-level, Myers diff, etc.)

2. **Service Layer Pattern**
   - `TextCompareService` - Encapsulates all business logic
   - Coordinates between algorithms and provides clean API
   - Separates business rules from UI

3. **Custom Hook Pattern**
   - `useTextCompare` - Separates state management from UI
   - Provides clean API for components
   - Handles all business logic interactions

4. **Single Responsibility Principle**
   - Each component has one focused purpose
   - Each algorithm handles one specific task
   - Clear boundaries between layers

## Directory Structure

```
textCompare/
├── models/                  # Type Definitions
│   └── DiffModels.ts       # Enums, interfaces, types
│
├── algorithms/              # Diff Algorithms (Strategy Pattern)
│   ├── ITextDiffAlgorithm.ts
│   ├── LineDiffAlgorithm.ts
│   └── WordDiffProcessor.ts (LCS-based word diff)
│
├── services/                # Business Logic
│   └── TextCompareService.ts
│
├── hooks/                   # React Hooks
│   └── useTextCompare.ts
│
├── components/              # UI Components
│   ├── TextDiffViewer.tsx (refactored main - 99 lines vs 157)
│   ├── TextInputPanel.tsx
│   ├── CompareControls.tsx
│   ├── DiffStatisticsDisplay.tsx
│   ├── DiffResultDisplay.tsx
│   └── DiffLineDisplay.tsx
│
└── page.tsx                 # Next.js page
```

## SOLID Principles Applied

### Single Responsibility Principle (SRP)
- **LineDiffAlgorithm**: Only computes line-level diffs
- **WordDiffProcessor**: Only computes word-level diffs
- **TextCompareService**: Only coordinates diff operations
- **Each UI component**: Has one specific display responsibility

### Open/Closed Principle (OCP)
- Easy to add new diff algorithms by implementing `ITextDiffAlgorithm`
- Can extend with new features without modifying existing code
- Service accepts any algorithm that implements the interface

### Liskov Substitution Principle (LSP)
- All diff algorithms can be used interchangeably through `ITextDiffAlgorithm`
- Service works with any algorithm implementation

### Interface Segregation Principle (ISP)
- `ITextDiffAlgorithm` is minimal and focused
- Components receive only the props they need
- No component depends on unused methods

### Dependency Inversion Principle (DIP)
- Service depends on `ITextDiffAlgorithm` interface (abstraction)
- Components depend on the `useTextCompare` hook (abstraction)
- No direct dependencies on concrete implementations

## How It Works

### Processing Flow

1. **Input**: User enters two texts
2. **Options**: User selects options (ignore whitespace/case)
3. **Algorithm**: `LineDiffAlgorithm` computes line-level diff with look-ahead
4. **Word Diff**: `WordDiffProcessor` uses LCS for word-level highlights
5. **Statistics**: Service calculates similarity and change counts
6. **Display**: Components render results with proper styling

### Algorithms

#### Line Diff Algorithm
```typescript
// Uses look-ahead to detect insertions vs modifications
Time Complexity: O(n + m) where n, m are number of lines
Space Complexity: O(n + m) for result storage
```

#### Word Diff Processor (LCS)
```typescript
// Longest Common Subsequence using dynamic programming
Time Complexity: O(n * m) where n, m are number of words
Space Complexity: O(n * m) for DP table
```

## Features

### Core Features
- Line-by-line comparison with look-ahead optimization
- Word-level diff highlighting using LCS algorithm
- Smart detection of additions, removals, and modifications
- Line numbers for easy reference

### Options
- **Ignore Whitespace**: Trims spaces before comparison
- **Ignore Case**: Case-insensitive comparison
- Dynamic re-comparison when options change

### Statistics
- **Similarity percentage**: 0-100%
- **Lines added**: Count of new lines
- **Lines removed**: Count of deleted lines
- **Lines modified**: Count of changed lines
- Total line counts for both texts

### Controls
- **Compare**: Compute and display diff
- **Swap**: Exchange left and right texts
- **Reset**: Clear both texts and results

### Visual Features
- Color-coded differences:
  - 🟢 Green: Added lines
  - 🔴 Red: Removed lines
  - 🟡 Yellow: Modified lines
  - 🟡 Dark Yellow: Word-level changes
- Scrollable panels for large texts
- Responsive layout (mobile-friendly)
- Clear legend explaining colors

## How to Extend

### Adding a New Diff Algorithm

```typescript
// algorithms/CharacterDiffAlgorithm.ts
import { ITextDiffAlgorithm } from './ITextDiffAlgorithm';

export class CharacterDiffAlgorithm implements ITextDiffAlgorithm {
  getName(): string {
    return 'Character-by-Character Diff';
  }

  getDescription(): string {
    return 'Compares text character by character';
  }

  computeDiff(leftText: string, rightText: string, options?: DiffOptions): DiffResult {
    // Implement character-level diff logic
    return result;
  }
}

// Use it:
const service = new TextCompareService(new CharacterDiffAlgorithm());
```

### Adding New Options

```typescript
// models/DiffModels.ts
export interface DiffOptions {
  ignoreWhitespace?: boolean;
  ignoreCase?: boolean;
  contextLines?: number;        // NEW: Show N lines of context
  ignoreLineEndings?: boolean;  // NEW: Normalize line endings
}
```

## Performance Considerations

1. **Line Diff**: O(n + m) linear time complexity
2. **Word Diff**: O(n * m) for LCS, computed only for changed lines
3. **Memoization**: Hook uses React's useMemo for expensive calculations
4. **Lazy Computation**: Word diff computed only when needed
5. **Efficient Re-renders**: Components re-render only when their data changes

## Benefits

### Maintainability
- Clear separation of concerns
- Each class/component has one purpose
- Easy to locate and fix bugs

### Extensibility
- Add new algorithms without modifying existing code
- Add new options without breaking existing features
- Add new UI components independently

### Testability
- Each algorithm can be tested in isolation
- Service can be tested independently
- Components can be tested with mocked hooks

### Performance
- Optimized algorithms with proper complexity
- Smart look-ahead reduces unnecessary comparisons
- Word diff computed only for changed lines

## Migration from Old Code

### Breaking Changes
None - The UI and behavior remain the same for end users.

### Internal Changes
- Replaced monolithic component with modular architecture
- Moved algorithms to dedicated classes
- Added proper TypeScript types throughout
- Improved code organization and readability

## Future Enhancements

Potential improvements:
1. Add more diff algorithms (Myers diff, character-level, etc.)
2. Add file upload/download support
3. Add unified diff format export
4. Add side-by-side vs unified view toggle
5. Add search/filter in diff results
6. Add undo/redo using Command pattern
7. Add diff merging capabilities
8. Add syntax highlighting for code diffs
