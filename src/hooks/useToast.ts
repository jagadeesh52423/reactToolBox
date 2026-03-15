'use client';

import { useState, useCallback, useRef } from 'react';
import type { ToastConfig } from '@/components/common/ToastNotification';

export type { ToastConfig };

export function useToast(defaultDuration = 3000) {
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback((message: string, type: ToastConfig['type'] = 'success', duration?: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, type });
    timerRef.current = setTimeout(() => {
      setToast(null);
    }, duration ?? defaultDuration);
  }, [defaultDuration]);

  const clearToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  return { toast, showToast, clearToast };
}
