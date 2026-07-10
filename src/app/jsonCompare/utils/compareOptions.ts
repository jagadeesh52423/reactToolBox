// Transforms applied to parsed JSON values *before* they reach the diff viewers, so
// inlineDiff/DiffViewer/StructuredDiffViewer never need to know about ignore options.

export const parseIgnoredKeys = (input: string): Set<string> =>
  new Set(
    input
      .split(',')
      .map((key) => key.trim())
      .filter((key) => key.length > 0)
  );

export const stripIgnoredKeys = (value: unknown, ignoredKeys: Set<string>): unknown => {
  if (ignoredKeys.size === 0) return value;

  if (Array.isArray(value)) {
    return value.map((item) => stripIgnoredKeys(item, ignoredKeys));
  }

  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (ignoredKeys.has(key)) continue;
      result[key] = stripIgnoredKeys(val, ignoredKeys);
    }
    return result;
  }

  return value;
};

// Deep-sorts object keys so two structurally-identical values always serialize the same
// way regardless of original key order — used only to derive a stable sort key for arrays.
const canonicalize = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      result[key] = canonicalize((value as Record<string, unknown>)[key]);
    }
    return result;
  }
  return value;
};

const canonicalSortKey = (value: unknown): string => JSON.stringify(canonicalize(value));

/**
 * Recursively sorts every array (at any depth) by each element's canonical JSON form, so
 * two arrays holding the same elements in a different order compare as equal. Elements are
 * matched by exact canonical content, not fuzzy/closest-match — an element that differs in
 * any field still shows as its own add/remove/change rather than being paired with a sibling.
 */
export const sortArraysForComparison = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    const transformed = value.map(sortArraysForComparison);
    return [...transformed].sort((a, b) => canonicalSortKey(a).localeCompare(canonicalSortKey(b)));
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = sortArraysForComparison(val);
    }
    return result;
  }
  return value;
};
