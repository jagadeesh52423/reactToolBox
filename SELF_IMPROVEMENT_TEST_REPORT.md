## Batch A

Runtime testing, no formal test suite (this project has no test framework). Method: dev server on :3013 for route smoke tests; probe scripts run via `npx tsx` against the actual source modules for deep logic testing, written to `.probes/` (not committed). Findings persisted incrementally as testing proceeds.

### Smoke test — all 16 routes

| Route | HTTP | Notes |
|---|---|---|
| / | 200 | |
| /base64 | 200 | |
| /colorPicker | 200 | |
| /cronParser | 200 | |
| /csvConverter | 200 | |
| /htmlFormatter | 200 | |
| /jsonCompare | 200 | |
| /jsonVisualizer | 200 | |
| /markdownPreview | 200 | |
| /mermaidEditor | 200 | |
| /regexTester | 200 | |
| /svgEditor | 307 → /mermaidEditor | Intentional `redirect()` in page.tsx (confirmed by reading source), not a bug |
| /textCompare | 200 | |
| /textUtilities | 200 | |
| /timestampConverter | 200 | |
| /uuidGenerator | 200 | |

No "Application error" / "Unhandled Runtime Error" / `__next_error__` (non-redirect) markers on any route.

### base64

Probed `.probes/base64.probe.ts` against the exact encode/decode/isValidBase64 logic in `Base64Tool.tsx:60-72`, using Node's native spec-compliant `atob`/`btoa` (not a hand-rolled shim). Covered: ASCII, emoji/unicode roundtrip, empty input, 2M-char large input, invalid-charset decode, invalid-UTF-8-after-valid-base64-decode (e.g. `/w==`, `wIA=`), odd-length base64. All error paths are caught by the existing try/catch and surface a clean error message — no crashes, no hangs even at 2M chars. No failures found.

### cronParser

Probed `.probes/cron.probe.ts` against `cronUtils.ts`. Covered: 5/6/7-field parsing, named months/days, out-of-range fields, negative numbers, malformed ranges, step=0, garbage input, empty/whitespace input, leading/trailing whitespace, Feb 30 (impossible date — terminates cleanly via the 366-day cap, doesn't hang), Feb 29 leap-year-only, DST spring-forward/fall-back under `TZ=America/New_York` (no crash, no duplicate/skipped runs), builder round-trip.

- **Case ID:** A-cronParser-1
  **Tool / file:line:** cronParser — `src/app/cronParser/utils/cronUtils.ts:46-52` (`FIELD_RANGES.dayOfWeek`) and `:173-175` (`validateField`)
  **Repro:** `parseCronExpression('0 0 * * 7')`
  **Expected vs Actual:** Expected: valid, treated as Sunday (POSIX cron spec: `cron(5)` explicitly states "both 0 and 7 are Sunday" — real-world crontabs, e.g. `0 0 * * 7` for a weekly Sunday job, use this form). Actual: rejected with `Invalid Day of week field: "7" (allowed: 0-6)`. A user pasting an existing system crontab line containing a `7` in the day-of-week field gets a false "invalid" error even though the expression is valid and would run correctly under real cron.
  **Severity:** medium (compatibility gap for a class of real, commonly-seen cron expressions; not a crash, but the tool's core value proposition is validating/explaining cron expressions correctly).
  **Status (re-test 2026-07-10):** FIXED — `FIELD_RANGES.dayOfWeek` widened to 0-7 with a `normalizeDayOfWeek()` helper mapping 7→0; confirmed `'0 0 * * 7'` now valid with identical description/schedule to `'0 0 * * 0'`.

- **Case ID:** A-cronParser-2 (confirmed 2026-07-10, filed during re-test per lead's request)
  **Tool / file:line:** cronParser — `src/app/cronParser/utils/cronUtils.ts:301-303` (month branch) and `:315-318` (day-of-week branch) of `generateDescription()`
  **Repro:** `parseCronExpression('0 9 * * 1-5').description` and `parseCronExpression('0 0 1 3-6 *').description`
  **Expected vs Actual:** Expected the description to spell out the full range, e.g. `"...on Mon-Fri"` or `"...on Mon, Tue, Wed, Thu, Fri"`. Actual: `"At 9:00 AM, on Mon"` — the `-Fri` portion is silently dropped. Same pattern for months: `"...in Mar"` instead of covering March through June. Root cause: `field.split(',').map(v => NAMES[parseInt(v, 10)] || v)` assumes comma-separated single values; for a range token like `"1-5"`, `split(',')` yields `["1-5"]` as one element, and `parseInt("1-5", 10)` returns `1` (stops at the first non-digit `-`), so only the range's start value ever resolves to a name and the rest of the range vanishes from the description with no error. This is a description-rendering bug only — `getNextRuns()`'s actual schedule calculation uses `expandField()` (a different, correct code path) and is unaffected; only the human-readable summary text is wrong. Does not affect day-of-month ranges (rendered as raw numbers, no name lookup involved).
  **Severity:** medium — silently wrong/misleading output (not a crash) for a very common pattern (business-hours-on-weekdays expressions using day ranges, or month ranges for seasonal jobs) in a tool whose entire purpose is explaining what a cron expression does; a user reading "on Mon" for a Mon-Fri job could reasonably conclude the expression only runs on Mondays.

### csvConverter

Probed `.probes/csv.probe.ts` against `csvParser.ts`, `jsonToCsv.ts`, `yamlParser.ts`. Covered: quoted fields (embedded delimiter/newline/escaped quotes), unterminated quotes, ragged rows, unicode/emoji, custom delimiters, CSV round-trip, JSON array/object/nested/null inputs, malformed JSON, YAML sequence/mapping/malformed/tab-indentation. CSV parser itself is solid (round-trips correctly, ragged rows pad/truncate sanely, unterminated quotes degrade gracefully by consuming through to EOF rather than crashing).

- **Case ID:** A-csvConverter-1
  **Tool / file:line:** csvConverter — `src/app/csvConverter/utils/jsonToCsv.ts:40-63` (`parseJSON`) and the equivalent array-handling block in `src/app/csvConverter/utils/yamlParser.ts:22-49` (`parseYAML`)
  **Repro:**
  ```
  npx tsx -e "import { parseJSON } from './src/app/csvConverter/utils/jsonToCsv'; console.log(JSON.stringify(parseJSON('[{\"a\":1}, \"loose string\", 42]')))"
  ```
  → `{"headers":["a"],"rows":[{"a":"1"},{"a":""},{"a":""}]}`. Same pattern confirmed for YAML: a sequence mixing a mapping with bare scalars (`- name: Alice\n  age: 30\n- loose string\n- 42`) produces `{"headers":["name","age"],"rows":[{"name":"Alice","age":"30"},{"name":"","age":""},{"name":"","age":""}]}`.
  **Expected vs Actual:** Expected either an error/warning that non-object array items can't be represented in tabular form, or at minimum a visible marker (e.g. a `_value` column) preserving the primitive. Actual: the `"loose string"` and `42` entries are **silently discarded** — headers come only from the object entries, so primitive items become fully empty rows with no error, no warning, and no indication anything was dropped. Confirmed this is NOT caught by the container's existing `if (parsed.headers.length === 0) → 'No data found'` guard in `CsvConverterTool.tsx:68` — that guard only fires when the array is *entirely* non-objects (headers empty); a *mixed* array has non-empty headers and sails through as silent data loss, both in the Code view output and the Table view.
  **Severity:** high (silent, reachable data loss with zero user-facing indication — worse than a crash, since a user converting real-world semi-structured JSON/YAML has no way to know some records vanished. A homogeneous all-primitive array is at least caught by the empty-headers guard and shown as an error; only the mixed case slips through.)
  **Status (re-test 2026-07-10):** FIXED — a `_value` column now preserves primitive array entries for both JSON and YAML input, confirmed with the exact original repro.

- **Case ID:** A-csvConverter-2
  **Tool / file:line:** csvConverter — `src/app/csvConverter/utils/yamlParser.ts:20` (`parseYAML`, uncaught `yaml.load`) vs. `jsonToCsv.ts:20-24` (`parseJSON`, which wraps `JSON.parse` in try/catch with a friendly `'Invalid JSON: ...'` message)
  **Repro:** Malformed YAML input, e.g. `"key: value\n  bad indent: [unclosed"` with inputFormat=yaml.
  **Expected vs Actual:** Expected a consistent, friendly error message matching the JSON path's style. Actual: `parseYAML` doesn't catch its own parse errors, so the raw `js-yaml` `YAMLException` propagates up (it IS caught by `CsvConverterTool.tsx`'s outer try/catch, so there's no crash — the app doesn't error out), but the error text shown to the user is the raw multi-line exception message (e.g. `"bad indentation of a mapping entry (2:13)\n\n key: value\n  bad indent: [unclosed\n ^"` truncated to its first line by the component, since the error is rendered as a single `<p>`). This is inconsistent UX vs. the JSON path and can show a confusing raw parser dump.
  **Severity:** low (no crash — caught upstream; purely a UX/polish inconsistency between the JSON and YAML error paths).
  **Status (re-test 2026-07-10):** FIXED — `parseYAML` now catches its own error and throws `"Invalid YAML: could not parse input"`, matching the JSON path's style.

### htmlFormatter

Probed `.probes/html.probe.ts` plus follow-up ad-hoc `npx tsx -e` scripts against `HTMLTokenizer.ts` / `HTMLFormattingService.ts` / `HTMLValidator.ts`. Covered: attribute values containing `<`/`>`, self-closing non-void elements, `<script>` containing a `</script>`-lookalike inside a JS string, unclosed/mismatched tags, 1000- and 5000-level deep nesting (perf/stack check), comments containing tag-like text, doctype+unicode content, void elements, and a 50,000-word large input (perf check). Deep nesting and large input both complete fast with no hang or stack overflow (1000 levels: 28ms; 5000 levels: 501ms; 50k words: 4ms). Unclosed/mismatched tags are reported correctly and don't crash.

- **Case ID:** A-htmlFormatter-1
  **Tool / file:line:** htmlFormatter — `src/app/htmlFormatter/parsers/HTMLTokenizer.ts:68` (`tokenize`, `const tagEnd = html.indexOf('>', tagStart);`) and `:224` (`extractAttributes`, regex `/<[a-zA-Z][a-zA-Z0-9-]*\s+([^>]*?)\/?>$/i`)
  **Repro:**
  ```
  npx tsx -e "import { HTMLTokenizer } from './src/app/htmlFormatter/parsers/HTMLTokenizer'; console.log(JSON.stringify(new HTMLTokenizer().tokenize('<a title=\"a > b\" href=\"#\">link</a>'), null, 2))"
  ```
  and full-pipeline repro:
  ```
  Input:  <div><a title="a > b" href="/page">link</a><p>next paragraph here</p></div>
  ```
  **Expected vs Actual:** Expected the tag scanner to find the real end of the `<a ...>` tag (i.e. skip over `>` characters inside quoted attribute values — any HTML tokenizer must track quote state). Actual: `tagEnd` is found via a naive `indexOf('>', tagStart)` that stops at the **first** `>`, even when it's inside a quoted attribute value (e.g. `title="a > b"`). This truncates the tag into `<a title="a >` (a token with `tagName: "a"`, `attributes: 'title="a'`) and spills the rest — `b" href="/page">link` — into a bogus TEXT token. Two visible, user-facing symptoms from the full-pipeline repro above:
  1. **Formatting corruption**: the `<p>` tag, which should be its own indented block-level line inside `<div>`, instead gets glued onto the same output line as `</a>` with a stray double-space: `<a title="a > b" href="/page">link</a>  <p>next paragraph here</p>` (single line, wrong nesting/indentation).
  2. **False validator warning**: `HTMLValidator` reports `"<a> missing href attribute"` even though the input clearly has `href="/page"` — because the corrupted `attributes` string (`title="a`) never reaches the real `href=` substring the check looks for.

  Note: for a *simpler* single-tag-only input (no sibling block content after it), the formatter's output can coincidentally look byte-identical to the input, because the formatter mostly concatenates each token's raw `.content` back together — this can mask the bug in a quick spot-check; the corruption only becomes visible once sibling/nested structure or the validator (which inspects the parsed `attributes` field, not raw content) is involved.
  **Severity:** high (any tag with a `>` character inside a quoted attribute value — a fairly common pattern for `title`/`data-*`/`aria-label` attributes containing comparison text like `"score > 90"` or JSON-ish content — silently corrupts both the formatted output structure and produces false validation warnings, with no error surfaced to the user).
  **Status (re-test 2026-07-10):** FIXED — `HTMLTokenizer` now tracks quote state, so tags with `>` inside quoted attribute values tokenize intact; the false "missing href" warning is gone. (The `<p>` line-gluing symptom mentioned above persists, but is a **separate, pre-existing** bug — see A-htmlFormatter-2 below, confirmed to reproduce independently on input with no `>`-in-attribute at all.)

- **Case ID:** A-htmlFormatter-2 (confirmed 2026-07-10, filed during re-test per lead's request)
  **Tool / file:line:** htmlFormatter — `src/app/htmlFormatter/formatters/StandardHTMLFormatter.ts:74-90` (`handleOpenTag`), specifically the `hasOnlyInlineContent` branch: `this.result += this.getIndentation() + token.content;`
  **Repro:** `svc.formatHTML('<div><a href="/page">link</a><p>next paragraph here</p></div>', OPTS)` — clean input, no `>` inside any attribute value.
  **Expected vs Actual:** Expected `<p>next paragraph here</p>` to start on its own indented line inside `<div>`. Actual: `<a href="/page">link</a>  <p>next paragraph here</p>` — the `<p>` (and its content, since it's inline-only) gets appended directly onto whatever line the *previous* sibling left the cursor on, with only a stray double-space separating them, instead of starting fresh. Reproduced with 3 further minimal variations, all gluing the same way: `<span>text</span><p>next</p>`, `<a href="/x">link</a><div>next block</div>`, `<em>hi</em><h2>Heading</h2>`. Root cause: when `handleOpenTag()` determines a block element has only-inline content (so it should stay compact rather than expanding multi-line), it writes `getIndentation() + token.content` straight onto `this.result` with **no leading `\n`** — this branch only makes sense as "keep *this element's own children* inline", but because it never resets to a new line first, it also visually merges with whatever *preceding* sibling content was on the current line. Confirmed via `git diff` this code path was untouched by the A-htmlFormatter-1 fix (different function, different bug).
  **Severity:** medium — every-day formatting-correctness bug (any two adjacent simple elements — a link followed by a paragraph, emphasis followed by a heading — get visually merged), but it degrades output quality/readability rather than corrupting data or causing an error; the "Fix common issues" framing of the tool leads a user to expect clean indentation for exactly this kind of ordinary nested-tag input.

### jsonCompare

Read `JsonComparer.tsx`, `inlineDiff.ts`, `DiffViewer.tsx`, `StructuredDiffViewer.tsx`. `computeInlineDiff` is only invoked (`InlineDiff.tsx:21`, inside a `useMemo`, i.e. synchronously on the render thread) for individual **changed primitive leaf values** — `DiffViewer.tsx:120-125`'s `canInlineDiff` gate excludes objects/arrays, so it's per-string/number/boolean pair, not the whole document. `calculateStats`'s recursive key-diff and `fixCommonJsonIssues`' newline/control-char normalizer were also probed and behave sanely (the latter's "Fix common JSON issues" label is a bit optimistic — see below — but doesn't crash or corrupt).

- **Case ID:** A-jsonCompare-1
  **Tool / file:line:** jsonCompare — `src/app/jsonCompare/utils/inlineDiff.ts:14-24` (`computeLCS`, full `(m+1)×(n+1)` 2D DP table over **tokens**, O(m·n) time and space), invoked synchronously from `src/app/jsonCompare/components/InlineDiff.tsx:18-23` inside `useMemo` on the render thread whenever a `changed` diff row has two primitive (non-object) leaf values.
  **Repro:**
  ```
  npx tsx -e "
  import { computeInlineDiff } from './src/app/jsonCompare/utils/inlineDiff';
  const big1 = JSON.stringify(Array.from({length: 2000}, (_,i)=>({id:i,name:'item'+i,value:Math.random()})), null, 2);
  computeInlineDiff(big1, big1 + ' ');
  "
  ```
  **Expected vs Actual:** Expected the diff to either complete in reasonable time or be bounded/skipped for large values. Actual, measured directly against the real `computeInlineDiff`: quadratic blowup is clearly visible well before the crash — 100-item-equivalent string (7.7KB): 101ms; 300 items (23.6KB): 736ms; 500 items (39.4KB): 3.3s. At 2000 items (~160KB) the process **hits `FATAL ERROR: Ineffective mark-compacts near heap limit — JavaScript heap out of memory` and crashes** before finishing (confirmed by direct run, full V8 OOM crash log captured). Because `canInlineDiff` only requires the two diffed values to be primitives (not objects), this is reachable through completely ordinary usage: comparing two JSON documents where a single leaf **string** field is large — e.g. an embedded HTML/description/base64-image field that differs slightly between left and right, a realistic scenario for a "JSON compare" tool used on real API payloads. Since the call is synchronous inside `useMemo` on the render path, even the sub-crash sizes (tens of KB, ~3s+) freeze the tab's main thread with no loading indicator or cancel option.
  **Severity:** high (reachable via ordinary use — no adversarial input needed, just two moderately-large differing string values at the same path — and the failure mode ranges from a multi-second frozen tab to a full browser-tab/process crash from heap exhaustion).
  **Status (re-test 2026-07-10):** FIXED — common-prefix/suffix stripping plus a `MAX_LCS_CELLS` cap on the remaining middle region. Original repro now completes in 15ms (was: OOM crash). Additionally stress-tested the worst case (no common prefix/suffix at all, up to 5000 "words"/64KB): 0-12ms, cap correctly engages, no hang.

- **Case ID:** A-jsonCompare-2
  **Tool / file:line:** jsonCompare — `src/app/jsonCompare/components/JsonComparer.tsx:93-145` (`fixCommonJsonIssues`), surfaced via the "Format & Fix" button (`title="Fix common JSON issues and format"`)
  **Repro:**
  ```
  npx tsx -e "
  // (fixCommonJsonIssues logic copied inline, see report for full script)
  " 
  ```
  Tested trailing comma (`{"a":1,}`), single-quoted keys (`{'a':1}`), and unquoted keys (`{a:1}`) — all three remain unparseable by `JSON.parse` after `fixCommonJsonIssues` runs.
  **Expected vs Actual:** The button label/tooltip ("Fix common JSON issues and format") implies it repairs typical hand-edited JSON mistakes. Actual: the function only normalizes embedded raw newlines inside string literals and escapes stray control characters — it does **not** handle trailing commas, single-quoted keys/strings, or unquoted keys, which are the most common real-world "common JSON issues." No data loss or crash — `fixAndFormatJson`'s try/catch correctly reports "Cannot fix and format ... Try fixing the JSON manually" when the fix doesn't help — but the feature under-delivers relative to its name for the most common cases users would expect it to solve.
  **Severity:** low (no crash, no data loss, error path works correctly; purely a scope/naming mismatch between the labeled feature and its actual behavior).
  **Status (re-test 2026-07-10):** FIXED — a new `repairLenientJsonSyntax` pass now handles trailing commas, single-quoted keys/strings, and unquoted keys (individually and combined); confirmed well-formed JSON with commas/colons/quotes inside string values is untouched by the new pass.

### jsonVisualizer

Read `JsonParserService.ts`, `JsonMutationService.ts`, `JsonSearchService.ts`, `ExactSearchStrategy.ts`, `FuzzySearchStrategy.ts` in full and probed the mutation service's path handling and the fuzzy strategy's performance on large target strings (up to 20,000 chars — max 15ms, no perf concern since the Levenshtein windowing is bounded by pattern length, not target length). All core services are defensively written (guard against out-of-range array indices, non-object navigation, missing keys) and behaved correctly in every probe. Found one latent issue but confirmed it's **unreachable dead code**: `JsonMutationService.stringToPath`/`pathToString` naively split/join on `.`, which would mis-resolve object keys that literally contain a `.` character — but `grep` confirms these two methods are never called anywhere outside their own definitions in the actual app (the real path-building code pushes keys directly into path arrays during tree traversal, never through string round-tripping), so this has no live user impact. Not reported as a finding per the "confirmed by runtime probe **or reproducible page behavior**" bar — it fails the reachability half even though the probe reproduces the latent bug.

### markdownPreview

- **Case ID:** A-markdownPreview-1
  **Tool / file:line:** markdownPreview — `src/app/markdownPreview/utils/markdownParser.ts:17-24` (`stripScriptTags`, the only sanitization applied) and the render sink at `src/app/markdownPreview/components/PreviewPanel.tsx:50-53` (`dangerouslySetInnerHTML={{ __html: renderedHtml }}`)
  **Repro:** `.probes/markdown.probe.ts`, run via `npx tsx .probes/markdown.probe.ts` — calls the actual exported `parseMarkdown` function with several payloads:
  ```
  parseMarkdown('<img src=x onerror="alert(document.cookie)">')
  → '<img src=x onerror="alert(document.cookie)">'   (passed through verbatim)

  parseMarkdown('<svg onload="alert(1)"></svg>')
  → '<p><svg onload="alert(1)"></svg></p>'            (passed through verbatim)

  parseMarkdown('[click me](javascript:alert(1))')
  → '<p><a href="javascript:alert(1)">click me</a></p>'   (marked.js resolves this as a normal link href, untouched)

  parseMarkdown('<iframe src="javascript:alert(1)"></iframe>')
  → '<iframe src="javascript:alert(1)"></iframe>'     (passed through verbatim)

  parseMarkdown('<div onmouseover="alert(1)">hover me</div>')
  → '<div onmouseover="alert(1)">hover me</div>'      (passed through verbatim)
  ```
  Only the literal `<script>...</script>` case is actually stripped — every other case above is emitted byte-for-byte into the HTML that `PreviewPanel.tsx` renders via `dangerouslySetInnerHTML` with **no further sanitization anywhere in the pipeline** (confirmed by reading the full render path: `parseMarkdown` → `MarkdownPreviewTool.tsx` state → `PreviewPanel.tsx` `dangerouslySetInnerHTML`, no DOMPurify or equivalent at any stage).
  **Expected vs Actual:** Expected markdown → HTML rendering to sanitize (or the tool to clearly warn about) dangerous HTML constructs before injecting into the live DOM, since this is a **client-side, no-login, no-CSP-mentioned** developer tool where the "preview" pane renders arbitrary user/pasted content. Actual: a comment-style regex that only removes literal `<script>` tags is trivially bypassed by any of the standard non-script XSS vectors (event-handler attributes, `javascript:` URIs, `<svg onload>`, `<iframe>`). Pasting content from an untrusted source (a shared snippet, a downloaded README, a copy-pasted GitHub issue body) that contains any of the above would execute arbitrary JavaScript in the page's origin the moment it's typed/pasted into the editor — no click or explicit "render" action beyond normal typing is needed, since the preview updates live.
  **Severity:** high (this is a real, easily-triggered stored/reflected-style XSS in a client-side tool with no authentication boundary — confirmed directly against the shipped `parseMarkdown` function and traced the full render sink; did not additionally execute this in the live browser tab to avoid triggering a blocking `alert()` dialog per browser-automation safety guidance, but the source-level trace from parser output to `dangerouslySetInnerHTML` with zero intermediate sanitization is unambiguous).
  **Status (re-test 2026-07-10):** FIXED — `parseMarkdown` now sanitizes `marked.parse()` output through `DOMPurify.sanitize()` (with an allowlist extension for GFM task-list `<input>` checkboxes). Confirmed at the source level (all 5 original payloads neutralized: `onerror`/`onload`/`onmouseover` attributes stripped, `javascript:` href stripped, `<iframe>` fully removed, `<script>` still removed) **and live in the browser** on `/markdownPreview`: typed all 5 payloads into the real editor via `form_input`, attached a native `input`-event listener plus a `window.__xss` marker set by each payload's handler — the marker never fired (no JS executed), and DOM inspection confirmed 0 `<iframe>`/`[onmouseover]` elements and the surviving `<img>`/`<svg>` tags had their dangerous attributes stripped. GFM task-list checkboxes regression-checked both at the source level and live (render as real `<input type=checkbox>`, one correctly `checked`).

### Batch A summary

7 failure cases found across 5 of the 8 tools (cronParser, csvConverter, htmlFormatter, jsonCompare, markdownPreview); base64 and jsonVisualizer clean. Breakdown: **4 high** — A-markdownPreview-1 (XSS via unsanitized HTML passthrough), A-jsonCompare-1 (inline-diff O(n²) LCS causes multi-second freeze or full heap-OOM crash on ordinary large-string JSON values), A-htmlFormatter-1 (tag truncated at `>` inside a quoted attribute value → corrupted formatting + false validator warnings), A-csvConverter-1 (mixed primitive/object arrays in JSON→CSV and YAML→CSV silently drop the primitive entries with zero error) — 1 medium — A-cronParser-1 (day-of-week `7`, POSIX's alias for Sunday, rejected as invalid) — 2 low — A-csvConverter-2 (raw YAML exception text shown to user instead of a friendly message), A-jsonCompare-2 ("Format & Fix" doesn't actually fix the most common JSON mistakes: trailing commas, single/unquoted keys). All routes smoke-tested clean (200, no error markers). Full details above.

### Re-test (after fixes) — 2026-07-10

Dev server restarted clean (`npx next dev -p 3013`) after fixes landed to pick up the new `isomorphic-dompurify` dependency and all source changes. Re-ran every original failed case with its exact repro against the updated source, then a full regression sweep of every original edge case across all 5 modified tools (cronParser, csvConverter, htmlFormatter, jsonCompare, markdownPreview), plus the two follow-up investigations the lead requested. All 7 original cases: **PASS**. No regressions found anywhere in the sweep. Two new pre-existing bugs confirmed and filed.

| Case | Result | Notes |
|---|---|---|
| A-markdownPreview-1 (XSS) | **PASS** | Re-ran the exact 5 payloads from the original repro against the fixed `parseMarkdown` (now wraps `marked.parse` output in `DOMPurify.sanitize` with an `ADD_TAGS:['input']`/`ADD_ATTR` allowlist for GFM task-list checkboxes) — `onerror`, `onload`, `javascript:` href, `<iframe>`, and the inline `onmouseover` are all stripped/neutralized; `<script>` still fully removed. **Also did the requested live browser confirmation** on `/markdownPreview` (localhost:3013): typed all 5 payloads into the real editor via `form_input` + verified with an injected `window.__xss` marker + a native `input`-event listener that no JS executed (`window.__xss` stayed `undefined`), that `<iframe>`/`onmouseover`/`onload` were fully absent from the live rendered DOM, and that the `img`/`svg` tags survived with only the dangerous attribute stripped (matches source-level result exactly). Regression check: GFM task-list checkboxes (`- [ ]` / `- [x]`) still render as real `<input type=checkbox>` elements in the live DOM, one correctly `checked` — confirmed both at the source level and live in the browser. |
| A-jsonCompare-1 (OOM/hang) | **PASS** | Fix adds common-prefix/common-suffix stripping plus a `MAX_LCS_CELLS = 1_000_000` cap on the remaining "middle" region, falling back to a single whole-middle changed segment when the cap would be exceeded. Re-ran the original repro (2000-item JSON, ~160KB, near-identical left/right): now **15ms** (was: full V8 heap-OOM crash). Additionally stress-tested the worst case the prefix/suffix optimization *doesn't* help — two large strings with **no common prefix or suffix at all** (500/2000/5000 "words", up to 64KB each): 0–12ms, no hang, no OOM, cap correctly engages. |
| A-jsonCompare-2 ("Format & Fix" naming) | **PASS** | A new `repairLenientJsonSyntax` pass (single left-to-right scan, string-literal-aware) was added and is now called at the end of `fixCommonJsonIssues`. Re-tested all three originally-unfixed cases: trailing comma `{"a":1,}`, single-quoted `{'a':1}`, and unquoted keys `{a:1}` — all three now produce valid, parseable JSON. Also tested a combined case (`{a:1, 'b':'hello', c:[1,2,3,],}` — unquoted key + single-quoted key/value + trailing commas in both an array and the outer object together) — parses correctly. Regression check: well-formed JSON containing commas/colons/single-quotes **inside string values** (e.g. `"note": "has: colon and 'quotes'"`) passes through unmodified — the string-literal-aware scan doesn't false-positive inside quotes. |
| A-htmlFormatter-1 (tag truncated at `>` in attribute) | **PASS** | `HTMLTokenizer` now correctly tracks quote state while scanning for tag end, so `<a title="a > b" href="#">` tokenizes as one intact `TAG_OPEN` with the full `attributes: 'title="a > b" href="#"'` string (previously truncated to `title="a` with the rest spilling into a bogus TEXT token). Re-ran the full-pipeline repro: the `<p>` sibling is still glued onto the `</a>` line (see A-htmlFormatter-2 below — this is a **separate, pre-existing** bug, confirmed to reproduce on clean input with no `>`-in-attribute involved at all), but the false `"<a> missing href attribute"` validator warning is **gone** — confirming the specific defect reported (corrupted `attributes` string) is fixed. |
| A-csvConverter-1 (silent data loss, mixed arrays) | **PASS** | JSON→CSV and YAML→CSV now add a `_value` column that captures primitive array entries instead of discarding them: `[{"a":1}, "loose string", 42]` → `{"headers":["a","_value"],"rows":[{"a":"1","_value":""},{"a":"","_value":"loose string"},{"a":"","_value":"42"}]}` (was: the two primitive entries became fully empty `{}`/`{"a":""}` rows with zero indication anything was dropped). Same fix confirmed for the YAML path. Regression check: homogeneous arrays of objects, single-object input, and null-value handling all still produce the same output as before. |
| A-csvConverter-2 (raw YAML error leaking to UI) | **PASS** | `parseYAML` now catches its own `yaml.load` exception and re-throws a friendly `"Invalid YAML: ..."` message, matching the JSON path's style — confirmed the malformed-YAML repro (`"key: value\n  bad indent: [unclosed"`) now produces `"Invalid YAML: could not parse input"` instead of the raw multi-line `YAMLException` dump. |
| A-cronParser-1 (dayOfWeek=7 rejected) | **PASS** | `FIELD_RANGES.dayOfWeek` widened to `0-7` with a `normalizeDayOfWeek()` helper that maps `7 → 0` (both mean Sunday per POSIX). `parseCronExpression('0 0 * * 7')` is now valid and produces the identical description (`"At 12:00 AM, on Sun"`) and identical `getNextRuns()` output as `dayOfWeek=0`. Regression check: all originally-tested valid/invalid expressions (5/6/7-field, named months/days, out-of-range, negative, malformed range, step=0, garbage, Feb-30-impossible-date-terminates-cleanly) still behave identically. |

**New pre-existing bugs confirmed per the lead's two follow-up requests** (both filed as new cases in their tool sections above):

- **A-htmlFormatter-2** (confirmed): the `<p>` gets glued onto the previous line even with **completely clean** input — `<div><a href="/page">link</a><p>next paragraph here</p></div>` (no `>` inside any attribute) still formats as `<a href="/page">link</a>  <p>next paragraph here</p>` on one line instead of `<p>` starting its own indented line. Reproduced with 3 additional simple variations (`<span>`+`<p>`, `<a>`+`<div>`, `<em>`+`<h2>`) — all glue the same way. Root cause traced to `StandardHTMLFormatter.handleOpenTag()`: when a block element has `hasOnlyInlineContent === true`, the code does `this.result += this.getIndentation() + token.content` with **no leading `\n`**, so it appends directly onto whatever the previous token left on the current line instead of starting a fresh line. This is genuinely unrelated to A-htmlFormatter-1's root cause (tag-truncation) — confirmed by reproducing it on input containing no `>`-in-attribute at all.
- **A-cronParser-2** (confirmed): range syntax in day-of-week/month descriptions silently truncates to just the first value. `parseCronExpression('0 9 * * 1-5').description` → `"At 9:00 AM, on Mon"` (drops "-Fri" entirely); `parseCronExpression('0 0 1 3-6 *').description` → `"...in Mar"` (drops "-Jun"). Root cause: `generateDescription()`'s day-of-week and month branches do `field.split(',').map(v => NAMES[parseInt(v, 10)] || v)` — for a range string like `"1-5"` (not comma-separated), `split(',')` returns `["1-5"]` as a single element, and `parseInt("1-5", 10)` returns `1` (stops at the first non-digit `-`), so only the range's start value maps to a name and the rest is silently lost. Confirmed via `git diff` that this exact code block predates today's fixes — the day-of-week=7 fix only added `normalizeDayOfWeek()` around the existing `parseInt` call, it didn't touch the range-handling gap. Same bug affects both day-of-week and month fields; does not affect day-of-month (which renders raw numbers without a name lookup, so ranges pass through as literal text unaffected).

### Batch A re-test summary

**7/7 original failed cases: PASS** (all fixes hold, confirmed via source-level probes against the actual updated modules, and for the XSS case additionally via live browser testing with a JS-execution marker). **0 regressions** found across a full sweep of every original edge case in all 5 modified tools. **2 new pre-existing bugs confirmed and filed**: A-htmlFormatter-2 (medium — sibling block elements glue onto one line on ordinary clean input, a formatting-correctness bug independent of A-htmlFormatter-1) and A-cronParser-2 (medium — day-of-week/month range descriptions silently drop everything but the first value, a display-only bug that doesn't affect the underlying `getNextRuns()` schedule calculation, which correctly expands ranges via `expandField`).

### Re-test (iteration 2) — 2026-07-10

Re-tester: tester-a2 (fresh respawn of tester-a; original findings above are its persisted work). Note: `.probes/` was empty on respawn (scripts weren't persisted to disk) — rewrote `.probes/html_retest2.probe.ts` and `.probes/cron_retest2.probe.ts` from scratch against the current source, covering both fixes plus a full regression sweep. Both fixes are code-review-approved and frozen per the lead's brief; re-ran against the exact current source state.

| Case | Result | Notes |
|---|---|---|
| A-htmlFormatter-2 (sibling block gluing) | **PASS** | Exact original repro `<div><a href="/page">link</a><p>next paragraph here</p></div>` and all 3 report variations (`<span>+<p>`, `<a>+<div>`, `<em>+<h2>`) now put the trailing block on its own indented line (`\n  <p>...`), no more glued double-space. `<a><b>x</b></a>` (inline-in-inline) confirmed NOT split — stays fully compact on one line, no regression to the compact-mode path. |
| A-htmlFormatter-2 perf (5000-deep nesting) | **PASS** | 492ms (report's original number: 501ms) — well under 1s, consistent, no regression from the `ensureNewLine()`/`append()` changes. Also re-checked 1000-deep (29ms, was 28ms) and the 50k-word large-input case (2ms, was 4ms) — both consistent with original, no perf regression. |
| A-htmlFormatter-1 (tag truncated at `>` in attribute) | **PASS (regression)** | `HTMLTokenizer.tokenize('<a title="a > b" href="#">link</a>')` still produces one intact `TAG_OPEN` token with full `attributes: 'title="a > b" href="#"'`. Full-pipeline repro re-run: the false `"<a> missing href attribute"` validator warning is still gone (`validateHTML()` on the combined repro now only reports the pre-existing, unrelated "Missing lang attribute" info-level warning). Confirmed this code path (`findTagEnd`'s quote-tracking) is untouched by A-htmlFormatter-2's changes, as expected. |
| A-cronParser-2 (range descriptions truncated) | **PASS** | `'0 9 * * 1-5'` → `"At 9:00 AM, on Mon-Fri"` (exact match). `'0 9 * 3-6 *'` → `"At 9:00 AM, in Mar-Jun"`; original report's exact repro `'0 0 1 3-6 *'` → `"At 12:00 AM, on day 1 of the month, in Mar-Jun"`. `'5-7'` (day-of-week) → `"Fri-Sun"` (exercises the 7→Sun normalize-before-namelookup path inside a range, not just a bare value). `'0,7'` → `"on Sun"` (dedup via `Array.from(new Set(...))` collapses the two Sunday aliases to one). Also spot-checked `1-5/2` (range+step) → `"Mon-Fri every 2"`, single value `month=3` → `"Mar"`, and comma list `1,3,5` → `"Mon, Wed, Fri"` — all correct. |
| A-cronParser-1 (dayOfWeek=7 rejected) | **PASS (regression)** | `parseCronExpression('0 0 * * 7')` vs `'0 0 * * 0'`: both `isValid: true`, both describe as `"At 12:00 AM, on Sun"` (identical). `getNextRuns('0 0 * * 7', 3, from)` vs `getNextRuns('0 0 * * 0', 3, from)` from a fixed **local**-time anchor (`new Date(2026,6,10,...)`, no `toUTCString` involved — avoiding the prior false-alarm pitfall) produce byte-identical `Date.toString()` arrays. Boundary check: `dayOfWeek=8` still correctly rejected (`"allowed: 0-7"`), confirming the widened range didn't over-widen. |
| Full cronParser regression sweep | **PASS** | Named months/days, out-of-range (min=60, dom=32, month=13, dow=8), negative numbers, malformed range (`5-1` start>end, `abc`), step=0, garbage input, empty/whitespace, leading/trailing whitespace, 6-field (seconds) and 7-field (year, incl. a year *range* `2026-2030` which is valid syntax and correctly expands/describes as raw numbers, no name-lookup needed for years), Feb 30 (impossible date, 0 results, 0ms, no hang), Feb 29 leap-year matching (re-verified from anchors just before an actual leap year: `2027-06-01` → finds `2028-02-29`; `2023-06-01` → finds `2024-02-29` — my first attempt anchored too far from any leap year and returned an artifact-empty result, not a bug), and builder round-trip (`'0 9 * * 1-5'` → builder values → back to identical expression) — all behave identically to the original pass, no regressions. |
| Full htmlFormatter regression sweep | **PASS** | Unclosed/mismatched tags (`<div><p>text</div>`) still degrade gracefully, no crash. Self-closing non-void + void elements format correctly when preceded by a normal (non-compact) block sibling. `<script>` containing a `</script>`-lookalike JS string still preserved intact. Doctype + unicode content formats correctly. All consistent with original probe coverage, no regressions from either fix. |

**New finding — NOT part of either fix under test, confirmed during the regression sweep:**

- **Case ID:** A-htmlFormatter-3 (NEW, confirmed 2026-07-10)
  **Tool / file:line:** htmlFormatter — `src/app/htmlFormatter/formatters/StandardHTMLFormatter.ts:269-311` (`hasOnlyInlineContent`) and its two call sites in `handleOpenTag`/`handleText`/`isInInlineOnlyBlock`
  **Repro:**
  ```
  svc.formatHTML('<div><a href="/x">link</a><p>next</p></div>', OPTS)
  → '<div>\n<a href="/x">link</a>\n  <p>next</p>\n</div>'
  //        ^^^^^^^^^^^^^^^^^^^^^^^^ no indentation (should be "  <a ...")

  svc.formatHTML('<div><!-- note --><span>hi</span></div>', OPTS)
  → '<div><!-- note -->\n<span>hi</span></div>'
  //     ^^^^^^^^^^^^^^ comment glued directly onto <div> with zero separation

  svc.formatHTML('<div><br/><img src="x.png" alt="y"/><input type="text"/></div>', OPTS)
  → '<div>\n<br/>\n<img src="x.png" alt="y"/>\n<input type="text"/>\n</div>'
  //        ^^^^^ each self-closing child on its own line but with 0 indentation
  ```
  **Expected vs Actual:** Expected every child of `<div>` to be indented one level (`"  "`) once the parent is confirmed to have actual block-level structure, and expected a comment to never glue onto a preceding tag with zero separating whitespace/newline. Actual: `hasOnlyInlineContent()` walks the tokens between a block's open/close tags and only returns `false` (i.e. "not compact, use normal multi-line block formatting") when it finds a **`TokenType.TAG_OPEN` token whose `displayType === BLOCK`**. It never checks for `TokenType.TAG_SELF_CLOSING` block-shaped tags or `TokenType.COMMENT` tokens, so a `<div>` whose *only* children are self-closing void elements (`<br>`/`<img>`/`<input>`) and/or a comment gets misclassified as "compact" (`hasOnlyInlineContent === true`). In compact mode, `handleOpenTag` deliberately skips `this.indentLevel++` and omits the trailing `\n` after the open tag (`this.append(this.getIndentation() + token.content)` — by design, so genuinely-inline content like `<b>text</b>` stays glued to its parent). But self-closing block-displaytype children still call their own `ensureNewLine()` + `getIndentation()` in `handleSelfClosingTag` — since `indentLevel` was never bumped, they get a correct newline separator but **wrong (zero) indentation**. Comments are worse: `handleComment` has no `ensureNewLine()` call at all (untouched by A-htmlFormatter-2's fix, which only added `ensureNewLine()` to the open-tag and self-closing-block branches), so a comment as the first child of a compact-mode block **glues directly onto the parent's opening tag with no separator whatsoever** — the exact same *symptom* as A-htmlFormatter-2, just for a token type the fix didn't cover. A third manifestation of the same root cause: a lone **inline** element (e.g. `<a>`) that is the first child of a div whose *other* sibling is a real block tag (so `hasOnlyInlineContent(div)` correctly evaluates `false` this time) still renders with 0 indentation, because `handleOpenTag`'s `INLINE` branch (`this.append(token.content)`, line 89-90) never calls `getIndentation()` at all — it assumes an inline element always continues a line already established by a preceding indented token, which is false when it's the very first content after a fresh block-open newline. Confirmed via `git diff` / code reading that none of `hasOnlyInlineContent`, `handleComment`, or the `INLINE` branch of `handleOpenTag` were touched by A-htmlFormatter-2's fix — this predates it and reproduces identically regardless of whether A-htmlFormatter-2's fix is present.
  **Severity:** medium-low — three related but narrower symptoms than A-htmlFormatter-2 (which affected *any* two adjacent block siblings): (1) missing indentation for a block's first inline child is a common real pattern (link/emphasis followed by a heading/paragraph) and degrades formatting quality; (2) the comment-gluing case requires a comment to be the *sole or first* child of an otherwise-all-inline/self-closing block, a narrower but plausible pattern (a leading `<!-- note -->` before a `<span>`); (3) the self-closing 0-indent case requires a block whose children are *exclusively* void elements, which is uncommon but real (e.g. a div of `<br/>` line breaks or a group of bare `<img/>` tags). None crash or corrupt data — purely a formatting/readability defect, same class as A-htmlFormatter-2 but not covered by its fix.

### Re-test (iteration 3) — 2026-07-10

Re-tester: tester-a2. Fix for A-htmlFormatter-3 landed: a new `appendInline()` helper (indents only if the result currently ends with a newline, otherwise appends as-is) is now used by `handleOpenTag`/`handleCloseTag`'s `INLINE` branches and by `handleText`'s inline branches; `handleComment` now calls `ensureNewLine()` before appending; and `hasOnlyInlineContent()` now also disqualifies "compact mode" when it finds a `TAG_SELF_CLOSING` token whose `displayType !== INLINE` (void elements like `<br>`/`<img>`/`<input>`) or any `COMMENT` token — while correctly still allowing a self-closing tag written for a genuinely-inline element (e.g. `<span/>`) to stay compact. Re-ran all 3 original A-htmlFormatter-3 repros, the coder's 4th-instance case, compact-mode controls, and a full regression sweep against `.probes/html_retest3.probe.ts`.

| Case | Result | Notes |
|---|---|---|
| A-htmlFormatter-3 repro 1 (lone inline first child) | **PASS** | `<div><a href="/x">link</a><p>next</p></div>` → `<div>\n  <a href="/x">link</a>\n  <p>next</p>\n</div>` — `<a>` now correctly indented one level (previously 0-indent), `<p>` still correctly indented. |
| A-htmlFormatter-3 repro 2 (comment-only child) | **PASS** | `<div><!-- note --></div>` → `<div>\n  <!-- note -->\n</div>` — comment now on its own indented line, no more gluing onto `<div>`. |
| A-htmlFormatter-3 repro 2b (comment + inline sibling) | **PASS** | `<div><!-- note --><span>hi</span></div>` → `<div>\n  <!-- note -->\n  <span>hi</span>\n</div>` — both properly separated and indented. |
| A-htmlFormatter-3 repro 3 (void-only children) | **PASS** | `<div><br/><img.../><input.../></div>` → all three self-closing children now correctly indented one level (previously 0-indent despite being on separate lines). |
| A-htmlFormatter-3 repro 4 (coder's 4th instance: `<div><br><a>x</a></div>` close-tag glue) | **PASS** | → `<div>\n  <br>\n  <a href="/x">x</a>\n</div>` — `<br>` (unclosed void syntax, no `/`) and the following `<a>` both correctly indented and separated; the specific close-tag-glue variant the coder flagged is fixed. |
| Compact-mode control: `<a><b>x</b></a>` | **PASS (no regression)** | Stays fully compact on one line — confirms the fix didn't over-widen `hasOnlyInlineContent`'s disqualification to break genuine inline-in-inline nesting. |
| Compact-mode control: `<div><span/></div>` (self-closing syntax on a genuinely-inline tag) | **PASS (no regression)** | Stays compact one line — confirms the fix's `displayType !== INLINE` guard correctly distinguishes void elements (disqualify) from inline elements written with self-closing syntax (stay compact), per the code's own comment. |
| Compact-mode control: `<p>Hello <b>world</b></p>` | **PASS (no regression)** | Stays compact single line, unaffected. |
| A-htmlFormatter-2 regression (sibling block gluing) | **PASS — improved** | All 4 original cases (`<a>+<p>`, `<span>+<p>`, `<a>+<div>`, `<em>+<h2>`) now show **both** the leading inline sibling and the trailing block correctly indented one level, e.g. `<div>\n  <a href="/page">link</a>\n  <p>next paragraph here</p>\n</div>` — strictly better than iteration 2's fix, which left the first inline sibling at 0-indent (that gap is exactly what A-htmlFormatter-3 was tracking). |
| A-htmlFormatter-1 regression (tag truncated at `>` in attribute) | **PASS** | Tokenizer still produces one intact `TAG_OPEN` with full `attributes` string; validator still shows no false "missing href" warning, only the pre-existing unrelated "Missing lang attribute" info notice. |
| Perf: 5000-deep nesting | **PASS, but slower — informational** | 4 runs: 849ms, 657ms, 751ms, 553ms — all comfortably under the 1s bar, but noticeably higher than iteration 2's ~492-501ms baseline (roughly 20-70% slower across runs). Plausible cause: the additional per-token type checks added to `hasOnlyInlineContent` (now checking `TAG_SELF_CLOSING`/`COMMENT` in addition to `BLOCK` `TAG_OPEN`) and the extra `ensureNewLine()`/`appendInline()` call sites. Not filing as a regression since it's still well within budget and the task's stated bar ("well under 1s") is met, but flagging the trend in case a future iteration adds more per-token checks and pushes it closer to the ceiling. |
| Full htmlFormatter regression sweep | **PASS** | Comment after a normal (non-compact) block sibling and self-closing after a normal block sibling both still correctly indented (unaffected by the compact-mode-only fix, as expected). Unclosed/mismatched tags (`<div><p>text</div>`) still degrade the same way as before. Doctype + unicode content unaffected. |

**Iteration 3 summary:** all 5 A-htmlFormatter-3 repros (3 original + 1 comment variant + the coder's 4th-instance close-tag-glue case) **PASS**, all 3 compact-mode controls confirm no over-correction regression, A-htmlFormatter-2 and A-htmlFormatter-1 both still hold (A-htmlFormatter-2's outcome is now strictly better than before), and the full regression sweep is clean. One informational note (not a failure): 5000-deep nesting perf is noticeably slower than iteration 2 (~550-850ms vs. ~500ms) but still well under the 1s bar.

## Batch B

Runtime testing, no formal test suite (this project has no test framework). Probes are TypeScript scripts run via `npx tsx` against the actual source modules, written to `.probes-b/` (not committed). Findings persisted incrementally as testing proceeds.

### textUtilities

- **Case ID:** B-textUtilities-1
  **Tool / file:line:** textUtilities — `src/app/textUtilities/utils/textUtils.ts:17-24` (`toCamelCase`)
  **Repro:** `npx tsx .probes-b/textUtils.probe.ts` → `toCamelCase('hello_world')`
  **Expected vs Actual:** Expected `"helloWorld"` (case converters conventionally treat `_` as a word separator, same as `-` and space). Actual: `"helloworld"` — the underscore boundary is lost entirely, no capitalization happens after it.
  **Root cause:** The regex `/(?:^\w|[A-Z]|\b\w)/g` relies on `\b` (word boundary) to find word starts after separators, but in JS regex `_` is a `\w` character, so there is no `\b` between `o` and `_` or between `_` and `w` in `hello_world`. The later `.replace(/[-_]/g, '')` strips the underscore but by then the word-start detection has already missed it.
  **Severity:** medium (case conversion between snake_case and camelCase is a primary, commonly-advertised use case for this tool; hyphen and space work, only underscore silently degrades).

- **Case ID:** B-textUtilities-2
  **Tool / file:line:** textUtilities — `src/app/textUtilities/utils/textUtils.ts:26-31` (`toPascalCase`)
  **Repro:** `npx tsx .probes-b/textUtils.probe.ts` → `toPascalCase('hello_world')`
  **Expected vs Actual:** Expected `"HelloWorld"`. Actual: `"Helloworld"` — same root cause as B-textUtilities-1 (shared regex pattern), underscore-separated words after the first are not capitalized.
  **Severity:** medium

- **Case ID:** B-textUtilities-3
  **Tool / file:line:** textUtilities — `src/app/textUtilities/utils/textUtils.ts:122-124` (`countCharacters`)
  **Repro:** `countCharacters('😀')`
  **Expected vs Actual:** Expected `1` (visually one character/grapheme). Actual: `2` (JS `.length` counts UTF-16 code units; emoji outside the BMP are surrogate pairs). Not unique to this codebase, but worth flagging since "Character Count" is a headline feature of a text-utilities tool and will visibly over-count for any emoji/many CJK-extension/astral-plane input.
  **Severity:** low

- **Case ID:** B-textUtilities-4
  **Tool / file:line:** textUtilities — `src/app/textUtilities/utils/textUtils.ts:126-129` (`countWords`)
  **Repro:** `countWords('你好世界')` (4 CJK characters, no spaces)
  **Expected vs Actual:** Actual `1` (splits on `\s+`, and unspaced CJK text is one token). This is a known limitation of whitespace-based word counting for non-space-delimited scripts (Chinese/Japanese/Thai), not a crash, just likely a surprising result for CJK users.
  **Severity:** low

### timestampConverter

- **Case ID:** B-timestampConverter-1
  **Tool / file:line:** timestampConverter — `src/app/timestampConverter/utils/timestampUtils.ts:92-135` (`computeConversions`), reachable via the free-text timezone `<input>` in `src/app/timestampConverter/components/InputPanel.tsx:118-126` (a `<datalist>` gives suggestions, but the field accepts any typed string, e.g. a typo like `America/New_Yrok`)
  **Repro:** `computeConversions(new Date(), 'Not/AZone')` (or type an invalid/mistyped IANA zone into the Timezone field in the UI with any valid timestamp entered)
  **Expected vs Actual:** Expected the timezone-independent fields (Unix Timestamp seconds/ms, ISO 8601, RFC 2822) to still render even if the timezone string is bad, with only the tz-dependent fields (Local Date/Time, Day of Week, Week of Year) failing gracefully. Actual: the whole function is wrapped in a single `try/catch`, so `toLocaleString(..., {timeZone: timezone})` throwing for an invalid zone wipes out the **entire** conversions array — the Results panel shows nothing at all instead of partial results.
  **Severity:** medium (reachable by any user who mistypes a timezone in a plain text field; results in a fully blank output panel with no indication of which field caused it)

- **Case ID:** B-timestampConverter-2
  **Tool / file:line:** timestampConverter — `src/app/timestampConverter/utils/timestampUtils.ts:23-46` (`parseInput`)
  **Repro:** `parseInput('999999999999')` (12 nines, one digit under the 1e12 seconds/ms threshold)
  **Expected vs Actual:** Actual `+033658-09-27T01:46:39.000Z` — the seconds/milliseconds heuristic (`num < 1e12` → seconds) has no sanity bound, so a 12-digit value just under the threshold is silently interpreted as seconds and produces an implausible date ~31,000 years in the future instead of being recognized as almost certainly a milliseconds value (which would map to 2001) or rejected. No error is shown; the tool presents the far-future date as if valid.
  **Severity:** low (requires an unusual 12-digit input near the exact threshold; real unix-seconds and unix-ms values from today's date don't collide here)

### uuidGenerator

- **Case ID:** B-uuidGenerator-1
  **Tool / file:line:** uuidGenerator — `src/app/uuidGenerator/utils/idGenerators.ts:106-119` (`generateBatch`)
  **Repro:** `generateBatch('uuid-v4', NaN, format)`
  **Expected vs Actual:** Expected the documented 1-100 clamp (`Math.max(1, Math.min(100, quantity))`) to guarantee at least 1 ID. Actual: `Math.max(1, Math.min(100, NaN))` is `NaN`, and the `for (let i = 0; i < NaN; ...)` loop never runs, so `generateBatch` silently returns `[]` (0 IDs) instead of clamping to 1.
  **Severity:** low — **not currently reachable through the UI**: `GeneratorPanel.tsx:135-140` guards the quantity `<input onChange>` with `if (!isNaN(val))` before calling `onQuantityChange`, so a cleared/invalid field just leaves the previous valid quantity in state rather than propagating `NaN`. Reported as a latent defensive-programming gap in the pure function, confirmed via direct probe, not via UI reproduction.

### regexTester

- **Case ID:** B-regexTester-1
  **Tool / file:line:** regexTester — `src/app/regexTester/components/RegexTesterTool.tsx:75-121` (matches `useMemo`)
  **Repro:** Pattern `(a+)+b`, test string `"a".repeat(30) + "!"` (non-global exec is enough to reproduce; also happens with the `g` flag). Ran via `.probes-b/regex.probe.ts`, which replicates the component's exact match-computation code.
  **Expected vs Actual:** Expected the tool to either bound match time or at least remain responsive. Actual: the underlying `regex.exec(testString)` call **hangs — still running after 15+ seconds**, confirmed by killing the process. This is classic catastrophic-backtracking (ReDoS) from the nested quantifier `(a+)+`. The component's `maxIterations = 10000` guard only limits the *number of global-match loop iterations*; it does nothing to bound the time of a **single** `regex.exec()` call, so this hang happens even on the very first match attempt, before the loop-iteration guard is ever consulted. Since `matches` is computed synchronously inside a `useMemo` on every keystroke (pattern/testString change), typing this pattern with this test string freezes the tab.
  **Severity:** high — trivially reachable by any user (nested-quantifier patterns like `(a+)+`, `(a|a)+`, `(a*)*` are common beginner mistakes, not adversarial input), no recovery short of killing the tab, and it's the core interactive feature of the tool.

### textCompare

- **Case ID:** B-textCompare-1
  **Tool / file:line:** textCompare — `src/app/textCompare/algorithms/LineDiffAlgorithm.ts:37-59` (single-line look-ahead in `computeDiff`)
  **Repro:** `compareTexts('a\nb\nc', 'a\nX\nY\nb\nc')` (2 new lines inserted before `b`) via `.probes-b/textCompare.probe.ts`
  **Expected vs Actual:** Expected `a` unchanged, `X`/`Y` shown as `added`, `b`/`c` unchanged (correct semantic diff for a pure insertion). Actual: the algorithm only look-aheads 1 line, so it pairs up `b`↔`X` and `c`↔`Y` as `changed` (falsely implying `b` was edited into `X` and `c` into `Y`), then shows the real `b`/`c` as trailing `added` lines. Reproduces the same way in reverse for a 2-line deletion (`removed` mispaired with `changed`). Confirmed for both 2-line and 3-line insertions.
  **Severity:** high — this is the core feature of a text-diff tool; inserting/deleting more than one consecutive line is an extremely common real-world case (e.g. reviewing a code change that adds 2 lines), and the tool actively misreports unchanged lines as modified.

- **Case ID:** B-textCompare-2
  **Tool / file:line:** textCompare — `src/app/textCompare/algorithms/LineDiffAlgorithm.ts:79-95` (`preprocessLines`) / `TextCompareService.compareTexts`
  **Repro:** `compareTexts('a\r\nb\r\nc', 'a\nb\nc')` (identical content, left has CRLF line endings, right has LF) via `.probes-b/textCompare.probe.ts`, default options (no `ignoreWhitespace`)
  **Expected vs Actual:** Expected at least a way to see these as equivalent content. Actual: every line is marked `changed` (`"a\r"` vs `"a"`, `"b\r"` vs `"b"`) because the algorithm splits only on `\n`, leaving the trailing `\r` embedded in the left line's text. Pasting a Windows-authored file against a Unix-authored file with byte-identical text shows a 100%-different diff by default. (An `ignoreWhitespace` option exists on `DiffOptions` that would `.trim()` this away, but it is not the default and would also strip meaningful leading/trailing spaces — not a targeted fix.)
  **Severity:** medium — very common real-world scenario (cross-platform paste), silently produces a maximally-misleading diff.

### mermaidEditor

Probed `.probes-b/mermaid.probe.ts` and `.probes-b/mermaid2.probe.ts` against `flowchartParser.ts` (`parseFlowchart`). Covered: all 8 node shapes, all arrow-type variants including ambiguous-looking overlaps (`-.-` vs `-.->`, `===` vs `==>`), chained edges with inline/pipe labels, subgraphs, `classDef`/`class`, semicolon-separated statements, 50-node chains, unicode labels/emoji, CRLF line endings (handled correctly — each line is `.trim()`-ed, unlike textCompare), comments, case-insensitive `graph`/`flowchart` keywords, invalid keyword rejection. The parser is largely solid; one real bug found:

- **Case ID:** B-mermaidEditor-1
  **Tool / file:line:** mermaidEditor — `src/app/mermaidEditor/utils/flowchartParser.ts:311-337` (`parseStatement`, the `parsedNodes` build loop and the edge-creation loop)
  **Repro:** `parseFlowchart('graph TD\nA-->1bad-->C')` (middle node id `1bad` is invalid — Mermaid node ids must start with a letter/underscore, `NODE_ID_PATTERN` correctly rejects it)
  **Expected vs Actual:** Expected either no edges (chain broken by the invalid node) or an edge only up to the invalid segment. Actual: `{"nodes":[A,C],"edges":[{"from":"A","to":"C",...}]}` — a **fabricated edge `A-->C` that was never written in the source** is created. Root cause: the `parsedNodes` array is only pushed to `if (nodeDef)` (line 314-318), so when the middle segment fails to parse it's skipped entirely rather than leaving a gap/placeholder — this shifts every subsequent index down by one. The edge-creation loop then pairs `arrowMatches[i]` with `parsedNodes[i]`/`parsedNodes[i+1]` by raw index, so it silently connects `A` (the segment before the bad node) to `C` (the segment after), inventing a direct connection that doesn't exist in the diagram source. Confirmed the same pattern in a 4-node chain (`A-->B-->1bad-->D` → fabricates `B-->D`, drops `1bad` entirely).
  **Severity:** medium — requires a malformed node id in the middle of a chain (uncommon but plausible typo, e.g. starting a node id with a digit), and the failure mode is silent topology corruption (a wrong edge rendered) rather than a crash or a visible error, which is worse than failing loudly for a diagramming tool.

### svgEditor

`src/app/svgEditor/page.tsx` is a 5-line `redirect('/mermaidEditor')` with no logic of its own — confirmed working (`curl -I localhost:3013/svgEditor` → `307` to `/mermaidEditor`, per tester-a's smoke test table above). No findings; not a distinct tool to deep-test.

### HomePage / navigation

Checked `src/components/ToolsNavigation.tsx` (`tools` array, search filter, active-link highlighting) and cross-referenced against the live homepage HTML (`curl localhost:3013/`). All 14 listed tools (`svgEditor` intentionally excluded since it's redirect-only) link to routes that exist and return 200. Search filter logic (`toLowerCase().includes()` over name+description) and the `Ctrl+K` focus shortcut read correctly; no runtime issues found. No findings.

### Summary

11 failure cases found across 7 areas (textUtilities, timestampConverter, uuidGenerator, regexTester, textCompare, mermaidEditor); svgEditor and HomePage/navigation clean. Breakdown: 1 high (regexTester ReDoS hang), 1 high (textCompare multi-line insert/delete misrepresentation), 4 medium, 5 low. Full details above.

### Re-test (iteration 1) — 2026-07-10

Re-tester: tester-b2 (fresh respawn of tester-b, which died mid-run on a transport error; original findings above are its persisted work). Method: same as original — `.probes-b/` scripts run via `npx tsx` against the real source modules, plus a live browser check (Chrome, tab on `localhost:3013`) for the regexTester Web Worker fix, which cannot run under Node.

**Fixed cases — verdicts:**

| Case | Verdict | Evidence |
|---|---|---|
| B-regexTester-1 (ReDoS hang) | **PASS** | Browser: pattern `(a+)+b` vs `"a"×30 + "!"` → red "Pattern timed out — possible catastrophic backtracking" banner appears within ~2s, tab stays fully responsive throughout (screenshots/clicks kept working). Follow-up pattern `\d+` vs `"abc 123 def 456"` immediately after → 2 matches, `123`/`456` highlighted correctly — confirms clean recovery, not just a stuck error state. |
| B-mermaidEditor-1 (fabricated edge) | **PASS** | `parseFlowchart('graph TD\nA-->1bad-->C')` → `{"nodes":[A,C],"edges":[]}`, no fabricated `A-->C` edge. 4-node variant (`A-->B-->1bad-->D`) → nodes `[A,B,D]`, only the untouched `A-->B` edge survives; no fabricated `B-->D`. All 8 shapes / arrow-type / subgraph / chain / CRLF / unicode regression cases from the original probe still parse identically to before. |
| B-textCompare-1 (multi-line insert/delete misrepresented) | **PASS** | 2-line and 3-line insertions: `b`/`c` now stay `unchanged`, inserted lines show as `added` on the right with `placeholder` rows on the left (previously falsely paired as `changed`). 2-line deletion is the mirror image (`removed` + placeholder). Single-line modification still correctly shows as `changed`. |
| B-textCompare-2 (CRLF vs LF false diff) | **PASS** | `'a\r\nb\r\nc'` vs `'a\nb\nc'` → all 3 lines `unchanged` (was: all 3 falsely `changed`). |
| B-textCompare cap/fallback (Task #16 follow-up) | **PASS** | 20k lines with a 1-line change in the middle: 8ms, no `notice`, exactly 1 `changed` line (prefix/suffix trim keeps this off the fallback path). 4000×4000 and 10,000×10,000 fully-distinct-line inputs (16M / 100M cells, both over `MAX_LCS_CELLS=1e6`): 3–4ms each, `notice` = "Inputs too large for a precise diff — showing a simplified line-by-line comparison instead.", correct row counts, all rows `changed`. Confirms the amber-notice fallback is fast and doesn't hang even at 100M virtual cells — this is the documented intentional new behavior, not a regression. |
| B-textUtilities-1 (`toCamelCase('hello_world')`) | **PASS** | → `"helloWorld"` (was `"helloworld"`). |
| B-textUtilities-2 (`toPascalCase('hello_world')`) | **PASS** | → `"HelloWorld"` (was `"Helloworld"`). |
| B-textUtilities-3 (emoji `countCharacters` over-counts, low) | **PASS** | `countCharacters('😀')` → `1` (was `2`); `Intl.Segmenter` grapheme counting confirmed in source. Regression check `countCharacters('hello')` still `5`. |
| B-textUtilities-4 (CJK `countWords` under-counts, low) | **IMPROVED** | `countWords('你好世界')` → `2` (was `1`); `Intl.Segmenter` word-granularity segmentation now splits the run into 2 word-like tokens instead of treating unspaced CJK as a single token. Regression check `countWords('hello world')` still `2`. |
| B-timestampConverter-1 (invalid tz blanks all fields) | **PASS** | `computeConversions(date, 'Not/AZone')` → Unix (s/ms), ISO 8601, RFC 2822, UTC Date/Time, Relative Time, and Week of Year all populated normally; only `Local Date/Time` and `Day of Week` show the inline `"Invalid timezone: Not/AZone"` string. Matches the documented per-field isolation fix exactly. |
| B-timestampConverter-2 (far-future s/ms ambiguity, low) | **PASS** | `parseInput('999999999999')` → `2001-09-09T01:46:39.999Z` (was `+033658-09-27T...`, ~31,000 years out). The ms-retry-outside-year-1–9999 heuristic now correctly re-interprets the boundary value as milliseconds. Regression checks: `1700000000` (s) and `1700000000000` (ms) both still resolve to the same correct `2023-11-14T22:13:20.000Z`; ISO string input unaffected. |
| B-uuidGenerator-1 (`NaN` quantity) | **SKIPPED (won't-fix, per lead)** | Confirmed still unreachable through the UI: `GeneratorPanel.tsx`'s `onChange` guards with `if (!isNaN(val))` before it ever reaches `generateBatch`. Not re-verified further — no code changed here and this was explicitly called out as out of scope for this iteration. |

**Full batch-B sweep (neighbour-regression check):** re-ran the complete original probe suites (`textUtils.probe.ts`, `timestamp.probe.ts`, `mermaid.probe.ts`, `mermaid2.probe.ts`, `textCompare.probe.ts`) plus the coder's own cross-verification probes (`coder-text-verify.probe.ts`, `coder-text-cap-verify.probe.ts`). All case/hyphen/space/dotted/path/constant/sentence/alternating/inverse converters, URL encode/decode, trim/whitespace, line counting, all 8 mermaid node shapes, all arrow-type variants, subgraphs, `classDef`, semicolons, 50-node chains, unicode/CRLF/comments, `parseInput` boundary values (epoch 0, negative, scientific notation, hex-like, ISO, garbage, `NaN`/`Infinity` literals, oversized), `getISOWeekNumber`, `getRelativeTime` — all behave identically to the original pass or better, with one exception below. Route smoke test (`/`, `/svgEditor`, `/mermaidEditor`, `/textCompare`, `/textUtilities`, `/timestampConverter`, `/regexTester`, `/uuidGenerator`): all still 200 (svgEditor 307 redirect, intentional).

**New finding introduced by the B-textUtilities-4 fix:**

- **Case ID:** B-textUtilities-5 (NEW)
  **Tool / file:line:** textUtilities — `src/app/textUtilities/utils/textUtils.ts:142-158` (`countWords`)
  **Repro:**
  ```
  npx tsx -e "import { countWords } from './src/app/textUtilities/utils/textUtils'; console.log(countWords('😀 😀 😀'), countWords('😀'), countWords('!!! ???'))"
  ```
  → `0 0 0`
  **Expected vs Actual:** Expected non-empty, non-whitespace input to always count at least 1 word (the pre-fix behavior: `trimmed.split(/\s+/).length`, which counted any whitespace-delimited token — emoji or punctuation included — as a "word"). Actual: the new `Intl.Segmenter(..., {granularity:'word'})` path only counts segments where `isWordLike` is `true`; per Unicode word-break rules emoji and punctuation are categorized as non-word-like, so any input consisting solely of emoji and/or punctuation/symbols now reports **0 words** despite being non-empty, visibly-populated text. Mixed content is unaffected (`countWords('hi 😀')` → `1`, counting only `"hi"` — arguably correct, not part of this finding). This is a side effect of the CJK word-segmentation fix (B-textUtilities-4), not present in the original code review's stated verification scope ("edge cases traced: ALLCAPS, digits, separators, empty" — emoji/symbol-only input wasn't among them).
  **Severity:** medium — "Word Count" is a headline, always-visible stat in this tool; a user pasting an emoji-only reaction string, an emoji-decorated line, or a punctuation-only line (all plausible real content, not adversarial input) sees "0 Words" for text they can plainly see is not empty, which reads as broken rather than merely imprecise. No crash, no data loss — display-only.

**Iteration 1 summary:** 12 of 13 tracked verdicts **PASS** (9 originally-failing cases fixed, 1 low-severity case improved as a side effect of its sibling fix, 1 confirmed out-of-scope skip per lead instruction), plus the Task #16 cap/fallback follow-up independently re-verified fast and correct up to 100M virtual cells. 1 **NEW medium-severity regression** found (B-textUtilities-5, emoji/symbol-only `countWords` returns 0) — a direct side effect of the Segmenter-based fix for B-textUtilities-4, not caught by the original code review's stated edge-case list. No neighbour regressions found anywhere else in the full batch-B sweep. All 8 batch-B-relevant routes smoke-test clean.

### Re-test (iteration 2) — 2026-07-10

Re-tester: tester-b2. Scope: B-textUtilities-5 fix only (`countWords`, `src/app/textUtilities/utils/textUtils.ts:142-161`). Fix keeps the `Intl.Segmenter` `isWordLike` count as primary, but falls back to the whitespace-token count (`trimmed.split(/\s+/).length`) when the segmenter count is `0` on non-empty trimmed text — so real-word text still gets precise CJK/Thai segmentation, while emoji/symbol-only text no longer silently reports 0.

**Case ID:** B-textUtilities-5 — **FIXED (PASS)**
Ran `.probes-b/coder-text-countwords-fix.probe.ts` — all values match the exact expectations given:

| Input | Result | Expected |
|---|---|---|
| `'😀 😀 😀'` | 3 | 3 (was 0) |
| `'!!! ???'` | 2 | 2 (via fallback) |
| `'你好世界'` | 2 | 2 (no regression — still Segmenter word-split) |
| `'hello world'` | 2 | 2 (no regression) |
| `'hello, world!'` | 2 | 2 |
| `''` | 0 | 0 |
| `'   '` | 0 | 0 |
| `'hello'` | 1 | 1 |
| `'😀hello'` | 1 | (isWordLike path, one word segment) |
| `'hello 😀'` | 1 | 1 (documented semantics: emoji not counted when a real word segment already makes the count > 0) |

All values match exactly, including the documented "emoji not counted when real words exist" semantics for the mixed-content cases.

**Full textUtilities probe sweep** (`.probes-b/textUtils.probe.ts`, all 40 assertions covering every case converter — camel/Pascal/snake/kebab/constant/dot/path/title/sentence/alternating/inverse — plus encode/decode URL, trim/whitespace, and all count functions): zero `MISMATCH`, identical to the iteration-1 run except the now-fixed `countWords('😀 😀 😀')` line, which flips from `[MISMATCH] ... => 0 (expected 3)` to `[OK] ... => 3 (expected 3)`. No new regressions in any case converter (none of them call `countWords`, confirmed unaffected as expected).

**Iteration 2 summary:** B-textUtilities-5 is fixed — root cause addressed with a minimal, correctly-scoped fallback (only triggers when the primary segmenter count is exactly 0, so CJK/Thai and mixed-content precision from B-textUtilities-4 is fully preserved). No regressions found in the full textUtilities sweep. Batch B is now clean: all originally-reported cases fixed or explicitly skipped (uuidGenerator, won't-fix/unreachable), and the one regression introduced during iteration 1 is resolved.

### Re-test (iteration 3, independent reconfirmation) — 2026-07-10

Re-tester: tester-b (this session). Ran independently, before reading iterations 1–2 above, against the current worktree state — results below were produced blind and then cross-checked against the existing iteration 1/2 write-up; they agree in full.

| Case | Verdict | Evidence |
|---|---|---|
| B-regexTester-1 (ReDoS hang) | **PASS** | Live browser check on `localhost:3013/regexTester` (tab 20489892): pattern `(a+)+b`, test string `"a"×30 + "!"` → red "Pattern timed out — possible catastrophic backtracking. Try simplifying the pattern." banner rendered within the 2s timeout; screenshots taken immediately after typing and again after a 3s wait both succeeded with no unresponsive-page interruption, confirming the tab never froze. Followed by clearing both fields and testing `\d+` against `"order 123 total 456"` → 2 matches (`123` index 6, `456` index 16) highlighted correctly, confirming clean recovery from the timeout state. |
| B-mermaidEditor-1 (fabricated edge) | **PASS** | `parseFlowchart('graph TD\nA-->1bad-->C')` → `edges: []` (no fabricated `A-->C`). `A-->B-->1bad-->D` → `edges: [{A→B}]` only, no fabricated `B-->D`. Full original `mermaid.probe.ts` suite (shapes/arrows/chains/subgraphs/classDef/semicolons/50-node chain/unicode/CRLF/comments) re-run with identical output to the pre-fix baseline — no regressions. |
| B-textCompare-1 (multi-line insert/delete misrepresented) | **PASS** | 2-line and 3-line insertions now show `a` unchanged, inserted lines `added` on the right with `placeholder` on the left, `b`/`c` unchanged — no more false `changed` pairing. 2-line deletion is the correct mirror image. |
| B-textCompare-2 (CRLF vs LF false diff) | **PASS** | `'a\r\nb\r\nc'` vs `'a\nb\nc'` → all 3 lines `unchanged` (was all 3 falsely `changed`). |
| B-textUtilities-1/2 (`toCamelCase`/`toPascalCase` underscore) | **PASS** | `toCamelCase('hello_world')` → `"helloWorld"`, `toPascalCase('hello_world')` → `"HelloWorld"`. Space/hyphen separators unaffected. |
| B-textUtilities-3 (emoji `countCharacters`, low) | **PASS** | `countCharacters('😀')` → `1` (was `2`). |
| B-textUtilities-4 (CJK `countWords`, low) | **IMPROVED, no regression** | `countWords('你好世界')` → `2`. |
| B-textUtilities-5 (emoji/symbol-only `countWords` regression from iteration 1) | **PASS (fixed)** | `countWords('😀 😀 😀')` → `3` (was `0` on a run taken mid-fix earlier in this same session, before the fallback landed; re-run after confirms `3`). Source at `textUtils.ts:150-153` now has the documented `if (wordCount > 0) return wordCount;` fallback to whitespace-token counting. |
| B-timestampConverter-1 (invalid tz blanks all fields) | **PASS** | `computeConversions(date, 'Not/AZone')` → Unix s/ms, ISO 8601, RFC 2822, UTC Date/Time, Relative Time, Week of Year all populated; only `Local Date/Time` and `Day of Week` show the inline invalid-timezone string. |
| B-timestampConverter-2 (far-future s/ms boundary, low) | **PASS** | `parseInput('999999999999')` → `2001-09-09T01:46:39.999Z` (was `+033658-09-27...`). |
| B-uuidGenerator-1 (`NaN` quantity, low) | **UNCHANGED — still unreachable via UI** | `GeneratorPanel.tsx`'s input guard still prevents `NaN` from reaching `generateBatch`; consistent with iteration 1's "won't-fix, per lead" call. |

**Full regression sweep:** re-ran every original `.probes-b/*.ts` probe (`textUtils`, `timestamp`, `uuid`, `mermaid`, `mermaid2`, `textCompare`, `regex2`) plus fresh route checks (`/`, `/mermaidEditor`, `/regexTester` all 200). Zero `MISMATCH` lines anywhere in the full sweep. No new regressions found beyond the already-documented-and-fixed B-textUtilities-5.

**Iteration 3 conclusion:** independent reconfirmation agrees with iterations 1–2 in full. **Batch B is clean** — all 11 original findings are either fixed and verified (10) or confirmed still-unreachable-via-UI and explicitly out of scope per lead (B-uuidGenerator-1, low). The one regression introduced mid-fix (B-textUtilities-5) is resolved and verified. No outstanding batch-B issues.

## UI Batch 1 — Logic Verification (probes) — 2026-07-11

Tester: tester-b2. Scope: pure-function logic added for the UI/UX options audit follow-up. Method: ran the coders' existing probes (`.probes/coder-ui-time_cron_tz.probe.ts`, `.probes/coder-ui-time_timestamp_format.probe.ts`, `.probes/coder-ui-time_uuid_v1_v7.probe.ts`) plus a new probe I wrote for the three modules that had no coder probe yet (`.probes/tester-b2-batch1-verify.probe.ts`, 42 assertions).

### Per-item verdicts

| Item | Verdict | Notes |
|---|---|---|
| `compareOptions.ts` — `sortArraysForComparison` | **PASS** | Shuffled-equal arrays canonicalize to identical JSON; a genuinely different element (`id:4` vs `id:3`) still produces a different canonical form, not silently paired away; nested arrays sorted independently at every depth; mixed-type arrays (string/number/bool/null) sort without throwing and converge to the same order regardless of input order; confirmed no mutation — original array's element order and object reference are untouched after the call (`[...transformed].sort()` copies before sorting, and `value.map(...)` never touches `value` itself); empty array / primitives / null pass through unchanged. |
| `compareOptions.ts` — `stripIgnoredKeys` | **PASS** | Removes ignored keys at any depth (object nested in object nested in array all correctly stripped); sibling keys preserved; empty ignore-set returns the exact same object reference (`result === value`, true same-reference no-op, not just a deep-equal copy); does not mutate the original object's key set; `parseIgnoredKeys` correctly trims whitespace and drops empty entries from a comma-separated list. |
| `unifiedDiffRows.ts` — `buildUnifiedDiffRows` | **PASS** | Pure-unchanged block flattens to 2 UNCHANGED rows with correct line numbers on both sides; 2-line insertion (left PLACEHOLDER + right ADDED) flattens to exactly the 4 real rows with **zero PLACEHOLDER rows leaking into the unified output** — confirmed by asserting `DiffType.PLACEHOLDER` is absent from every row's `type`; mirror-image 2-line deletion (right PLACEHOLDER + left REMOVED) same result; CHANGED pairs correctly split into a REMOVED-old + ADDED-new row pair, both carrying `wordDiff`, each with only the line-number field appropriate to its side (old row has `oldLineNumber` only, new row has `newLineNumber` only); a defensively-constructed mismatched-length left/right `DiffResult` does not throw. |
| `toolbarActions.ts` — `computeToolbarInsertion` | **PASS** | Wrap-with-selection (bold) wraps exactly the selected text and sets the post-insert selection to just the core text (not the `**` markers) so the user can immediately overtype; wrap-with-collapsed-cursor falls back to the config's placeholder text, inserted precisely at the cursor position with no auto-spacing (verified this is the deterministic, documented contract — my first test run flagged a false MISMATCH from my own wrong expected value, corrected after tracing the actual `computeWrapInsertion` logic: it inserts `before+core+after` at `[start,end)` with no whitespace heuristics); wrap at position 0 and at end-of-string both insert correctly; asymmetric wrap (link's `[` / `](https://)`) correctly uses the placeholder text (not stale selected text) when there's no selection; line-prefix (heading/list/quote) correctly prefixes the **entire line** regardless of where mid-line the cursor sits; multi-line selection prefixes **every line touched**, not just the first; empty-document and single-line-no-trailing-newline edge cases both prefix correctly; `replaceStart`/`replaceEnd` always echo back the original `[start,end)` bounds (contract required by `applyToolbarAction`'s native `execCommand('insertText', ...)` driving code, which sets the textarea's selection to `[replaceStart, replaceEnd]` before inserting). |
| `idGenerators.ts` — `generateUuidV1`/`generateUuidV7` | **PASS** (coder's probe, re-verified) | v1: matches `[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}` (version nibble `1`, variant nibble `8-b`); node's multicast bit (LSB of first node octet) confirmed set across 3 independent generations (`0xa9` etc., always odd); no-hyphens format is exactly 32 hex chars; uppercase format round-trips through `.toUpperCase()` unchanged. v7: matches version-7/variant regex; 1000x generation of each of v1 and v7 produced 1000/1000 unique IDs (no collisions); time-ordering verified across a real ~5ms clock tick — every ID in a later-generated batch of 20 sorts lexicographically after every ID in an earlier batch of 20 (48-bit ms-timestamp prefix ordering holds). v4 unchanged: still matches the version-4/variant regex, confirming the new v1/v7 code paths didn't disturb the existing `crypto.randomUUID()`-based generator. |
| `timestampUtils.ts` — `formatWithPattern` | **PASS** (coder's probe, re-verified) | All 14 individual tokens (`YYYY/YY/MMMM/MMM/MM/DDD/ddd/DD/HH/hh/mm/ss/A/a`) render correctly against a fixed UTC instant; longest-prefix-first token matching confirmed disambiguating correctly for both overlap families — `YYYY/YY` → `2026/26` (not `20262/6` or similar mis-split) and `MMMM|MMM|MM` → `July|Jul|07`; composite real-world patterns (`YYYY-MM-DD HH:mm:ss`, `ddd, MMM DD YYYY hh:mm a`) produce exactly the expected string; timezone-aware output confirmed correct across a UTC→Asia/Kolkata (+5:30) day-rollover case (`23:59` UTC → `05:29` next-day Kolkata); invalid timezone returns the documented `"Invalid timezone: <tz>"` string rather than throwing. |
| `cronUtils.ts` — timezone-aware `getNextRuns`/`formatRunDate` | **PASS** (coder's probe, re-verified) | 3-arg (no timezone) and 4-arg-with-`undefined` calls produce byte-identical results, confirming the timezone parameter is purely additive with no behavior change to existing callers; **DST spring-forward across 2026-03-08 America/New_York verified precisely**: all 6 runs of a `0 9 * * *` schedule read exactly `09:00` in America/New_York wall-clock time on every single day (pre- and post-transition), while the underlying UTC instant correctly shifts from `14:00Z` (EST, UTC-5) to `13:00Z` (EDT, UTC-4) exactly at the transition — this is the correct, expected behavior for a wall-clock-anchored schedule crossing DST, and both invariants (constant local wall-clock time + shifting UTC offset) hold simultaneously; UTC vs. Asia/Tokyo schedules diverge as expected for the same UTC start point; seconds-precision (`*/15 * * * * *`) expressions stay correct in tz mode; a schedule with no matches within the 366-day cap (Feb 29 from a 2026-01-01 start — 2026 isn't a leap year, next Feb 29 is 2028, outside the cap) correctly terminates with `[]` rather than hanging, consistent with prior batch-A cap-termination behavior; `''` (empty string) timezone correctly routes to the legacy local-time path (`!timezone` branch → `getNextRunsLocal`) per the code's own branching, and invalid non-empty timezones (`"A"`, `"Not/AZone"`, `"America/New_Yor"` typo) correctly return `[]` from `getNextRuns` / the inline `"Invalid timezone: ..."` string from `formatRunDate` — neither throws, closing out the specific "typing a partial timezone crashed the page" regression the coder's probe comment references. |

### Summary

7/7 items verified: all PASS, zero new failures. No probe file needed edits to the product code — the one apparent MISMATCH during my own run was a wrong expected-value in my test authoring (traced to source, confirmed the actual behavior is correct and documented), not a code defect. Full probe output (42 new assertions + all coder-probe assertions) available by re-running `.probes/tester-b2-batch1-verify.probe.ts` and the three `coder-ui-time_*` probes via `npx tsx`.
