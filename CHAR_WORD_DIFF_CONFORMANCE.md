# Char/Word Diff — Conformance with diffchecker.com

## DECISION (user, 2026-07-11): ADOPT diff-match-patch for TRUE match.
Empirical test (tester-a4, live diffchecker.com vs ours) = 6/8 match, 2 fundamental divergences that a cleanup pass CANNOT fix (they're the core algorithm/tokenizer):
- kitten→sitting (char): diffchecker keeps "itt", shows k→s + en→ing (2 islands). Ours (LCS) matches the "n" too → different alignment. diffchecker = Myers + cleanupSemantic; ours = LCS. Not reconcilable via cleanup.
- a,b→a;b (word): diffchecker treats "a,b" as ONE token (whitespace-only word split); ours splits punctuation → isolates the ",". Different tokenization.
- a👍b→a👎b: diffchecker shows NO inline highlight when an emoji is present (whole-line color only); ours highlights the emoji cleanly. Ours is finer.
### Empirical corrections + verification note (2026-07-11)
- `a,b`→`a;b` word mode: earlier table marked ✅ but EMPIRICAL diffchecker test shows MISMATCH (diffchecker = whole "a,b" one token; ours split punctuation). The dmp rewrite (#40, whitespace-only word tokens) fixes it.
- kitten/sitting left/old side: our LCS+cleanup left a trailing "n" unmerged (cleanup only fired for strictly-internal runs; leading/trailing never merge). dmp's real cleanupSemantic folds leading/trailing → fixed by #40.
- VERIFICATION (precise): diffchecker.com paywalls word/char precision mode after a few free uses. Conformance now rests on: (1) CHAR mode is conformant BY CONSTRUCTION — WordDiffProcessor calls diffchecker's actual engine (dmp.diff_main + diff_cleanupSemantic) directly, so our char output IS dmp output IS diffchecker output; (2) WORD mode adds a whitespace-only tokenization layer over dmp — validated by code review + trace + a transient dev probe (probes are gitignored scratch, not persisted); (3) supplementary visual spot-checks on diffchecker.com where the free tier permits. The one deliberate divergence: emoji (we never render broken half-glyphs).
- Follow-up (low, non-blocking): tokensToChars has no cap on distinct tokens per line pair; >65535 distinct tokens would collision-corrupt (not crash) the word diff. Unreachable for real inputs (live diff pauses on huge inputs); dmp's own linesToChars caps+falls back, ours doesn't. Optional future bound.

Plan: replace WordDiffProcessor's LCS engine with diff-match-patch (dep, ~30KB) — char = dmp char diff + diff_cleanupSemantic; word = dmp word-token diff (whitespace-only via linesToChars-style trick) + cleanupSemantic; map dmp op-list → per-side {text,type} spans for DiffLineDisplay. EMOJI: do NOT render broken half-emoji — match diffchecker's OBSERVABLE behavior (it skips inline highlight on emoji lines; replicate that or guard surrogate pairs). Keep the content-preservation invariant + the word/char granularity toggle.

---


Research: research-diff (opus). Decision: match diffchecker's OBSERVABLE behavior with our own code (no dependency). Emoji handling deliberately kept safer than diffchecker.

## Findings
- Diffchecker's inline highlight = Google **diff-match-patch** behavior: char-level Myers diff + `diff_cleanupSemantic` (coalesces edits into fewer, contiguous, human-readable islands). Word mode ≈ jsdiff `diffWordsWithSpace` (whitespace significant, punctuation as own tokens). Case-sensitive by default; Ignore-Whitespace / Ignore-Case are toggles.
- Our `WordDiffProcessor`: word tokenizer `split(/(\s+|[^\w\s])/u)` ≈ diffWordsWithSpace → **word mode already conforms**. Char tokenizer `Array.from` = code points (emoji-safe, better than dmp's UTF-16 units). Core = LCS+backtrack = same optimal edit set as Myers.
- **Only gap: char mode lacks the semantic-cleanup coalescing pass.** A short UNCHANGED run between two changes stays split; diffchecker absorbs it.

## Conformance examples (✅ match / ❌ diff before C8)
1. char `kitten`→`sitting`: diffchecker 2 islands (`k→s`, `en→ing`, keep `itt`); ours 3 (splits on the `n`). ❌ → fixed by cleanup.
2. word `the quick brown fox`→`the slow brown fox`: only `quick/slow`. ✅
3. word `a,b`→`a;b`: `,`→`;`. ✅
4. char `color`→`colour`: insert `u`. ✅
5. char `1234`→`1204`: `3`→`0`. ✅
6. char `foo bar`→`foobar`: delete space. ✅
7. char `Hello`→`hello`: `H`→`h`. ✅
8. char `a👍b`→`a👎b`: diffchecker may render broken half-emoji (UTF-16); ours whole-emoji. ✅ OURS SAFER — do not regress.
9. char `abcXYZdef`→`abcPQRdef`: `XYZ`→`PQR` contiguous. ✅
10. whitespace `foo `→`foo`: matches diffchecker default (whitespace significant). ✅

## The fix (C8 semantic cleanup, no dep)
Post-`backtrackLCS` pass, per side: find `changed(A) — unchanged(E) — changed(B)`; reclassify `E` as changed when `charLen(E) ≤ max(charLen(A), charLen(B))` for BOTH neighbors (dmp cleanupSemantic rule); loop to fixpoint. Apply to left and right independently. Mainly benefits char mode; harmless in word mode. NEVER drop/duplicate content — only re-labels spans.

## Kept deliberately different from diffchecker
- Code-point (Array.from) char tokens, NOT UTF-16 units → emoji stay intact (diffchecker can split them). Documented deviation.

## Empirical validation (tester on diffchecker.com)
char: kitten/sitting, color/colour, foo bar/foobar, Hello/hello, a👍b/a👎b · word: the quick brown fox/the slow brown fox, a,b/a;b, foo /foo. Confirm our /textCompare output matches diffchecker's island grouping after C8 (except emoji, where we're intentionally cleaner).
