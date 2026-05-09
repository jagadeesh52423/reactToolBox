import { useState, useCallback } from 'react';
import { HistoryEntry } from '../models/JsonModels';

const MAX_HISTORY = 50;

export interface UseHistoryReturn {
  pushState: (jsonString: string, description: string) => void;
  undo: () => string | null;
  redo: () => string | null;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
}

export function useHistory(initialJson?: string): UseHistoryReturn {
  const [past, setPast] = useState<HistoryEntry[]>([]);
  const [future, setFuture] = useState<HistoryEntry[]>([]);
  const [current, setCurrent] = useState<string>(initialJson || '');

  const pushState = useCallback((jsonString: string, description: string) => {
    setPast(prev => {
      const newPast = [...prev, { jsonString: current, timestamp: Date.now(), description }];
      if (newPast.length > MAX_HISTORY) {
        return newPast.slice(newPast.length - MAX_HISTORY);
      }
      return newPast;
    });
    setCurrent(jsonString);
    setFuture([]);
  }, [current]);

  const undo = useCallback((): string | null => {
    if (past.length === 0) return null;
    const previous = past[past.length - 1];
    setPast(prev => prev.slice(0, -1));
    setFuture(prev => [{ jsonString: current, timestamp: Date.now(), description: 'undo' }, ...prev]);
    setCurrent(previous.jsonString);
    return previous.jsonString;
  }, [past, current]);

  const redo = useCallback((): string | null => {
    if (future.length === 0) return null;
    const next = future[0];
    setFuture(prev => prev.slice(1));
    setPast(prev => [...prev, { jsonString: current, timestamp: Date.now(), description: 'redo' }]);
    setCurrent(next.jsonString);
    return next.jsonString;
  }, [future, current]);

  const clear = useCallback(() => {
    setPast([]);
    setFuture([]);
  }, []);

  return {
    pushState,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    clear,
  };
}
