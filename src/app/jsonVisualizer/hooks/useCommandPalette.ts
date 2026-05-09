import { useState, useCallback, useEffect } from 'react';

export interface UseCommandPaletteReturn {
  isOpen: boolean;
  mode: 'search' | 'filter' | 'navigate';
  navigateText: string;
  setNavigateText: (text: string) => void;
  open: (mode?: 'search' | 'filter' | 'navigate') => void;
  close: () => void;
  toggle: () => void;
  setMode: (mode: 'search' | 'filter' | 'navigate') => void;
}

export function useCommandPalette(): UseCommandPaletteReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setModeInternal] = useState<'search' | 'filter' | 'navigate'>('search');
  const [navigateText, setNavigateText] = useState('');

  const setMode = useCallback((newMode: 'search' | 'filter' | 'navigate') => {
    setModeInternal(newMode);
    if (newMode !== 'navigate') {
      setNavigateText('');
    }
  }, []);

  const open = useCallback((newMode?: 'search' | 'filter' | 'navigate') => {
    setIsOpen(true);
    if (newMode) setMode(newMode);
  }, [setMode]);

  const close = useCallback(() => {
    setIsOpen(false);
    setNavigateText('');
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggle, close]);

  return { isOpen, mode, navigateText, setNavigateText, open, close, toggle, setMode };
}
