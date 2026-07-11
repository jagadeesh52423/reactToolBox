# textCompare → Diffchecker Parity + Enhancements — Design

> Read-only design doc. Turn Batches A/B/C into implementation tasks.
> Codebase ethos: minimal diff, no needless deps, reuse existing infra
> (custom diff algorithm, `useFileIO`, Strategy pattern). Prefer native/existing over new libraries.

## 1. Current Capabilities (from code)

**Entry:** `page.tsx` → `TextDiffViewer.tsx` (orchestrator).

**Architecture (extension-friendly):**
- `ITextDiffAlgorithm` (Strategy) → `LineDiffAlgorithm` (only impl).
- `TextCompareService` (Facade) coordinates line-diff + `WordDiffProcessor`.
- `useTextCompare` hook = state/business logic; `useLocalStorage` persists left/right text.
- Focused components: `TextInputPanel`, `CompareControls`, `DiffStatisticsDisplay`, `DiffResultDisplay`, `DiffLineDisplay`, `UnifiedDiffDisplay`; util `unifiedDiffRows.ts`.

**Inputs:**
- Two panels via shared `CodeEditor` — a **custom textarea + line-number gutter, NOT Monaco** (Monaco dep exists in the repo but this tool does not use it).
- Per-panel live counter: "N lines, M characters".
- Seeded with sample left/right text; persisted to localStorage.

**Options:** `ignoreWhitespace` (per-line `trim()`), `ignoreCase` (`toLowerCase()`). `contextLines` exists in `DiffOptions` model but is **unused**.

**Diff engine:**
- Line diff: normalize `\r\n?`→`\n`, trim common prefix/suffix, LCS DP + backtrack on the middle, group contiguous del/ins runs into aligned CHANGED pairs (+ leftover REMOVED/ADDED with PLACEHOLDER rows). Guard: `MAX_LCS_CELLS = 1_000_000`; over cap → positional fallback + `notice`.
- Word diff: `WordDiffProcessor` LCS over tokens (`/(\s+|[^\w\s])/`), backtrack → unchanged/changed spans. Applied only to CHANGED line pairs.

**Output / views:**
- Side-by-side (Original | Modified) with per-line bg by type + word-level highlight on changed lines.
- Unified (GitHub-style) via `buildUnifiedDiffRows` — old/new gutters, +/-/space marker, word highlight; CHANGED → removed+added row pair.
- View toggle side-by-side ↔ unified (no recompute).
- Amber `notice` banner on fallback. Color legend.

**Stats:** similarity %, added, removed, modified, unchanged, total left/right lines.

**Actions:** Compare (manual trigger), Swap, Reset, Export (single **.txt** report only).

**Dead code:** `utils/diffUtils.ts` — self-contained duplicate of the algorithm, **imported nowhere**. Delete.

## 2. Diffchecker.com Text-Diff Feature Set (normal user)

Feature list only (no proprietary text copied). Free = web Basic; Pro/paid noted.

| Feature | Tier |
|---|---|
| Real-time diff as you type | Free |
| Side-by-side + unified/inline toggle | Free |
| Line numbers | Free |
| Word- and character-level granularity (auto) | Free |
| Diff statistics (added/removed lines) | Free |
| Ignore whitespace | Free |
| Ignore custom text/regex | Free/Pro |
| Collapse/expand unchanged (context fold) | Free |
| Search within the diff | Free |
| Swap sides, copy, clear | Free |
| File upload + drag-and-drop | Free |
| Diff merge / combine to a result | Free (basic) |
| Syntax highlighting (20+ languages) | Free |
| Dark mode | Free |
| Save / shareable link | Free (login) |
| Export to PDF | Pro |
| Offline desktop, AI diff summary, Redline/PDF redline | Pro/paid |

Sources: https://www.diffchecker.com/pro-features/ , https://www.diffchecker.com/pricing/ , https://www.diffchecker.com/

## 3. Gap Analysis (parity textCompare LACKS)

1. **Real-time diff** — currently gated behind a "Compare" button.
2. **Collapse/expand unchanged lines** (`contextLines` modeled but unused).
3. **Character-level granularity** — only word-level exists.
4. **Copy / Clear per pane** and **copy the diff**.
5. **File upload + drag-and-drop** — `useFileIO.uploadFile` exists but isn't wired in.
6. **Search within the diff** (find + highlight + next/prev).
7. **Syntax highlighting** — custom CodeEditor has none (Monaco unused).
8. **Ignore custom text/regex**; whitespace granularity (leading/trailing/all).
9. **Diff-only filter** (show changes only) — subset of collapse.
10. **Merge/combine to a result** (basic 3-way-ish resolve).
11. **Shareable link / save.**
12. **Export beyond .txt** (PDF is Pro on diffchecker; we can do md/html/patch free).

## 4. Enhancements Beyond Diffchecker (proposed, not padding)

- **E1 Structure-aware diff modes** via the Strategy registry: JSON-normalized diff (stable key order) — new `ITextDiffAlgorithm`, zero edits to existing algo. Cross-links naturally to the app's existing `jsonCompare`.
- **E2 Keyboard hunk navigation** — `n`/`p` jump between change hunks; "3 of 12 changes".
- **E3 Change minimap** — scrollbar-side markers of add/remove/change density; click to jump.
- **E4 Diff-only filter** — one-click hide all unchanged (reuses collapse infra).
- **E5 Export to Markdown / HTML / unified `.diff` patch** — `downloadFile` already exists; currently only .txt.
- **E6 Shareable URL-encoded diff** — compress both texts into the URL hash using **native `CompressionStream` (gzip) + base64url**, no dependency; guard by size, fall back to "too large to share".
- **E7 Moved-block detection** — mark relocated (not add/remove) lines.
- **E8 Per-hunk copy** buttons.
- **E9 Semantic word-diff cleanup** — merge tiny common runs so edits read as coherent phrases ("semantic cleanup", implemented natively).

## 5. Ranked Implementation Plan

Effort: S ≤ half day · M ~1 day · L multi-day. "Touch" = existing files unless "NEW".

### Batch A — Parity must-haves

**A1. Real-time diff (debounced)** · parity · **M**
Spec: recompute on text/option change (debounce ~250ms); drop or demote the manual Compare button.
Touch: `useTextCompare.ts` (effect + debounce, unify recompute path), `TextDiffViewer.tsx`, `CompareControls.tsx`.
FLAG [D1] Auto-diff vs keep button. Recommend auto + guard: above a size threshold, pause auto and show a manual "Compare" affordance (reuses the existing `MAX_LCS_CELLS` fallback philosophy).

**A2. Collapse/expand unchanged lines** · parity · **M**
Spec: fold runs of unchanged lines > `contextLines` (default 3) into an expandable "N unchanged lines" row; per-fold expand + expand-all.
Touch: NEW `utils/collapseRows.ts` (works on side-by-side pairs and unified rows), `DiffResultDisplay.tsx`, `UnifiedDiffDisplay.tsx`, `unifiedDiffRows.ts`, add a context-lines control to `CompareControls.tsx`. Activates the already-modeled `contextLines`.

**A3. Character-level granularity toggle** · parity · **S-M**
Spec: word ↔ character inline granularity. Reuse the LCS in `WordDiffProcessor` with a char tokenizer.
Touch: `WordDiffProcessor.ts` (add `mode: 'word'|'char'`, split by `''` for char), `TextCompareService.ts`, `DiffModels.ts` (`DiffOptions.granularity`), `CompareControls.tsx`, display components pass-through.
FLAG [D5] Default granularity (recommend word).

**A4. Copy / Clear per pane + Copy diff** · parity · **S**
Spec: copy/clear icons on each `TextInputPanel`; "Copy diff" on the result (reuse the existing .txt report builder → clipboard).
Touch: `TextInputPanel.tsx` (needs `onClear` + clipboard), `TextDiffViewer.tsx`, `DiffResultDisplay.tsx`. Clipboard via `navigator.clipboard`.

**A5. File upload + drag-and-drop into panes** · parity · **S-M**
Spec: "Upload" button + drop target per pane → replace pane text.
Touch: `TextInputPanel.tsx` (dragover/drop + button), `TextDiffViewer.tsx`. Reuses `useFileIO.uploadFile` (already present) for the button path; add drop handling.

(Line numbers OK, side-by-side+unified OK, stats OK, ignore ws/case OK, swap OK — already at parity.)

### Batch B — Parity nice-to-haves

**B1. Search within the diff** · parity · **M**
Spec: find bar, highlight matches, next/prev + count, optional scope to changes.
Touch: NEW `hooks/useDiffSearch.ts`, `DiffResultDisplay.tsx`, `UnifiedDiffDisplay.tsx`. Native string/regex match; no dep.

**B2. Ignore custom text/regex + whitespace granularity** · parity · **S-M**
Spec: ignore-pattern field (applied in preprocess); whitespace mode leading/trailing/all/none.
Touch: `DiffModels.ts` (`DiffOptions`), `LineDiffAlgorithm.ts` (`preprocessLines`/`linesEqual`), `CompareControls.tsx`.

**B3. Diff-only filter (show changes only)** · parity · **S** (after A2)
Spec: toggle to collapse ALL unchanged. Reuses A2 with `contextLines = 0`.
Touch: `CompareControls.tsx`, collapse util.

**B4. Syntax highlighting** · parity · **L** · FLAG [D2]
Options: (a) swap inputs+diff to **Monaco DiffEditor** (`@monaco-editor/react` already in deps) — richest, but replaces the custom design and the bespoke diff engine, heavy; (b) lightweight token highlighter (e.g. Prism) layered over current spans — new dep; (c) **defer for v1**. Recommend (c) defer, or offer (a) as an optional alternate "code view" rather than the default, so the current lightweight design stays intact.

### Batch C — Enhancements

**C1. Keyboard hunk navigation (n/p) + jump** · enhancement · **M**
Touch: NEW `hooks/useHunkNav.ts`, `DiffResultDisplay.tsx`/`UnifiedDiffDisplay.tsx` (refs + scrollIntoView), small "x of N" indicator.

**C2. Change minimap** · enhancement · **M**
Touch: NEW `components/DiffMinimap.tsx` + wiring in `DiffResultDisplay.tsx`. Pure CSS/DOM, no dep.

**C3. JSON / structure-aware diff mode** · enhancement · **L** · FLAG [D4]
Spec: new `JsonDiffAlgorithm implements ITextDiffAlgorithm`, self-registers; normalizes (stable key order) then reuses line diff. Zero edits to existing algorithms (Open/Closed). Mode selector in controls.
Touch: NEW `algorithms/JsonDiffAlgorithm.ts` + a tiny registry (`algorithms/registry.ts`), `TextCompareService.ts` (accept algorithm by key), `CompareControls.tsx`. Decision: build here vs deep-link to existing `jsonCompare` tool.

**C4. Export to Markdown / HTML / unified `.diff` patch** · enhancement · **S-M**
Touch: NEW `utils/exporters.ts`, `TextDiffViewer.tsx` (export menu). Reuses `useFileIO.downloadFile`.

**C5. Shareable URL-encoded diff** · enhancement · **M** · FLAG [D3]
Spec: encode both texts into URL hash via native `CompressionStream('gzip')` + base64url; load on mount; size-cap with graceful fallback. No dependency.
Touch: NEW `utils/shareLink.ts`, `useTextCompare.ts` (hydrate from hash), `TextDiffViewer.tsx` (Share button).

**C6. Moved-block detection** · enhancement · **L**
Touch: NEW `algorithms/movedBlocks.ts` (post-process ops), model `DiffType.MOVED`, display components.

**C7. Per-hunk copy** · enhancement · **S** (after A2 hunking)
Touch: `DiffResultDisplay.tsx`/`UnifiedDiffDisplay.tsx`.

**C8. Semantic word-diff cleanup** · enhancement · **S**
Touch: `WordDiffProcessor.ts` (merge sub-threshold common runs).

**Chore. Delete `utils/diffUtils.ts`** · **S** — dead code.

## 6. Decisions for User — RESOLVED (2026-07-11)

- **[D1] Real-time vs button** → **AUTO-DIFF (debounced) + large-input guard** reverting to manual. (Baked into A1.)
- **[D2] Syntax highlighting** → **DEFER.** Drop B4 from scope; keep the lightweight custom editor. Revisit later if desired.
- **[D3] Shareable URL** → **YES, native `CompressionStream`** + size cap, no dep. (Applies to C5.)
- **[D4] JSON/structure diff** → **LINK OUT to jsonCompare.** Do NOT build an in-tool JSON algorithm (C3 dropped). Instead add a small hint/link in textCompare pointing to the dedicated jsonCompare tool (trivial, S).
- **[D5] Default inline granularity** → **WORD.** (Baked into A3.)

### Net scope change
- **B4 (syntax highlighting): CUT.**
- **C3 (in-tool JSON mode): CUT** → replaced by a tiny "for JSON, use jsonCompare →" link (S).
- Everything else stands: Batch A (in progress), Batch B = B1 search / B2 ignore-regex+ws-granularity / B3 diff-only, Batch C = C1 hunk-nav / C2 minimap / C4 export / C5 share-URL / C6 moved-blocks / C7 per-hunk-copy / C8 semantic-cleanup + the jsonCompare link.

## 7. Suggested Sequencing

Batch A (real-time, collapse, char-level, copy/clear, upload) delivers ~90% of perceived diffchecker parity with no new deps. Then Batch B (search, ignore-regex, diff-only) closes parity; defer B4 syntax highlighting pending [D2]. Batch C differentiates. Do the `diffUtils.ts` deletion anytime.
