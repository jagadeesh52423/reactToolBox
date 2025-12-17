'use client';

import JsonVisualizerRefactored from './components/JsonVisualizerRefactored';

/**
 * JSON Visualizer Page
 *
 * Interactive JSON viewer and editor tool.
 *
 * Features:
 * - Parse and validate JSON
 * - Interactive tree view with expand/collapse
 * - Search with exact and fuzzy matching
 * - Filter mode to hide non-matching nodes
 * - Level-based search filtering
 * - Inline editing of primitive values
 * - Delete nodes
 * - Copy subtrees and paths
 * - Import/export JSON files
 * - Prettify with configurable indentation
 *
 * Architecture:
 * - models/     - Type definitions and constants
 * - strategies/ - Search algorithms (Strategy Pattern)
 * - services/   - Business logic (Singleton, Facade)
 * - hooks/      - React state management (Custom Hook)
 * - components/ - UI components (Single Responsibility)
 */
export default function JsonVisualizerPage() {
    return <JsonVisualizerRefactored />;
}
