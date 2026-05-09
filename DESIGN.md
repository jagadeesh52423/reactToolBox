# DESIGN: React ToolBox Improvements (Sections 1-4)

> 16 improvement tasks across shared infrastructure, code quality, navigation/UX, and features.

---

## Section 1: Shared Infrastructure

### 1.1 Consolidate Duplicate Icons

**Current State:**
- `src/components/shared/Icons.tsx` — 39 icons (canonical source)
- `src/app/jsonCompare/components/Icons.tsx` — re-exports 20 icons from shared
- `src/app/jsonVisualizer/components/Icons.tsx` — re-exports 31 icons from shared
- `src/app/htmlFormatter/components/Icons.tsx` — re-exports 14 icons from shared
- `src/app/textUtilities/components/Icons.tsx` — **INDEPENDENT** file, 12 icons with different SVG paths (TextIcon, CopyIcon, ClipboardIcon, TrashIcon, CheckIcon, HomeIcon, CaseUpperIcon, WandIcon, LinkIcon, HashIcon, SparklesIcon, ReplaceIcon)

**Approach:**
1. Merge textUtilities' unique icons (CaseUpperIcon, WandIcon, LinkIcon, ReplaceIcon, CopyIcon, TextIcon) into `src/components/shared/Icons.tsx`
2. Delete all 4 per-tool Icons.tsx wrapper files
3. Update all imports in tool components to import directly from `@/components/shared/Icons`

**Files to modify:**
- `src/components/shared/Icons.tsx` — add 6 new icons from textUtilities
- `src/app/textUtilities/components/Icons.tsx` — DELETE
- `src/app/jsonCompare/components/Icons.tsx` — DELETE
- `src/app/jsonVisualizer/components/Icons.tsx` — DELETE
- `src/app/htmlFormatter/components/Icons.tsx` — DELETE
- All files importing from these local Icons — update import paths

**Risk:** Low. Re-export wrappers are trivial. textUtilities icons may have slightly different SVGs — keep the textUtilities versions for icons with the same name but different design.

---

### 1.2 Shared ToastNotification

**Current State:**
- `src/app/jsonVisualizer/components/ToastNotification.tsx` — uses enum ToastType from JsonModels, default export
- `src/app/htmlFormatter/components/ToastNotification.tsx` — uses string literals ('success', 'error'), named export

**Approach:**
1. Create `src/components/common/ToastNotification.tsx` with a generic interface:
```tsx
export interface ToastConfig {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export default function ToastNotification({ toast, onClose }: {
  toast: ToastConfig | null;
  onClose: () => void;
}) { ... }
```
2. Create `src/hooks/useToast.ts` custom hook:
```tsx
export function useToast() {
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const showToast = (message: string, type: ToastConfig['type'] = 'success') => { ... };
  return { toast, showToast, clearToast };
}
```
3. Update jsonVisualizer and htmlFormatter to use shared component
4. Other tools can adopt it as needed

**Files to create:**
- `src/components/common/ToastNotification.tsx`
- `src/hooks/useToast.ts`

**Files to modify:**
- `src/app/jsonVisualizer/components/ToastNotification.tsx` — DELETE
- `src/app/htmlFormatter/components/ToastNotification.tsx` — DELETE
- Components importing the old ToastNotification — update imports

**Risk:** Low. Functionally identical rendering logic.

---

### 1.3 Fix Duplicate PanelHeader in TextTransformer

**Current State:**
TextTransformer.tsx (line ~133) defines a local PanelHeader component inline. The shared `src/components/common/PanelHeader.tsx` has the same design but uses `children` prop instead of `actions` prop.

**Approach:**
1. Remove the local PanelHeader from TextTransformer.tsx
2. Import shared PanelHeader: `import PanelHeader from '@/components/common/PanelHeader'`
3. Replace `actions` prop usage with `children` (they're equivalent)

**Files to modify:**
- `src/app/textUtilities/components/TextTransformer.tsx` — remove local PanelHeader, import shared

**Risk:** Very low. The shared PanelHeader accepts `children` instead of `actions` — same pattern.

---

### 1.4 CSS Variable for Layout Height

**Current State:**
15 files use `h-[calc(100vh-140px)]` as a magic number. If header/footer height changes, all 15 must be updated.

**Approach:**
1. Add CSS custom property in `globals.css`:
```css
:root {
  --tool-content-height: calc(100vh - 140px);
}
```
2. Replace all 15 occurrences with `h-[var(--tool-content-height)]`

**Files to modify:**
- `src/app/globals.css` — add CSS variable
- All 15 tool files listed in analysis — replace height value

**Risk:** Very low. Pure CSS variable substitution.

---

## Section 2: Code Quality

### 2.1 Remove Unused Monaco Dependency

**Current State:**
`@monaco-editor/react` ^4.7.0 is in package.json but never imported anywhere. The CodeEditor uses a plain textarea.

**Approach:**
Remove from package.json dependencies.

```bash
npm uninstall @monaco-editor/react
```

**Files to modify:**
- `package.json` — remove dependency

**Risk:** None. Confirmed zero imports.

---

### 2.2 Replace Hand-Rolled YAML Parser

**Current State:**
`src/app/csvConverter/utils/yamlParser.ts` is a 155-line custom parser that only handles sequences of flat mappings. No multi-line values, anchors, tags, flow style, or nested structures.

**Approach:**
1. Install js-yaml: `npm install js-yaml && npm install -D @types/js-yaml`
2. Rewrite yamlParser.ts to use js-yaml internally while keeping the same `ParsedData` interface
3. Keep `serializeYAML` using js-yaml's `dump()` function

```tsx
import yaml from 'js-yaml';
import type { ParsedData } from './csvParser';

export function parseYAML(text: string): ParsedData {
  const parsed = yaml.load(text);
  // Convert to ParsedData format (extract headers from keys, rows from values)
  ...
}

export function serializeYAML(data: ParsedData): string {
  const items = data.rows.map(row => {
    const obj: Record<string, string> = {};
    data.headers.forEach(h => { obj[h] = row[h] ?? ''; });
    return obj;
  });
  return yaml.dump(items);
}
```

**Files to modify:**
- `package.json` — add js-yaml dependency
- `src/app/csvConverter/utils/yamlParser.ts` — rewrite using js-yaml

**Risk:** Low. The ParsedData interface stays the same. Edge case: js-yaml may parse numbers/booleans differently than the string-only custom parser — ensure all values are stringified.

---

### 2.3 Consistent Import/Export Across Tools

**Current State:**
- Tools WITH import: JSON Visualizer, Mermaid Editor, Base64
- Tools WITH export: JSON Visualizer, Mermaid Editor, CSV Converter, HTML Formatter, Markdown Preview, Text Utilities (partial)
- Tools WITHOUT either: JSON Compare, Text Compare, Color Picker, Regex Tester, Cron Parser, UUID Generator, Timestamp Converter

**Approach:**
1. Create `src/hooks/useFileIO.ts`:
```tsx
export function useFileIO() {
  const downloadFile = (content: string, filename: string, mimeType?: string) => { ... };
  const uploadFile = (accept: string): Promise<string> => { ... };
  return { downloadFile, uploadFile };
}
```
2. Add download buttons to tools that produce output but lack export:
   - JSON Compare → download diff result
   - Text Compare → download diff result
   - Regex Tester → download match results
   - Cron Parser → download schedule description
   - UUID Generator → already has copy-all, add download
   - Timestamp Converter → download conversions

**Files to create:**
- `src/hooks/useFileIO.ts`

**Files to modify:**
- Tool components that need import/export buttons added

**Risk:** Low. Additive feature — no existing behavior changes.

---

## Section 3: Navigation & UX

### 3.1 Rename svgEditor to mermaidEditor

**Approach:**
1. Rename directory: `src/app/svgEditor/` → `src/app/mermaidEditor/`
2. Update ToolsNavigation.tsx path from `/svgEditor` to `/mermaidEditor`
3. Update home page tool list
4. Add a redirect page at the old path for bookmarks

**Files to modify:**
- `src/app/svgEditor/` — rename entire directory to `src/app/mermaidEditor/`
- `src/components/ToolsNavigation.tsx` — update path
- `src/app/page.tsx` — update path if tools are listed there
- Create `src/app/svgEditor/page.tsx` as redirect to `/mermaidEditor`

**Risk:** Low. Only internal references need updating.

---

### 3.2 Clean Up Orphaned Pages

**Approach:**
1. Delete `src/app/diceGame/` directory entirely
2. Delete `src/app/about/` directory entirely
3. Verify no other files reference these paths

**Files to delete:**
- `src/app/diceGame/page.tsx`
- `src/app/about/page.tsx`

**Risk:** None. These pages aren't linked from anywhere in the app navigation.

---

### 3.3 Sidebar Search/Filter

**Approach:**
Add a search input at the top of the sidebar in ToolsNavigation.tsx that filters tools by name as user types.

```tsx
const [search, setSearch] = useState('');
const filteredTools = tools.filter(t =>
  t.name.toLowerCase().includes(search.toLowerCase()) ||
  t.description.toLowerCase().includes(search.toLowerCase())
);
```

**Files to modify:**
- `src/components/ToolsNavigation.tsx` — add search input and filter logic

**Risk:** None. Additive UI feature.

---

### 3.4 Show Tool Descriptions in Sidebar

**Current State:**
ToolsNavigation.tsx stores a `description` field per tool but only shows it on the home page grid view.

**Approach:**
Add a title attribute (tooltip) on each sidebar tool link:

```tsx
<Link href={tool.path} title={tool.description}>
  ...
</Link>
```

**Files to modify:**
- `src/components/ToolsNavigation.tsx` — add title attribute to tool links

**Risk:** None.

---

### 3.5 Improve Home Page

**Current State:**
`src/app/page.tsx` shows a flat grid of all tools.

**Approach:**
1. Group tools into categories:
   - **Data & JSON**: JSON Visualizer, JSON Compare, CSV Converter
   - **Text**: Text Compare, Text Utilities, Markdown Preview
   - **Web & Code**: HTML Formatter, Regex Tester, Base64 Codec
   - **Design & Visual**: Color Picker, Mermaid Editor
   - **Utilities**: Cron Parser, UUID Generator, Timestamp Converter
2. Add a search bar at the top that filters across all categories
3. Keep the tool card design but add category section headers

**Files to modify:**
- `src/app/page.tsx` — add categories, search, section headers
- `src/components/ToolsNavigation.tsx` — add category data to tool definitions

**Risk:** Low. Visual-only change to home page.

---

## Section 4: Features

### 4.1 localStorage Persistence for Tool State

**Approach:**
1. Create `src/hooks/useLocalStorage.ts`:
```tsx
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [stored, setStored] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });
  const setValue = (value: T) => {
    setStored(value);
    window.localStorage.setItem(key, JSON.stringify(value));
  };
  return [stored, setValue];
}
```
2. Apply to tools with text input (JSON Visualizer, Text Compare, Regex Tester, Markdown Preview, etc.)
3. Use tool-specific keys: `reactToolBox_jsonVisualizer_input`, etc.

**Files to create:**
- `src/hooks/useLocalStorage.ts`

**Files to modify:**
- Key tool components to use useLocalStorage for their input state

**Risk:** Low. Need to handle SSR (check `typeof window`). Don't persist huge data (>1MB).

---

### 4.2 Keyboard Shortcuts

**Approach:**
1. Create `src/hooks/useKeyboardShortcut.ts`:
```tsx
export function useKeyboardShortcut(key: string, ctrl: boolean, callback: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (ctrl && (e.ctrlKey || e.metaKey) && e.key === key) {
        e.preventDefault();
        callback();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, ctrl, callback]);
}
```
2. Common shortcuts:
   - `Ctrl+Enter` — Run/Execute/Convert (per tool)
   - `Ctrl+L` — Clear input
   - `Ctrl+K` — Focus sidebar search (global)
3. Add a keyboard shortcut hint in the UI (small text below action buttons)

**Files to create:**
- `src/hooks/useKeyboardShortcut.ts`

**Files to modify:**
- Tool components to register shortcuts
- `src/components/ToolsNavigation.tsx` — Ctrl+K to focus search

**Risk:** Low. Must avoid conflicting with browser defaults.

---

### 4.3 URL Sharing / Deep Linking

**Approach:**
1. Use Next.js `useSearchParams` to read/write URL params
2. Apply to tools where state is shareable:
   - Regex Tester: `?pattern=...&flags=...&test=...`
   - Cron Parser: `?expr=...`
   - Timestamp Converter: `?ts=...`
   - Base64: `?input=...&mode=encode|decode`
3. Create `src/hooks/useUrlState.ts`:
```tsx
export function useUrlState(key: string, defaultValue: string) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const value = searchParams.get(key) ?? defaultValue;
  const setValue = (newValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, newValue);
    router.replace(`?${params.toString()}`, { scroll: false });
  };
  return [value, setValue] as const;
}
```

**Files to create:**
- `src/hooks/useUrlState.ts`

**Files to modify:**
- Selected tool components

**Risk:** Medium. Large input strings in URLs can hit length limits. Use compression or truncation for large inputs. Don't put JSON blobs in URLs.

---

### 4.4 Extend Cron Parser

**Current State:**
Only supports 5-field standard cron (minute hour dayOfMonth month dayOfWeek). No named values (MON, JAN), no seconds, no year field.

**Approach:**
1. Add auto-detection: if 6 fields → seconds prefix; if 7 fields → seconds + year suffix
2. Extend `parseCronExpression` to handle 5/6/7 fields
3. Add named day/month support (MON-SUN, JAN-DEC) — convert to numbers before parsing
4. Update `generateDescription` to include seconds/year
5. Update `getNextRuns` to factor in seconds
6. Update the interactive builder UI to show optional seconds/year fields

**Files to modify:**
- `src/app/cronParser/utils/cronUtils.ts` — extend parser
- `src/app/cronParser/components/CronParserTool.tsx` — UI for 6/7 field mode
- `src/app/cronParser/components/CronInputPanel.tsx` — field selector
- `src/app/cronParser/components/CronPresets.tsx` — add 6-field presets

**Risk:** Medium. Must maintain backward compatibility with existing 5-field expressions.

---

## Execution Order & Dependencies

### Dependency Graph
```
1.1 (Icons) ─────────┐
1.2 (Toast) ──────────┤
1.3 (PanelHeader) ────┤── All independent, can run in parallel
1.4 (CSS Height) ─────┤
2.1 (Monaco) ─────────┤
2.2 (YAML) ───────────┤
3.1 (Route Rename) ───┤
3.2 (Orphan Cleanup) ─┘
                       │
3.3 (Sidebar Search) ──┐── Depends on 3.1/3.2 being done (navigation changes)
3.4 (Tooltips) ────────┘
                       │
3.5 (Home Page) ───────── Depends on 3.1/3.2 (updated tool paths/categories)
                       │
2.3 (File IO) ─────────── Independent but nice to have hooks from 4.1 first
4.1 (localStorage) ────┐
4.2 (Shortcuts) ───────┤── Independent hooks, can run in parallel
4.3 (URL Sharing) ─────┘
                       │
4.4 (Cron Extension) ──── Independent, can run anytime
```

### Recommended Execution Phases

**Phase 1 (Parallel — Infrastructure & Cleanup):**
- 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 3.1, 3.2

**Phase 2 (Parallel — Navigation & Hooks):**
- 3.3, 3.4, 3.5, 4.1, 4.2

**Phase 3 (Sequential — Integration):**
- 2.3, 4.3, 4.4
