'use client';

import { useState, useCallback, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Sync from localStorage after hydration to avoid SSR mismatch
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item) as T);
      }
    } catch {
      // Ignore parse errors
    }
  }, [key]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const valueToStore = value instanceof Function ? value(prev) : value;
      try {
        const serialized = JSON.stringify(valueToStore);
        if (serialized.length <= 1_048_576) {
          window.localStorage.setItem(key, serialized);
        }
      } catch {
        // Quota exceeded or serialization error — skip persistence
      }
      return valueToStore;
    });
  }, [key]);

  return [storedValue, setValue];
}
