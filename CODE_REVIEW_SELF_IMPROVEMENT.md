# Code Review Log — Self-Improvement Loop

## Iteration 2 (reviewer-iter2, opus) — all APPROVED

### Task #17 — A-htmlFormatter-2 (block glued after inline) — APPROVED
- ensureNewLine() on both handleOpenTag branches + handleSelfClosingTag block branch (scope widening justified — same defect class). resultEndsWithNewline flag invariant grep-verified (append() is the only writer; empty-chunk safe; no leading blank line; indentation intact; inline-in-inline not split). Perf: endsWith now O(chunk); coder's self-caught 8.1s regression fixed (568ms at 5000-deep).

### Task #18 — A-cronParser-2 (range descriptions) — APPROVED
- describeFieldToken classification order + anchored regexes correct; repros trace to "on Mon-Fri"/"in Mar-Jun"; malformed tokens can't reach it (validation runs first); 5-7 → "Fri-Sun" via endpoint normalization; 0,7 dedup kept; schedule math untouched. Cosmetic: "0-7" renders "Sun-Sun" (pathological, no action).

### Task #19 — B-textUtilities-5 (emoji word count) — APPROVED
- Whitespace fallback placed outside Segmenter block (covers both fall-through and no-Segmenter env); trim → 0; no split inflation; CJK/English return early. 'hello 😀' → 1 documented.

## Iteration 3 (reviewer-iter3, opus)

### Task #22 — A-htmlFormatter-3 (compact misclassification + comment/inline indent + close-tag glue) — APPROVED
- hasOnlyInlineContent now honest over token types (TAG_SELF_CLOSING non-INLINE + COMMENT disqualify; <span/> carve-out verified via HTMLTagConfig order); appendInline helper indents only on fresh line, flag invariant intact (grep-verified single writer); fix-4 (handleCloseTag non-compact ensureNewLine) reproduced by hand by reviewer and confirmed warranted, compact branch untouched; no double-indent; ensureNewLine-before-indentLevel-- order correct.
- No findings. Perf healthy (573ms @ 5000-deep).

## UI Batch 1 (reviewer-ui1, opus)

### Task #26 — layout/colorPicker/mermaid/htmlFormatter — APPROVED
- Drawer z-[60] over z-50 header (clickthrough fix verified); alpha plumbing + rgba/hsla-only-when-alpha<1; mermaid auto-theme only on Default preset, user choices respected; #111827 dark bg keeps contrast. Non-blocking nit: drawer doesn't lock body scroll.

### Task #27 — jsonCompare/jsonVisualizer — APPROVED
- stripIgnoredKeys true no-op reference when off; sortArraysForComparison non-mutating/stable; options-off path byte-identical; min-h fix coherent; {k} toggle reuses existing wiring. Non-blocking nit: ignore-keys input lacks aria-label.

### Task #28 — textCompare unified/markdown toolbar/regex toggle — APPROVED
- No placeholder leakage in unified rows; toolbar edits only markdown source → DOMPurify path NOT bypassed (verified); CodeEditor forwardRef backward-compatible; sync-scroll loop guard sound; regex toggle default-OFF literal via correct escapeRegExp.

### Task #29 — timestamp/cron-tz/uuid — APPROVED (after 1 revision)
- Revision fix approved: tz states init '' (SSR ≡ first client render), [storedTz] effect re-fires on localStorage restore without clobbering stored preference, '' transient routes to local path (falsy guard) / 'UTC' fallbacks — no Invalid-timezone flash.

### (original verdict) Task #29 — NEEDS_REVISION
- Verified correct: formatWithPattern ordering, uuid v1/v7 bit-level layouts, v4 untouched, cron 2-pass tz conversion bounded/terminating, isValidTimezone contract, datalist + currentTime hydration fixes.
- BLOCKER: tz input VALUE hydration mismatch (getLocalTimezone at first render) at CronParserTool.tsx:23/CronResultsPanel.tsx:83 and TimestampConverterTool.tsx:36/InputPanel.tsx:133 — masked in dev, real in prod. Fix: init '' + set in post-mount effect.
- Reviewer's Finding 2 (local cron path not byte-identical) is a misattribution: those cronUtils changes are previously-approved Tasks #8/#18 work in the same file, not #29 scope. No action.

## textCompare C6 moved-block detection (#42) — APPROVED (reviewer-c6)
- New DiffType.MOVED traced through EVERY consumer, no missed case: collapse (never folds MOVED), search/diffOnly (isChange includes it), hunks/minimap (change hunk + indigo marker), stats (separate moved bucket, tile only >0), per-hunk copy, exports. Duplicate matching correct (FIFO per-text queue, deterministic, never double-counts); blank lines excluded; matching on preprocessed line.text inherits ignore options for free; content preserved; alignment invariant guarantees no MOVED+MOVED same-index collision. Exports: .diff stays byte-exact (unifiedRowSide maps moved-from→'-'/moved-to→'+', hunk counts match, git apply valid, coder validated with real `patch`); md/html annotate through escapeHtml (no XSS). Toggle off reverts cleanly. Open/Closed, minimal.
- Non-blocking: HTML moved-row class order-dependent (cosmetic); no unit tests for movedBlocks (optional, logic provably correct).

## textCompare Batch C-2 (#41) export + share — APPROVED (reviewer-c2, after 2 revision rounds)
- C4 export: unified-patch line math verified across all edge cases; HTML export fully escaped (no XSS in downloaded file); markdown fence guard (longest-backtick-run+1). C5 share: native CompressionStream gzip + base64url in URL HASH (privacy), size caps, SSR/support guarded. 
- Two revision rounds on C5: (1) gunzip Promise.all fixes orphaned-rejection on corrupt hash; (2) share-hydration guard reworked from boolean→payload-keyed sync mutex, `cancelled` guard dropped — resolves stale-reload clobber, same-tab-second-link (prod), and Strict-Mode-no-hydrate (dev). Coder caught the original CompressionStream unhandled-rejection during self-verification.
- Note: same-document hash-only navigation can't re-fire mount hydration (inherent to mount-hydrate; full navigation works).

## #40 diff-match-patch engine swap + C2 minimap — APPROVED (reviewer-dmp)
- WordDiffProcessor rewritten on dmp: char = diff_main+cleanupSemantic (conformant by construction — IS diffchecker's engine); word = whitespace-only tokensToChars encoding + diff + expand + cleanupSemantic (trace-verified, content invariant holds). Span mapping = dmp's diff_text1/text2, public interface stable, emoji guard before mode branch, SSR-safe (pure JS, instance field). C2: data-hunk-anchor unconditional on every unified row, click-path index space consistent.
- Non-blocking: N1 tokensToChars >65535-token collision (unreachable, logged as follow-up); by-construction char probe is trivially circular (char IS raw dmp) — doc wording corrected to be precise. C8 hand-rolled cleanup fully removed (superseded).
- Supersedes the earlier C8 NEEDS_REVISION below (that engine is deleted).

## textCompare Batch C-1 (#39) — C1/C7/link APPROVED; C8 + C2 NEEDS_REVISION (reviewer-tcC1, superseded by #40)
- C8 BLOCKING (conformance): fixed ≤3 threshold inverts kitten→sitting (merges common "itt" diffchecker keeps). Fix: relative rule len(gap) ≤ max(len(prevChange),len(nextChange)) + loop to fixpoint. Also gate cleanup to CHAR mode only — word mode already conforms to diffchecker without cleanup (research), and cleanup changes word-mode separator rendering.
- C2 minor: unified-view minimap click-jump can no-op (only hunk-start rows anchored, minimap targets mid/any row). Fix: anchor every row in unified or snap to nearest hunk-start.
- Content-preservation verified (relabel-only, join invariant). C1 focus-guard/wraparound solid, C7 patch text + single-button-per-hunk correct, JSON link fine. pairIndex addition breaks no consumer.
- Pending: empirical diffchecker comparison (tester-a4) confirms the char rule + whether word mode needs any cleanup.

## textCompare Batch B (#38) — B1/B2/B3 APPROVED, 0 blockers (reviewer-tcB)
- No regression from the UnifiedDiffDisplay rows-as-prop refactor: same buildUnifiedDiffRows source, A2 collapse + A3 granularity intact (diffOnly=false byte-identical). ignoreWhitespace boolean removal confirmed zero functional refs; leadingAndTrailing ≡ old trim(). Fail-open verified (compile + search never throw); zero-width-match loop guard advances lastIndex + MAX_MATCHES 5000 backstop. Fold force-expand stable (no render loop) in both views. Highlight segments non-overlapping, active unique, scroll selector safe. Facade/Strategy intact.
- TRACKED residual (accepted, not fixed): catastrophic-backtracking regex in the OPT-IN ignorePattern/search fields against a single very long line (minified file) can freeze the main thread — per-line bound + 200-char cap + fail-open mitigate; full regexTester-style worker judged over-build for an opt-in feature. Logged in SELF_IMPROVEMENT_LOG deferred follow-ups.
- Nit: README.md:198 stale `ignoreWhitespace?: boolean` → fixing.

## textCompare Batch A (#36) — APPROVED, 0 blockers (reviewer-tcA)
- A1 real-time debounce: no stale-closure/race (cleanup clears timer), no infinite loop, guard over-estimates MAX_LCS_CELLS (pauses at/before algo fallback), manual Compare works when paused. A2 collapse: alignment computed once on pairs, both columns map same entries; placeholders never folded; no off-by-one; contextLines=0 = diff-only. A3 word default unchanged. A4 diffReportBuilder byte-identical, shared Export+CopyDiff. A5 readFile extraction backward-compat (5 consumers verified). diffUtils.ts deletion confirmed zero refs. Strategy/Facade intact, minimal-diff.
- 3 minor recs folded into this batch (not deferred): A3 split('')→Array.from (unicode/surrogate-pair safe); A4 clipboard try/catch (don't show "Copied!" on rejection / insecure-context); A5 drop file size-cap + read try/catch (binary/huge-file guard).

## #37 — editor height-collapse sweep (jsonCompare showDiff + mermaidEditor) — APPROVED (reviewer-sweep)
- JsonComparer: only behavioral delta is showDiff@<lg 180px→480px (intended); desktop identical in both states; flex-shrink-0/flex-1 preserved; mobile math sound (~144px/editor). MermaidEditor: 420/420/350 floors all lg:min-h-0 (desktop 12-col reverts), main overflow-y-auto lg:overflow-hidden no desktop double-scroll, Style-panel floor only when rendered. Complementary to #32 inset-0 (supplies the definite-height ancestor) and #34 (separate file). Closes the class (grep-confirmed only 3 editor call sites).
- Non-blocking pre-existing: MermaidEditor identical-ternary-branches dead conditional (future cleanup).

## #34 — jsonVisualizer mobile/tablet blank editor — APPROVED (reviewer-jv)
- Grid-cols-1 (<lg) auto-rows collapsed stacked panels; fix: min-h-[420px] lg:min-h-0 floor on both grid items + main overflow-y-auto lg:overflow-hidden. Floor on grid items (not container), desktop behavior restored at lg, per-region scroll (no double scrollbar), only consumer is the dynamic-import client. Mirrors #32.
- Pending: tester-a3 browser re-verify (390/606/1400px).

## #32 — MonacoJsonEditor absolute-inset-0 wrap (in HEAD 5d9ccb7) — APPROVED (reviewer-monaco)
- Fixes jsonCompare 390px blank editor (percentage h-full collapse in flex+min-h-0). Only 2 consumers (jsonCompare, jsonVisualizer); both size the editor via flex-1 (not content), so absolute-positioning it doesn't collapse the parent — safe. No toolbar/overlay clipping (toolbars are siblings outside the new relative wrapper). automaticLayout ResizeObserver prefers the definite inset-0 box.
- Pre-existing non-blocker (not #32): JsonInputPanel passes `error` prop MonacoJsonEditor ignores. Candidate future cleanup.
- Pending: tester-a3 browser re-verify (390px iframe + desktop regression on both consumers).

# Iteration 1

Reviewer: reviewer-main (opus, read-only). Verdicts relayed via lead.

## Task #5 — A-jsonCompare-1/2 (O(n²) OOM + Format & Fix) — APPROVED
- Trim boundaries verified LCS-preserving (suffix capped at min−prefix, exact partition, no overlap); cap math safe (≤1e6 cells ≈ ~8MB transient; above cap zero allocation, single changed segment).
- Repair scanner robust: double-quoted content verbatim; \' vs \\' distinguished; unquoted-key only before ':'; trailing comma only before }/]; byte-identical on valid JSON. Note: repair also runs on the COMPARE path (JsonComparer.tsx:290) — byte-identical guarantee is load-bearing and holds.
- Button copy now honest ("Fix common JSON issues and format").

## Task #11 — B-textCompare-1/2 (multi-line diff + CRLF) — APPROVED (non-blocking perf flag)
- LCS + backtrack correct (report repro traced); CRLF and lone-CR normalized; row alignment preserved (left/right lengths equal in every branch); dead code removed.
- FLAG: O(n·m) memory — 10k×10k lines ≈ ~800MB. Single-shot Compare-button invocation (not per-keystroke) mitigates. Follow-up: add cell cap mirroring jsonCompare's MAX_LCS_CELLS (routed as Task #16).

## Task #12 — B-textUtilities (snake_case + Segmenter counts) — APPROVED
- splitIntoWords wired only to camel/Pascal; no cross-converter regression; SSR-safe Segmenter guards; edge cases traced (ALLCAPS, digits, separators, empty). Acronym lowercasing is pre-existing limitation, out of scope.

## Task #16 — Follow-up: textCompare LCS cap — APPROVED (reviewer-16)
- Prefix/suffix line trim + MAX_LCS_CELLS=1M + positional fallback + amber notice. Trim-joint bounds correct (suffix ≤ min−prefix); row alignment and line-number offsets verified (middle uses lineOffset=prefixLength); notice only on fallback; optional DiffResult.notice breaks no consumers (utils/diffUtils.ts has a separate local type).
- Coder's differential fuzz: 500 below-cap cases vs uncapped algorithm — 0 real mismatches (6 duplicate-line tie-break diffs, equal-optimal).
- Minor non-blocking notes (not routed, bounded by cap): linesEqual re-normalizes in the DP hot loop; fallback CHANGED rows each trigger per-row compareWords at render on pathological inputs.

## Task #13 — B-timestampConverter-1 (+far-future) — APPROVED
- Per-field tz isolation correct; outer try/catch removal safe (caller guards null; parseInput gates NaN). Heuristic boundaries traced: epoch 0→1970, −1e9→1938, extreme-negative→ms. Valid tz output unchanged.

## Task #4 — A-markdownPreview-1 (XSS) — APPROVED
- Fix: stripScriptTags regex → `DOMPurify.sanitize(marked.parse(md), config)` via isomorphic-dompurify 3.18.0 (wraps dompurify 3.1.6). Config: defaults + ADD_TAGS ['input'], ADD_ATTR ['type','checked','disabled'] for GFM task lists.
- Stage 1: spec-exact, minimal, allowlist-over-denylist (BP-113).
- Stage 2: sanitize placement correct (last step before sink); single sink confirmed (PreviewPanel.tsx:52); isomorphic choice justified (parseMarkdown runs during SSR; Node runtime confirmed, no edge runtime).
- Bypass attempts all neutralized: event handlers, javascript:/data: hrefs, svg onload, iframe, nested/encoded/mXSS (DOMPurify DOM re-parse), ADD_ATTR opens no new surface.
- Non-blocking note: `<input type=image>` image-load beacon ≡ existing markdown image behavior; nothing to change.
- Pending: tester-a browser-level confirmation at re-test (payloads live, no alert, checkboxes render).

## Task #6 — A-htmlFormatter-1 (quote-aware tokenizer) — APPROVED (tester caveat)
- findTagEnd quote-aware scan correct (comments/CDATA own terminators); both indexOf('>') sites replaced; extractAttributes slice-based; value-traced: false missing-href gone, tokens intact; unterminated input degrades gracefully; no perf regression.
- Tester-a to confirm on exact repro: (a) false-href warning gone; (b) whether glued `<p>` line persists on clean input → if yes, log NEW formatter case (separate pre-existing bug), don't reopen #6.
- Independently re-reviewed by respawned reviewer (concordant APPROVED).

## Task #7 — A-csvConverter-1/2 (mixed-array data loss + YAML error) — APPROVED
- Shared buildRowsFromItems justified (two real callers, deduplicates the buggy logic); _value collision renaming correct and terminating; repro traced: primitives/null preserved as rows; homogeneous flat inputs byte-identical.
- Two intentional behavior improvements for tester awareness: YAML nested-object cells now JSON.stringify (was "[object Object]"); all-primitive arrays now render a _value column instead of "No data found".

## Task #8 — A-cronParser-1 (DOW 7 = Sunday) — APPROVED
- Normalization applied at all consumption points (getNextRuns matcher + description names; no other numeric consumer, grep-verified). Normalize-AFTER-expand avoids the 5-7 descending-range wrap bug: 5-7→{Fri,Sat,Sun}, 0,7→{Sun}, 8/-1 still rejected.
- Pre-existing range-description limitation (shows only first day) confirmed predates change; new case candidate.

## Task #9 — B-regexTester-1 (ReDoS) — APPROVED
- Fix: matching moved to Web Worker (inline Blob, lazy getMatchWorkerUrl inside useEffect — SSR-safe); 2000ms timeout → worker.terminate() bounds a SINGLE exec; per-effect `settled` closure guard blocks stale worker messages; effect cleanup terminates in-flight workers.
- Verified: no sync exec of the user pattern remains anywhere in the module (compile-only validity check is safe; panel regexes are fixed literals); worker logic is a faithful port (zero-length lastIndex++ guard kept); structured-clone-safe payload.
- Non-blocking transient: ~1-frame stale-highlight window during worker roundtrip; slices clamp, no crash, self-corrects. Accepted.
- Pending: tester-b live browser check of the timeout-and-recover path.

## Task #10 — B-mermaidEditor-1 (fabricated edge) — APPROVED
- Fix: ~6-line diff in flowchartParser.ts — parsedNodes widened to `| null`, push moved outside `if(nodeDef)` so indices stay aligned with arrowMatches; pre-existing `!fromNode || !toNode` guard (line 328) drops edges touching malformed segments.
- Stage 1: skip path explicitly allowed by spec; minimal, no over-build.
- Stage 2: root cause (index shift) correctly addressed; parsedNodes is function-local, no other consumers; edge cases traced (leading/mid/trailing bad ids, valid chains unchanged); load-bearing index-alignment comment kept.
- No revisions.
