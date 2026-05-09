import { useState, useCallback, useMemo } from 'react';
import { BreadcrumbSegment, JsonPath, JSONValue, JsonValueType } from '../models/JsonModels';

export interface UseBreadcrumbReturn {
  breadcrumbPath: JsonPath;
  segments: BreadcrumbSegment[];
  navigateTo: (path: JsonPath) => void;
  navigateUp: () => void;
  navigateToRoot: () => void;
  updateFromClick: (path: JsonPath) => void;
}

function getTypeAtPath(data: JSONValue, path: JsonPath): JsonValueType {
  let current: JSONValue = data;
  for (const segment of path) {
    if (Array.isArray(current)) {
      current = current[parseInt(segment)];
    } else if (typeof current === 'object' && current !== null) {
      current = (current as Record<string, JSONValue>)[segment];
    } else {
      return JsonValueType.UNKNOWN;
    }
  }
  if (current === null) return JsonValueType.NULL;
  if (Array.isArray(current)) return JsonValueType.ARRAY;
  switch (typeof current) {
    case 'string': return JsonValueType.STRING;
    case 'number': return JsonValueType.NUMBER;
    case 'boolean': return JsonValueType.BOOLEAN;
    case 'object': return JsonValueType.OBJECT;
    default: return JsonValueType.UNKNOWN;
  }
}

export function useBreadcrumb(parsedJson: JSONValue | null): UseBreadcrumbReturn {
  const [breadcrumbPath, setBreadcrumbPath] = useState<JsonPath>([]);

  const segments = useMemo((): BreadcrumbSegment[] => {
    if (!parsedJson) return [];
    const result: BreadcrumbSegment[] = [
      { key: 'root', path: [], type: Array.isArray(parsedJson) ? JsonValueType.ARRAY : JsonValueType.OBJECT, isLast: breadcrumbPath.length === 0 }
    ];
    for (let i = 0; i < breadcrumbPath.length; i++) {
      const currentPath = breadcrumbPath.slice(0, i + 1);
      result.push({
        key: breadcrumbPath[i],
        path: currentPath,
        type: getTypeAtPath(parsedJson, currentPath),
        isLast: i === breadcrumbPath.length - 1,
      });
    }
    return result;
  }, [parsedJson, breadcrumbPath]);

  const navigateTo = useCallback((path: JsonPath) => {
    setBreadcrumbPath(path);
  }, []);

  const navigateUp = useCallback(() => {
    setBreadcrumbPath(prev => prev.slice(0, -1));
  }, []);

  const navigateToRoot = useCallback(() => {
    setBreadcrumbPath([]);
  }, []);

  const updateFromClick = useCallback((path: JsonPath) => {
    setBreadcrumbPath(path);
  }, []);

  return {
    breadcrumbPath,
    segments,
    navigateTo,
    navigateUp,
    navigateToRoot,
    updateFromClick,
  };
}
