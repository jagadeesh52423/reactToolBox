# Text Case Converter - Refactored Architecture

## Overview
This module has been refactored following **SOLID principles** and **design patterns** to create a maintainable, extensible, and testable codebase.

## Architecture

### Design Patterns Used

1. **Strategy Pattern**
   - Each text case conversion is implemented as a separate strategy
   - All strategies implement the `ITextCaseStrategy` interface
   - Allows easy addition of new case types without modifying existing code

2. **Factory Pattern**
   - `TextCaseStrategyFactory` creates and manages strategy instances
   - Implements Singleton pattern to ensure single factory instance
   - Uses caching to avoid recreating strategy instances

3. **Service Layer Pattern**
   - `TextCaseService` encapsulates business logic
   - Provides a clean API for the UI layer
   - Coordinates between strategies and handles text statistics

4. **Custom Hook Pattern**
   - `useTextCaseConverter` separates state management from UI
   - Encapsulates all business logic interactions
   - Makes components simpler and more testable

## Directory Structure

```
textCase/
├── components/           # UI Components (Presentation Layer)
│   ├── TextCaseConverter.tsx    # Main orchestrator component
│   ├── CaseSelector.tsx         # Case type selection
│   ├── TextInput.tsx            # Input text area
│   ├── TextOutput.tsx           # Output display
│   ├── QuickExamples.tsx        # Examples display
│   └── Notification.tsx         # Toast notifications
│
├── strategies/          # Strategy Pattern Implementation
│   ├── ITextCaseStrategy.ts     # Strategy interface
│   ├── BaseTextCaseStrategy.ts  # Abstract base class
│   ├── UpperCaseStrategy.ts     # Individual strategies...
│   ├── LowerCaseStrategy.ts
│   ├── TitleCaseStrategy.ts
│   ├── CamelCaseStrategy.ts
│   └── ... (13 strategies total)
│
├── factories/           # Factory Pattern
│   └── TextCaseStrategyFactory.ts
│
├── services/            # Business Logic Layer
│   └── TextCaseService.ts
│
├── models/              # Type Definitions
│   └── TextCaseType.ts
│
├── hooks/               # React Custom Hooks
│   └── useTextCaseConverter.ts
│
└── page.tsx             # Next.js page component
```

## SOLID Principles Applied

### Single Responsibility Principle (SRP)
- Each strategy handles ONE specific case conversion
- Each component has ONE specific UI responsibility
- Service layer handles only business logic
- Factory handles only object creation

### Open/Closed Principle (OCP)
- Easy to add new case types by creating new strategy classes
- No need to modify existing strategies or factory
- Extension through inheritance and composition

### Liskov Substitution Principle (LSP)
- All strategies can be used interchangeably through `ITextCaseStrategy`
- Base class provides common functionality
- Derived classes can substitute base class without breaking functionality

### Interface Segregation Principle (ISP)
- `ITextCaseStrategy` interface is focused and minimal
- Components receive only the props they need
- No component depends on methods it doesn't use

### Dependency Inversion Principle (DIP)
- Components depend on `useTextCaseConverter` hook (abstraction)
- Service depends on `ITextCaseStrategy` interface (abstraction)
- No direct dependencies on concrete implementations

## How to Add a New Case Type

1. Create a new strategy class:
```typescript
// strategies/MyNewCaseStrategy.ts
import { BaseTextCaseStrategy } from './BaseTextCaseStrategy';

export class MyNewCaseStrategy extends BaseTextCaseStrategy {
  constructor() {
    super('My New Case', 'ExAmPlE', 'Description of the case');
  }

  convert(text: string): string {
    // Implement your conversion logic
    return text;
  }
}
```

2. Add to the factory:
```typescript
// factories/TextCaseStrategyFactory.ts
import { MyNewCaseStrategy } from '../strategies/MyNewCaseStrategy';

// In initializeStrategies():
this.strategyCache.set(TextCaseType.MY_NEW_CASE, new MyNewCaseStrategy());
```

3. Add to the enum:
```typescript
// models/TextCaseType.ts
export enum TextCaseType {
  // ... existing types
  MY_NEW_CASE = 'myNewCase',
}
```

That's it! The UI will automatically pick it up.

## Benefits of This Architecture

### Maintainability
- Clear separation of concerns
- Each file has a single, well-defined purpose
- Easy to locate and fix bugs

### Extensibility
- Adding new features doesn't require changing existing code
- New case types can be added without touching the UI
- New UI components can be added independently

### Testability
- Each strategy can be tested in isolation
- Service layer can be tested independently
- Components can be tested with mocked hooks

### Reusability
- Strategies can be reused in other parts of the application
- Service can be used in different UI contexts
- Components are modular and composable

## Testing Strategy

### Unit Tests
- Test each strategy independently
- Test service methods
- Test hook behavior

### Integration Tests
- Test factory creates correct strategies
- Test service coordinates strategies correctly

### Component Tests
- Test component rendering
- Test user interactions
- Test with mocked hooks

## Performance Considerations

1. **Strategy Caching**: Factory caches strategy instances to avoid recreation
2. **Memoization**: Hook uses `useMemo` for expensive calculations
3. **Callback Optimization**: Uses `useCallback` to prevent unnecessary re-renders

## Migration from Old Code

The old implementation had:
- A single large switch statement
- Business logic mixed with UI
- Hard to test and extend

The new implementation provides:
- Same functionality with better architecture
- No breaking changes to the UI
- Easier to maintain and extend

## Future Enhancements

Potential improvements:
1. Add undo/redo functionality using Command pattern
2. Add text transformation history
3. Add batch conversion for multiple texts
4. Add custom case type definitions
5. Add import/export of conversion presets
