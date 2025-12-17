# JSON Visualizer

Interactive JSON viewer and editor with advanced search capabilities.

## Features

- **Parse & Validate** - Real-time JSON parsing with error highlighting
- **Tree View** - Interactive, collapsible tree visualization
- **Search** - Exact and fuzzy search with level filtering
- **Filter Mode** - Hide non-matching nodes during search
- **Inline Editing** - Click to edit primitive values
- **Delete Nodes** - Remove any node from the tree
- **Copy Operations** - Copy subtrees or paths to clipboard
- **Import/Export** - Load and save JSON files
- **Prettify** - Format with configurable indentation (2, 4, 6, 8 spaces)
- **Toast Notifications** - User feedback without blocking dialogs

## Architecture

```
jsonVisualizer/
├── models/
│   └── JsonModels.ts           # Types, interfaces, enums
├── strategies/
│   ├── ISearchStrategy.ts      # Search strategy interface
│   ├── ExactSearchStrategy.ts  # Exact substring matching
│   ├── FuzzySearchStrategy.ts  # Fuzzy character sequence matching
│   └── index.ts                # Strategy exports and factory
├── services/
│   ├── JsonParserService.ts    # Parsing, validation, formatting
│   ├── JsonSearchService.ts    # Search with strategy pattern
│   ├── JsonMutationService.ts  # Update and delete operations
│   └── index.ts                # Service exports
├── hooks/
│   └── useJsonVisualizer.ts    # React state management
├── components/
│   ├── JsonVisualizerRefactored.tsx  # Main orchestrator
│   ├── JsonInputPanel.tsx      # Left panel (input, buttons)
│   ├── JsonViewerPanel.tsx     # Right panel (tree, search)
│   ├── JsonTreeView.tsx        # Recursive tree component
│   ├── JsonPrimitiveEditor.tsx # Primitive value editing
│   ├── SearchControls.tsx      # Search input and options
│   ├── PrettifyDropdown.tsx    # Prettify options dropdown
│   └── ToastNotification.tsx   # Toast notifications
├── page.tsx                    # Page wrapper
└── README.md                   # This file
```

## Design Patterns

### 1. Strategy Pattern (Search)
Different search algorithms that can be swapped at runtime.

```typescript
interface ISearchStrategy {
    name: string;
    matches(pattern: string, target: string): boolean;
    getMatchPositions(pattern: string, target: string): [number, number][];
}

// Implementations
class ExactSearchStrategy implements ISearchStrategy { ... }
class FuzzySearchStrategy implements ISearchStrategy { ... }

// Factory
function getSearchStrategy(isFuzzy: boolean): ISearchStrategy {
    return isFuzzy ? getFuzzySearchStrategy() : getExactSearchStrategy();
}
```

### 2. Service Layer Pattern
Business logic separated from UI components.

- **JsonParserService** - Parsing, validation, formatting, type detection
- **JsonSearchService** - Coordinates search using strategies
- **JsonMutationService** - Handles update/delete with immutability

### 3. Singleton Pattern
Services use singleton instances for consistent behavior.

```typescript
class JsonParserService {
    private static instance: JsonParserService | null = null;

    static getInstance(): JsonParserService {
        if (!JsonParserService.instance) {
            JsonParserService.instance = new JsonParserService();
        }
        return JsonParserService.instance;
    }
}
```

### 4. Custom Hook Pattern
All React state and side effects encapsulated in `useJsonVisualizer`.

```typescript
function useJsonVisualizer(options?: UseJsonVisualizerOptions): UseJsonVisualizerReturn {
    // All state management
    // All event handlers
    // All side effects
}
```

### 5. Facade Pattern
Services provide simplified APIs to components.

## SOLID Principles

### Single Responsibility
- Each component has one purpose
- Services handle specific domains
- Strategies implement single algorithms

### Open/Closed
- New search strategies can be added without modifying existing code
- New services can extend functionality

### Liskov Substitution
- All search strategies are interchangeable
- Services can be mocked for testing

### Interface Segregation
- Small, focused interfaces
- Components only receive props they need

### Dependency Inversion
- Components depend on abstractions (interfaces)
- Services injected via hooks

## Key Models

```typescript
// Core JSON type
type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

// Value types with styling
enum JsonValueType {
    STRING, NUMBER, BOOLEAN, NULL, ARRAY, OBJECT, UNKNOWN
}

// Search configuration
interface SearchOptions {
    searchText: string;
    searchLevel?: number;
    isFilterEnabled: boolean;
    isFuzzyEnabled: boolean;
}

// Parse result
interface ParseResult {
    success: boolean;
    data: JSONValue | null;
    error: string | null;
}

// Mutation result (immutable)
interface MutationResult {
    success: boolean;
    data: JSONValue | null;
    error: string | null;
}
```

## Search Algorithms

### Exact Search
- Case-insensitive substring matching
- Time Complexity: O(n*m)
- Returns all match positions for highlighting

### Fuzzy Search
- Characters must appear in order (not consecutive)
- Example: "apl" matches "apple", "application"
- Time Complexity: O(n)
- Merges consecutive positions for clean highlighting

## Component Hierarchy

```
JsonVisualizerRefactored (orchestrator)
├── JsonInputPanel
│   └── PrettifyDropdown
├── JsonViewerPanel
│   ├── SearchControls
│   └── JsonTreeView (recursive)
│       └── JsonPrimitiveEditor
└── ToastNotification
```

## Data Flow

1. User enters JSON text → `handleJsonChange`
2. Parser validates → updates `parsedJson` or `error`
3. Tree renders from `parsedJson`
4. User searches → debounced search triggers
5. Tree nodes check visibility/highlight via SearchService
6. User edits value → MutationService updates immutably
7. Updated data flows back to input and tree

## Files Changed from Original

| Original | Refactored |
|----------|------------|
| page.tsx (454 lines) | page.tsx (31 lines) |
| types.ts (21 lines) | models/JsonModels.ts (264 lines) |
| utils/jsonHelpers.ts (60 lines) | services/* + strategies/* |
| JsonView.tsx (389 lines) | JsonTreeView.tsx (298 lines) |
| PrimitiveValue.tsx (89 lines) | JsonPrimitiveEditor.tsx (103 lines) |

## New Files Created

- `models/JsonModels.ts` - Comprehensive type definitions
- `strategies/ISearchStrategy.ts` - Strategy interface
- `strategies/ExactSearchStrategy.ts` - Exact matching
- `strategies/FuzzySearchStrategy.ts` - Fuzzy matching
- `services/JsonParserService.ts` - Parse/format operations
- `services/JsonSearchService.ts` - Search coordination
- `services/JsonMutationService.ts` - Update/delete operations
- `hooks/useJsonVisualizer.ts` - State management hook
- `components/JsonVisualizerRefactored.tsx` - Main component
- `components/JsonInputPanel.tsx` - Input panel
- `components/JsonViewerPanel.tsx` - Viewer panel
- `components/SearchControls.tsx` - Search UI
- `components/PrettifyDropdown.tsx` - Prettify UI
- `components/ToastNotification.tsx` - Toast UI

## Improvements Over Original

1. **Separation of Concerns** - Logic moved out of components
2. **Testability** - Services can be unit tested independently
3. **Reusability** - Strategies and services reusable across app
4. **Maintainability** - Clear responsibilities and boundaries
5. **Type Safety** - Comprehensive type definitions
6. **UX** - Toast notifications instead of browser dialogs
7. **Extensibility** - Easy to add new search strategies or features
