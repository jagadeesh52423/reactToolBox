'use client';

import { useCallback, useRef } from 'react';

export function useFileIO() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const downloadFile = useCallback(
    (content: string, filename: string, mimeType: string = 'text/plain') => {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    []
  );

  const uploadFile = useCallback(
    (accept: string = '*'): Promise<string> => {
      return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = accept;
        input.onchange = () => {
          const file = input.files?.[0];
          if (!file) {
            reject(new Error('No file selected'));
            return;
          }
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsText(file);
        };
        input.click();
      });
    },
    []
  );

  return { downloadFile, uploadFile, inputRef };
}
