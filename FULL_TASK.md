# React ToolBox - Improvement Tasks

## Status Legend
- [ ] Pending
- [x] Completed
- [~] In Progress

---

## 1. Shared Infrastructure

- [x] **1.1 Consolidate duplicate Icons** — Merge Icons.tsx from jsonVisualizer, jsonCompare, textUtilities, htmlFormatter into `components/shared/Icons.tsx`
- [x] **1.2 Shared ToastNotification** — Extract duplicate toast from jsonVisualizer and htmlFormatter into a shared component
- [x] **1.3 Fix duplicate PanelHeader** — TextTransformer defines its own PanelHeader; switch to shared `components/common/PanelHeader.tsx`
- [x] **1.4 CSS variable for layout height** — Replace magic `h-[calc(100vh-140px)]` across all tools with a CSS variable or flex layout

## 2. Code Quality

- [x] **2.1 Remove unused Monaco dependency** — `@monaco-editor/react` is in package.json but unused; remove it or upgrade CodeEditor to use it
- [x] **2.2 Replace hand-rolled YAML parser** — CSV Converter's custom yamlParser.ts fails on complex YAML; use `js-yaml` library
- [x] **2.3 Consistent import/export across tools** — Some tools support file import/export, others don't; standardize the pattern

## 3. Navigation & UX

- [x] **3.1 Rename svgEditor route to mermaidEditor** — Route `/svgEditor` is misleading for a Mermaid-specific editor
- [x] **3.2 Clean up orphaned pages** — Remove or integrate `/diceGame` and `/about` placeholder pages
- [x] **3.3 Add sidebar search/filter** — With 14+ tools, a quick filter would help discoverability
- [x] **3.4 Show tool descriptions in sidebar** — Description field exists but is never displayed; add tooltips or subtitles
- [x] **3.5 Improve home page** — Add tool categories, search, or featured tools instead of a plain grid

## 4. Features

- [x] **4.1 localStorage persistence for tool state** — Preserve user input when navigating between tools
- [x] **4.2 Keyboard shortcuts** — Add common shortcuts (Ctrl+Enter to run, Ctrl+S to save, etc.)
- [x] **4.3 URL sharing / deep linking** — Encode tool state in URL params for sharing
- [x] **4.4 Extend Cron Parser** — Support 6-field (seconds) and 7-field (year) cron expressions

## 5. Mermaid Editor Enhancements

- [x] **5.0 Mermaid Syntax Highlighting** — Add syntax highlighting overlay to the code editor for Mermaid keywords, arrows, node shapes, labels, and comments
- [x] **5.1 Mermaid Theme Switcher** — Add a dropdown to switch between Mermaid built-in themes (default, dark, forest, neutral, base) with persistence
- [x] **5.2 Advanced Themes with Gradients** — Add 17 professional themes (built-in, professional, gradient, dark) with gradient color support via post-render SVG injection

## 6. New Tools (Future)

- [ ] **5.1 HTTP Request Builder / cURL converter**
- [ ] **5.2 JSON Schema Validator**
- [ ] **5.3 JWT Decoder**
- [ ] **5.4 Hash Generator (MD5, SHA-1, SHA-256)**
- [ ] **5.5 URL Parser / Builder**

---

## Progress Tracker

| Section | Total | Done | Remaining |
|---------|-------|------|-----------|
| 1. Shared Infrastructure | 4 | 4 | 0 |
| 2. Code Quality | 3 | 3 | 0 |
| 3. Navigation & UX | 5 | 5 | 0 |
| 4. Features | 4 | 4 | 0 |
| 5. Mermaid Editor | 2 | 2 | 0 |
| 6. New Tools | 5 | 0 | 5 |
| **Total** | **23** | **18** | **5** |
