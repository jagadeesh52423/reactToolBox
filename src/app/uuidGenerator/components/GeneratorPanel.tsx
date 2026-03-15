'use client';

import React from 'react';
import PanelHeader from '@/components/common/PanelHeader';
import { IdType, FormatOptions } from '../utils/idGenerators';

interface GeneratorPanelProps {
  idType: IdType;
  quantity: number;
  format: FormatOptions;
  onIdTypeChange: (type: IdType) => void;
  onQuantityChange: (quantity: number) => void;
  onFormatChange: (format: FormatOptions) => void;
  onGenerate: () => void;
}

const ID_TYPES: { value: IdType; label: string; description: string }[] = [
  { value: 'uuid-v4', label: 'UUID v4', description: 'Standard RFC 4122 UUID using crypto.randomUUID()' },
  { value: 'nanoid', label: 'Nano ID', description: 'URL-safe 21-character ID (A-Za-z0-9_-)' },
  { value: 'objectid', label: 'ObjectId', description: 'MongoDB-style 24-character hex string' },
];

/**
 * GeneratorPanel Component
 *
 * Left panel with controls for selecting ID type, format options,
 * quantity, and a generate button.
 */
export default function GeneratorPanel({
  idType,
  quantity,
  format,
  onIdTypeChange,
  onQuantityChange,
  onFormatChange,
  onGenerate,
}: GeneratorPanelProps) {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden flex flex-col">
      <PanelHeader title="Generator Settings" />

      <div className="flex-1 p-6 overflow-auto space-y-6">
        {/* ID Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
            ID Type
          </label>
          <div className="space-y-2">
            {ID_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => onIdTypeChange(type.value)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                  idType === type.value
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500/30'
                    : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-gray-300 dark:hover:border-slate-600'
                }`}
                title={`Select ${type.label} generation`}
              >
                <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                  {type.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  {type.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Format Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
            Format Options
          </label>
          <div className="space-y-3">
            {/* Hyphens Toggle - only relevant for UUID */}
            <label
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-colors ${
                idType === 'uuid-v4'
                  ? 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50'
                  : 'border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/30 opacity-50'
              }`}
            >
              <input
                type="checkbox"
                checked={format.hyphens}
                disabled={idType !== 'uuid-v4'}
                onChange={(e) => onFormatChange({ ...format, hyphens: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-slate-600 focus:ring-blue-500"
                aria-label="Include hyphens in UUID"
              />
              <div>
                <div className="text-sm text-gray-900 dark:text-slate-100">Include hyphens</div>
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  {format.hyphens ? 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' : 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}
                </div>
              </div>
            </label>

            {/* Uppercase Toggle */}
            <label className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
              <input
                type="checkbox"
                checked={format.uppercase}
                onChange={(e) => onFormatChange({ ...format, uppercase: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-slate-600 focus:ring-blue-500"
                aria-label="Use uppercase characters"
              />
              <div>
                <div className="text-sm text-gray-900 dark:text-slate-100">Uppercase</div>
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  {format.uppercase ? 'ABCDEF...' : 'abcdef...'}
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Quantity Input */}
        <div>
          <label
            htmlFor="quantity-input"
            className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2"
          >
            Quantity
          </label>
          <div className="flex items-center gap-3">
            <input
              id="quantity-input"
              type="number"
              min={1}
              max={100}
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) {
                  onQuantityChange(Math.max(1, Math.min(100, val)));
                }
              }}
              className="w-24 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm font-mono focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
              aria-label="Number of IDs to generate"
            />
            <span className="text-xs text-gray-500 dark:text-slate-400">1 - 100</span>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={onGenerate}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors shadow-sm text-sm"
          title="Generate IDs"
        >
          Generate {quantity > 1 ? `${quantity} IDs` : 'ID'}
        </button>
      </div>
    </div>
  );
}
