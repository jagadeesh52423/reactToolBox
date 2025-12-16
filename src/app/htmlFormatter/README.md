# HTML Formatter - Refactored Architecture

## Overview
This module has been refactored from a monolithic, procedural implementation into a properly architected solution following **SOLID principles** and **design patterns**.

## Issues Fixed

### Before Refactoring:
1. ❌ **200+ line monolithic function** with mixed responsibilities
2. ❌ **Complex nested helper functions** hard to test
3. ❌ **Hard-coded tag lists** not extensible
4. ❌ **Poor error handling** with generic alerts
5. ❌ **No separation of concerns** - parsing, formatting, highlighting mixed
6. ❌ **Tight coupling** - hard to test independently
7. ❌ **No design patterns** - just procedural code

### After Refactoring:
1. ✅ **Modular architecture** with clear separation of concerns
2. ✅ **Testable components** - each class has single responsibility
3. ✅ **Configurable tag definitions** - extensible via Singleton config
4. ✅ **Proper error handling** with user-friendly messages
5. ✅ **Strategy pattern** for formatters and highlighters
6. ✅ **Service layer** for business logic
7. ✅ **SOLID principles** throughout

## Architecture

### Design Patterns Used

1. **Strategy Pattern**
   - `IHTMLFormatter` - Interface for different formatting strategies
   - `StandardHTMLFormatter` - Standard indentation strategy
   - `IHTMLHighlighter` - Interface for syntax highlighting strategies
   - `BasicHTMLHighlighter` - Regex-based highlighting strategy
   - Easy to add new formatters (compact, expanded, etc.)

2. **Singleton Pattern**
   - `HTMLTagConfig` - Centralized configuration for tag properties
   - Ensures consistent tag classification across the application

3. **Facade Pattern**
   - `HTMLFormattingService` - Simple interface hiding complex subsystems
   - Coordinates between Tokenizer, Formatter, and Highlighter

4. **Service Layer Pattern**
   - `HTMLFormattingService` - Encapsulates all business logic
   - Separates business rules from UI components

5. **Custom Hook Pattern**
   - `useHTMLFormatter` - Separates state management from UI
   - Provides clean API for components

## Directory Structure

```
htmlFormatter/
├── models/                  # Type Definitions
│   └── HTMLToken.ts        # Token types, enums, interfaces
│
├── config/                  # Configuration
│   └── HTMLTagConfig.ts    # Tag classification (Singleton)
│
├── parsers/                 # Parsing Logic
│   └── HTMLTokenizer.ts    # Converts HTML to tokens
│
├── formatters/              # Formatting Strategies
│   ├── IHTMLFormatter.ts   # Formatter interface
│   └── StandardHTMLFormatter.ts
│
├── highlighters/            # Highlighting Strategies
│   ├── IHTMLHighlighter.ts
│   └── BasicHTMLHighlighter.ts
│
├── services/                # Business Logic
│   └── HTMLFormattingService.ts
│
├── hooks/                   # React Hooks
│   └── useHTMLFormatter.ts
│
├── components/              # UI Components
│   ├── HtmlFormatterTool.tsx (refactored main)
│   ├── HTMLInput.tsx
│   ├── HTMLOutput.tsx
│   ├── FormatControls.tsx
│   ├── ErrorDisplay.tsx
│   └── Notification.tsx
│
└── page.tsx                 # Next.js page
```

## SOLID Principles Applied

### Single Responsibility Principle (SRP)
- **HTMLTokenizer**: Only tokenizes HTML
- **StandardHTMLFormatter**: Only formats tokens
- **BasicHTMLHighlighter**: Only highlights syntax
- **HTMLFormattingService**: Only coordinates formatting operations
- **Each UI component**: Has one specific UI responsibility

### Open/Closed Principle (OCP)
- Easy to add new formatters by implementing `IHTMLFormatter`
- Easy to add new highlighters by implementing `IHTMLHighlighter`
- Can extend tag configuration without modifying existing code
- No need to modify existing classes when adding new features

### Liskov Substitution Principle (LSP)
- All formatters can be used interchangeably through `IHTMLFormatter`
- All highlighters can be used interchangeably through `IHTMLHighlighter`
- Service works with any formatter/highlighter implementation

### Interface Segregation Principle (ISP)
- `IHTMLFormatter` is minimal and focused
- `IHTMLHighlighter` is minimal and focused
- Components receive only the props they need
- No component depends on unused methods

### Dependency Inversion Principle (DIP)
- Service depends on `IHTMLFormatter` and `IHTMLHighlighter` interfaces
- Components depend on the `useHTMLFormatter` hook (abstraction)
- No direct dependencies on concrete implementations

## How It Works

### Processing Flow

1. **Input**: User enters HTML
2. **Tokenization**: `HTMLTokenizer` parses HTML into structured tokens
3. **Classification**: `HTMLTagConfig` classifies each tag (block/inline/self-closing)
4. **Formatting**: `StandardHTMLFormatter` applies indentation rules
5. **Highlighting**: `BasicHTMLHighlighter` adds syntax colors
6. **Output**: Formatted and highlighted HTML displayed to user

### Token Model

```typescript
interface HTMLToken {
  type: TokenType;           // TAG_OPEN, TAG_CLOSE, TEXT, etc.
  content: string;           // Raw HTML content
  tagName?: string;          // Extracted tag name
  attributes?: string;       // Tag attributes
  displayType?: TagDisplayType; // BLOCK, INLINE, SELF_CLOSING
}
```

## How to Extend

### Adding a New Formatter

```typescript
// formatters/CompactHTMLFormatter.ts
import { IHTMLFormatter } from './IHTMLFormatter';

export class CompactHTMLFormatter implements IHTMLFormatter {
  getName(): string {
    return 'Compact Formatter';
  }

  format(tokens: HTMLToken[], options: FormatOptions): string {
    // Implement compact formatting logic
    // (e.g., minimal whitespace, one-line where possible)
    return compactedHTML;
  }
}

// Use it:
const service = new HTMLFormattingService(new CompactHTMLFormatter());
```

### Adding a New Highlighter

```typescript
// highlighters/PrismHTMLHighlighter.ts
import { IHTMLHighlighter } from './IHTMLHighlighter';

export class PrismHTMLHighlighter implements IHTMLHighlighter {
  getName(): string {
    return 'Prism Highlighter';
  }

  highlight(html: string): string {
    // Use Prism.js or another library
    return highlightedHTML;
  }
}

// Use it:
const service = new HTMLFormattingService(
  undefined,
  new PrismHTMLHighlighter()
);
```

### Adding Custom Tags

```typescript
const tagConfig = HTMLTagConfig.getInstance();
tagConfig.addInlineTag('my-custom-inline');
tagConfig.addBlockTag('my-custom-block');
```

## Features

### Tokenization
- Parses HTML into structured tokens
- Handles DOCTYPE, comments, tags, and text
- Extracts tag names and attributes
- Classifies display types

### Formatting
- Proper indentation for block elements
- Inline element handling
- Self-closing tag recognition
- Preserves meaningful content structure
- Configurable indent size (2, 4, 6, 8 spaces)

### Syntax Highlighting
- Color-coded tags (blue)
- Highlighted attributes (purple)
- Highlighted attribute values (green)
- Comments styling (gray)
- DOCTYPE styling (purple, bold)

### Validation
- Basic HTML structure validation
- Tag matching verification
- Unclosed tag detection
- User-friendly error messages

### Statistics
- Character count
- Line count
- Tag count
- Token count

## Performance Considerations

1. **Singleton Pattern**: TagConfig instance created once and reused
2. **Memoization**: Hook uses `useMemo` for expensive calculations
3. **Token Caching**: Tokens generated once per format operation
4. **Efficient Regex**: Optimized patterns for syntax highlighting

## Testing Strategy

### Unit Tests
- Test `HTMLTokenizer` with various HTML inputs
- Test `StandardHTMLFormatter` with different token arrays
- Test `BasicHTMLHighlighter` with formatted HTML
- Test `HTMLTagConfig` tag classification methods

### Integration Tests
- Test `HTMLFormattingService` end-to-end
- Test formatter + highlighter combinations
- Test error handling paths

### Component Tests
- Test UI components with mocked hook
- Test user interactions
- Test error display
- Test notifications

## Migration from Old Code

### Breaking Changes
None - The UI and API remain the same for end users.

### Internal Changes
- Replaced single `formatHtml()` function with modular architecture
- Replaced `highlightHtml()` function with strategy-based highlighter
- Added proper error handling and validation
- Improved testability and maintainability

## Future Enhancements

Potential improvements:
1. Add more formatter strategies (Compact, Expanded, Minify)
2. Add advanced highlighter using Prism.js or highlight.js
3. Add HTML minification option
4. Add beautification presets (Google, Airbnb, etc.)
5. Add live preview option
6. Add file import/export
7. Add undo/redo using Command pattern
8. Add diff view for before/after comparison
