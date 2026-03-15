'use client';

import React, { useState, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import GeneratorPanel from './GeneratorPanel';
import OutputPanel from './OutputPanel';
import { IdType, FormatOptions, generateBatch, getIdTypeLabel } from '../utils/idGenerators';

interface HistoryEntry {
  ids: string[];
  type: string;
  timestamp: number;
}

/**
 * UuidGeneratorTool Component
 *
 * Main orchestrator for the UUID/ID Generator tool.
 * Manages state for ID type, format options, generated IDs, and history.
 * Two-panel layout: GeneratorPanel (settings) + OutputPanel (results).
 */
export default function UuidGeneratorTool() {
  const [idType, setIdType] = useLocalStorage<IdType>('reactToolBox_uuidGenerator_type', 'uuid-v4');
  const [quantity, setQuantity] = useLocalStorage<number>('reactToolBox_uuidGenerator_qty', 1);
  const [format, setFormat] = useState<FormatOptions>({
    hyphens: true,
    uppercase: false,
  });
  const [generatedIds, setGeneratedIds] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  }, []);

  const handleGenerate = useCallback(() => {
    try {
      const ids = generateBatch(idType, quantity, format);
      setGeneratedIds(ids);

      setHistory((prev) => {
        const entry: HistoryEntry = {
          ids,
          type: getIdTypeLabel(idType),
          timestamp: Date.now(),
        };
        return [entry, ...prev].slice(0, 10);
      });
    } catch {
      showToast('Failed to generate IDs', 'error');
    }
  }, [idType, quantity, format, showToast]);

  const handleCopyId = useCallback(async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showToast('Failed to copy to clipboard', 'error');
    }
  }, [showToast]);

  const handleCopyAll = useCallback(async () => {
    if (generatedIds.length === 0) return;
    try {
      await navigator.clipboard.writeText(generatedIds.join('\n'));
      showToast(`Copied ${generatedIds.length} ID${generatedIds.length > 1 ? 's' : ''} to clipboard`);
    } catch {
      showToast('Failed to copy to clipboard', 'error');
    }
  }, [generatedIds, showToast]);

  const handleClear = useCallback(() => {
    setGeneratedIds([]);
  }, []);

  return (
    <div className="h-[var(--tool-content-height)] flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Main Content */}
      <main className="flex-1 p-6 overflow-hidden min-h-0">
        <div className="w-full h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Left Panel - Generator Settings */}
            <GeneratorPanel
              idType={idType}
              quantity={quantity}
              format={format}
              onIdTypeChange={setIdType}
              onQuantityChange={setQuantity}
              onFormatChange={setFormat}
              onGenerate={handleGenerate}
            />

            {/* Right Panel - Generated IDs */}
            <OutputPanel
              generatedIds={generatedIds}
              history={history}
              copiedId={copiedId}
              onCopyId={handleCopyId}
              onCopyAll={handleCopyAll}
              onClear={handleClear}
            />
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-sm font-medium z-50 transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
