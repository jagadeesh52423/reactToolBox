import { useCallback, useEffect, useState } from 'react';
import { Hunk, scrollToPairIndex } from '../utils/hunks';

/**
 * Keyboard ('n'/'p') and programmatic navigation between change hunks. The keydown
 * listener no-ops whenever focus is inside any input/textarea/contentEditable element
 * (the search box, ignore-pattern field, context-lines field, ...) so it never
 * hijacks typing — it only fires when focus is elsewhere on the page.
 */
export function useHunkNav(hunks: Hunk[]) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // A hunk's index only makes sense for the diff it was computed from — reset on
  // every new hunk list rather than carry a stale position across recomputes.
  useEffect(() => {
    setCurrentIndex(0);
  }, [hunks]);

  const goTo = useCallback(
    (index: number) => {
      if (hunks.length === 0) return;
      const wrapped = ((index % hunks.length) + hunks.length) % hunks.length;
      setCurrentIndex(wrapped);
      scrollToPairIndex(hunks[wrapped].pairIndices[0]);
    },
    [hunks]
  );

  const goToNext = useCallback(() => goTo(currentIndex + 1), [goTo, currentIndex]);
  const goToPrevious = useCallback(() => goTo(currentIndex - 1), [goTo, currentIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return;

      if (event.key === 'n' || event.key === 'N') {
        event.preventDefault();
        goToNext();
      } else if (event.key === 'p' || event.key === 'P') {
        event.preventDefault();
        goToPrevious();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious]);

  return {
    currentHunkNumber: hunks.length > 0 ? currentIndex + 1 : 0,
    totalHunks: hunks.length,
    goToNext,
    goToPrevious,
  };
}
