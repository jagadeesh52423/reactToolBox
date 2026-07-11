import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { TextCompareService } from '../services/TextCompareService';
import { DiffResult, DiffStatistics, DiffOptions } from '../models/DiffModels';
import { shouldPauseAutoDiff } from '../utils/autoDiffGuard';
import { decodeShareState } from '../utils/shareLink';

const AUTO_DIFF_DEBOUNCE_MS = 250;
// Tab-scoped (sessionStorage) marker of the exact #share hash payload this tab has
// already hydrated. This — not clearing the URL hash — is what actually prevents a stale
// share link from re-hydrating on reload and clobbering edits made since. Keyed on the
// payload itself (not a boolean) so a genuinely NEW share link opened later in the same
// tab still hydrates; a boolean would block it after the first link. The base64url
// payload has no characters the App Router's history reconciliation would re-encode, so
// an exact-string comparison against it is reliable (unlike comparing full URLs/hashes
// more broadly, which observably can get reasserted/mutated by Next's own router).
const SHARE_HASH_CONSUMED_KEY = 'reactToolBox_textCompare_shareHashConsumed';

/**
 * Custom hook for text comparison logic
 * Separates business logic from UI components
 */
export const useTextCompare = (defaultLeftText: string = '', defaultRightText: string = '') => {
  const router = useRouter();
  const [leftText, setLeftText] = useLocalStorage<string>('reactToolBox_textCompare_left', defaultLeftText);
  const [rightText, setRightText] = useLocalStorage<string>('reactToolBox_textCompare_right', defaultRightText);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [statistics, setStatistics] = useState<DiffStatistics | null>(null);
  const [showDiff, setShowDiff] = useState<boolean>(false);
  const [isAutoDiffPaused, setIsAutoDiffPaused] = useState<boolean>(false);
  const [options, setOptions] = useState<DiffOptions>({
    whitespaceMode: 'none',
    ignoreCase: false,
    contextLines: 3,
    granularity: 'word',
    // ON by default per design's recommendation (it's the enhancement) — user-toggleable.
    detectMoved: true,
  });

  // Create service instance once
  const compareService = useMemo(() => new TextCompareService(), []);

  const runDiff = useCallback(() => {
    const result = compareService.compareTexts(leftText, rightText, options);
    const stats = compareService.calculateStatistics(result);
    setDiffResult(result);
    setStatistics(stats);
    setShowDiff(true);
  }, [leftText, rightText, options, compareService]);

  // Manual "Compare" trigger — bypasses the debounce; also the only way to diff while
  // auto-diff is paused for a large input.
  const computeDiff = useCallback(() => {
    runDiff();
  }, [runDiff]);

  // Clear comparison
  const clearComparison = useCallback(() => {
    setDiffResult(null);
    setStatistics(null);
    setShowDiff(false);
  }, []);

  // Reset texts
  const resetTexts = useCallback(() => {
    setLeftText('');
    setRightText('');
    clearComparison();
  }, [clearComparison]);

  // Update options (recompute is picked up by the auto-diff effect below)
  const updateOptions = useCallback((newOptions: Partial<DiffOptions>) => {
    setOptions((prev) => ({ ...prev, ...newOptions }));
  }, []);

  // Swap texts
  const swapTexts = useCallback(() => {
    setLeftText(rightText);
    setRightText(leftText);
    clearComparison();
  }, [leftText, rightText, clearComparison]);

  // Hydrate from a shared URL hash (once per distinct hash, per tab). Runs after
  // useLocalStorage's own mount-time restore above (both are registered during this
  // render, and effects fire in registration order), so a share link always wins over
  // whatever was saved locally. The hydrated content becomes the visitor's normal
  // (localStorage-persisted) session — same as pasting it in by hand. router.replace is
  // still called as a best-effort cosmetic cleanup of the address bar.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.location.hash) return;
    const payload = window.location.hash;
    // Claim THIS payload synchronously, before starting the async decode — a mutex, not
    // a post-hoc marker, and no `cancelled`/cleanup guard needed: the synchronous claim
    // alone guarantees only one invocation ever proceeds past it. Under React Strict
    // Mode's double-invoke, setup #1 claims the payload and starts decoding; setup #2
    // sees the marker already matches and returns immediately — decode #1 still resolves
    // and hydrates normally (a benign "set state after this effect instance's own
    // cleanup ran" is not an issue here since there is no cleanup to race). Keying on the
    // payload (not a boolean "have I ever hydrated") also means a genuinely NEW share
    // link opened later in the same tab still hydrates — only a repeat of the SAME
    // payload (e.g. a reload where the App Router reasserts the old hash) is skipped.
    try {
      if (window.sessionStorage.getItem(SHARE_HASH_CONSUMED_KEY) === payload) return;
      window.sessionStorage.setItem(SHARE_HASH_CONSUMED_KEY, payload);
    } catch {
      // sessionStorage unavailable (privacy mode etc.) — fall through and hydrate anyway;
      // worst case a reload could re-hydrate, same as before this fix existed.
    }

    decodeShareState(payload).then((state) => {
      if (!state) return;
      setLeftText(state.leftText);
      setRightText(state.rightText);
      setOptions((prev) => ({ ...prev, ...state.options }));
      router.replace(window.location.pathname + window.location.search, { scroll: false });
    });
  }, [setLeftText, setRightText, router]);

  // Real-time debounced diff: recomputes automatically as text/options change. Large
  // inputs pause auto-diff and leave the last result in place until a manual Compare.
  useEffect(() => {
    if (!leftText && !rightText) {
      setIsAutoDiffPaused(false);
      clearComparison();
      return;
    }

    if (shouldPauseAutoDiff(leftText, rightText)) {
      setIsAutoDiffPaused(true);
      return;
    }
    setIsAutoDiffPaused(false);

    const timeoutId = setTimeout(runDiff, AUTO_DIFF_DEBOUNCE_MS);
    return () => clearTimeout(timeoutId);
  }, [leftText, rightText, runDiff, clearComparison]);

  return {
    // State
    leftText,
    rightText,
    diffResult,
    statistics,
    showDiff,
    options,
    isAutoDiffPaused,

    // Actions
    setLeftText,
    setRightText,
    computeDiff,
    clearComparison,
    resetTexts,
    updateOptions,
    swapTexts,
    compareService, // Exposed for word-level diff
  };
};
