# Code Review — JSON Visualizer Redesign

## Status: NEEDS_REVISION

## Summary
The redesign is architecturally sound — clean hook extraction, CSS variables, Monaco integration, and command palette are all well-structured. However, there are **3 critical prop-threading bugs** that mean add-node and keyboard navigation features are completely non-functional, plus undo/redo won't visually update the tree. The build passes because TypeScript allows optional props to be omitted.

---

## Issues Found

### Critical

#### C1. `onAdd`, `focusedPath`, `onFocusChange` NOT passed from JsonViewerPanel to JsonTreeView
**File:** `components/JsonViewerPanel.tsx:159-165`

The panel receives these props (lines 39-41) but never forwards them to `<JsonTreeView>`:
```tsx
// Current (broken):
<JsonTreeView
    ref={ref}
    data={parsedJson}
    searchOptions={searchOptions}
    onDelete={onDelete}
    onUpdate={onUpdate}
/>
```

**Cross-file value trace:**
- Producer: `JsonVisualizerRefactored.tsx:134-136` — passes `onAdd={handleAdd}`, `focusedPath`, `onFocusChange`
- Relay: `JsonViewerPanel.tsx:39-41` — receives them
- Consumer: `JsonViewerPanel.tsx:159-165` — **DROPS THEM** (not passed to JsonTreeView)
- Match: **NO** — all three props are silently lost

**Impact:** The "+" add-node button never appears in the tree. Keyboard arrow navigation has no visible focus indicator. Both features are dead.

**Fix:** Add the missing props to the JsonTreeView render:
```tsx
<JsonTreeView
    ref={ref}
    data={parsedJson}
    searchOptions={searchOptions}
    onDelete={onDelete}
    onUpdate={onUpdate}
    focusedPath={focusedPath}
    onFocusChange={onFocusChange}
    onAdd={onAdd}
/>
```

---

#### C2. `handleAdd` does not update `parsedJson` state — tree goes stale after add
**File:** `hooks/useJsonVisualizer.ts:571-582`

Compare with `handleDelete` (line 531) and `handleUpdate` (line 553) which both call `setParsedJson(result.data)`. `handleAdd` only calls `setJsonInput(newJson)` but never `setParsedJson`:

```tsx
// handleAdd (BROKEN — missing setParsedJson):
const newJson = JSON.stringify(result.data, null, indentLevel);
history.pushState(newJson, `add ${key}`);
setJsonInput(newJson);  // updates text editor only
// setParsedJson(result.data) is MISSING — tree stays stale

// handleDelete (correct pattern):
setParsedJson(result.data);  // updates tree
setJsonInput(newJson);       // updates text editor
```

**Impact:** After adding a node, the tree view won't reflect the change. The text editor will show the new JSON, but the visual tree remains unchanged until the user manually edits the text.

**Fix:** Add `setParsedJson(result.data)` before `setJsonInput(newJson)` in `handleAdd`, and use `parserService.stringify` instead of `JSON.stringify` for consistency.

---

#### C3. `handleUndo` and `handleRedo` do not update `parsedJson` — tree doesn't reflect undo/redo
**File:** `hooks/useJsonVisualizer.ts:588-602`

Both handlers call `setJsonInput(prev)` but never re-parse or set `parsedJson`:

```tsx
const handleUndo = useCallback(() => {
    const prev = history.undo();
    if (prev !== null) {
        setJsonInput(prev);  // only updates text, not the tree
        // missing: re-parse and setParsedJson
    }
}, [history, showToast]);
```

**Impact:** After undo/redo, the text editor shows the previous JSON but the tree view stays at the current state.

**Fix:** After `setJsonInput(prev)`, add:
```tsx
const result = parserService.parse(prev);
if (result.success) {
    setParsedJson(result.data);
    setError(null);
}
```

---

### Major

#### M1. `handleAdd` uses `JSON.stringify` instead of `parserService.stringify`
**File:** `hooks/useJsonVisualizer.ts:575`

```tsx
// handleAdd:
const newJson = JSON.stringify(result.data, null, indentLevel);

// handleDelete and handleUpdate:
const newJson = parserService.stringify(result.data, indentLevel);
```

Inconsistency means `handleAdd` bypasses any formatting logic in `parserService.stringify`. Fix: use `parserService.stringify` like the other handlers.

---

#### M2. `JsonMutationService.add` uses different cloning than `update`/`delete`
**File:** `services/JsonMutationService.ts:226`

```tsx
// add() uses:
const cloned = JSON.parse(JSON.stringify(data));

// update() and delete() use:
const cloned = this.parserService.deepClone(data);
```

`JSON.parse(JSON.stringify())` will fail silently on `undefined` values and doesn't handle special objects. Use `parserService.deepClone` for consistency.

---

#### M3. `SearchControlsProps` and `JsonPrimitiveEditorProps` in models are stale
**File:** `models/JsonModels.ts:304-317`

The model defines:
- `JsonPrimitiveEditorProps` without `searchOptions` (line 304-308)
- `SearchControlsProps` with `onSearch` callback (line 313-317)

But the actual components define their own local interfaces with different shapes. These model types are dead code that will mislead anyone reading `JsonModels.ts`. Either update them to match reality or remove them.

---

### Minor

#### m1. `console.error` left in JsonTreeView
**File:** `components/JsonTreeView.tsx:83`
```tsx
console.error('Error expanding child:', error);
```
Remove or replace with proper error handling.

---

#### m2. MonacoJsonEditor dark mode detection is static
**File:** `components/MonacoJsonEditor.tsx:100-101`
```tsx
const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
```
Evaluates once per render. If the user toggles dark mode, Monaco won't switch themes until an unrelated state change causes a re-render. Consider using a `MutationObserver` or a dark-mode context.

---

#### m3. SearchControls declares many unused props
**File:** `components/SearchControls.tsx:6-18`

The interface declares 8 callback props (`onSearchTextChange`, `onSearchLevelChange`, `onFilterToggle`, `onFuzzyToggle`, `onCaseSensitiveToggle`, `onRegexToggle`, `onKeysOnlyToggle`, `onSearch`) but the component body (line 20-24) only destructures `searchOptions`, `matchCount`, and `onOpenPalette`. The rest are dead params. Clean up the interface.

---

#### m4. `closeContextMenu` in JsonTreeView not memoized
**File:** `components/JsonTreeView.tsx:214-216`

`closeContextMenu` is a plain function recreated every render. It's passed to `ContextMenu` which uses it in a `useEffect` dependency (ContextMenu.tsx:54), causing event listeners to be re-attached on every render.

**Fix:** Wrap in `useCallback`:
```tsx
const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }));
}, []);
```

---

#### m5. `copySubtree` timeout not cleared on unmount
**File:** `components/JsonTreeView.tsx:179`
```tsx
setTimeout(() => setShowCopied(false), 1500);
```
If the component unmounts before 1500ms, this sets state on an unmounted component. Store the timeout ref and clear in cleanup.

---

## Cross-File Value Trace Results

| Producer | Consumer | Value | Match |
|----------|----------|-------|-------|
| `JsonVisualizerRefactored.tsx:134` `onAdd={handleAdd}` | `JsonViewerPanel.tsx:159-165` JsonTreeView render | `onAdd` prop | **NO** — dropped |
| `JsonVisualizerRefactored.tsx:135` `focusedPath={...}` | `JsonViewerPanel.tsx:159-165` JsonTreeView render | `focusedPath` prop | **NO** — dropped |
| `JsonVisualizerRefactored.tsx:136` `onFocusChange={...}` | `JsonViewerPanel.tsx:159-165` JsonTreeView render | `onFocusChange` prop | **NO** — dropped |
| `useJsonVisualizer.ts:571` `mutationService.add(...)` | `JsonMutationService.ts:224` `add(data, parentPath, key, value)` | Method signature | YES |
| `CommandPalette.tsx:62` `onSearchTextChange(...)` | `useJsonVisualizer.ts:361` `handleSearchTextChange` | Search text flow | YES |
| `StatusBar.tsx:24` `canUndo/canRedo/onUndo/onRedo` | `JsonVisualizerRefactored.tsx:143-151` props | Undo/redo props | YES |
| `useHistory.ts:8-9` `undo()/redo()` return type | `useJsonVisualizer.ts:589,597` expected `string \| null` | Return type | YES |

---

## Revision Instructions

### Must fix (blocking):
1. **`JsonViewerPanel.tsx`** — Pass `focusedPath`, `onFocusChange`, and `onAdd` to `<JsonTreeView>`
2. **`useJsonVisualizer.ts` `handleAdd`** — Add `setParsedJson(result.data)` and use `parserService.stringify`
3. **`useJsonVisualizer.ts` `handleUndo`/`handleRedo`** — Re-parse the restored JSON and call `setParsedJson`

### Should fix:
4. **`JsonMutationService.ts` `add()`** — Use `parserService.deepClone` instead of `JSON.parse(JSON.stringify())`
5. **`JsonTreeView.tsx`** — Remove `console.error` on line 83
6. **`JsonModels.ts`** — Update or remove stale `SearchControlsProps` and `JsonPrimitiveEditorProps`

### Nice to fix:
7. Memoize `closeContextMenu` in JsonTreeView
8. Clean up unused props in SearchControls interface
9. Clear `showCopied` timeout on unmount in JsonTreeView

---

**Review Complete**
