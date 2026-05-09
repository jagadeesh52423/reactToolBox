'use client';

import { useState, useRef, useEffect } from 'react';
import { JSONValue, AddNodeFormProps } from '../models/JsonModels';
import { CheckIcon, XIcon } from '@/components/shared/Icons';

export default function AddNodeForm({ parentPath, isArray, onAdd, onCancel }: AddNodeFormProps) {
  const [key, setKey] = useState('');
  const [valueType, setValueType] = useState<'string' | 'number' | 'boolean' | 'null' | 'object' | 'array'>('string');
  const [valueInput, setValueInput] = useState('');
  const keyInputRef = useRef<HTMLInputElement>(null);
  const valueInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isArray) {
      valueInputRef.current?.focus();
    } else {
      keyInputRef.current?.focus();
    }
  }, [isArray]);

  const handleSubmit = () => {
    const k = isArray ? String(Date.now()) : key.trim();
    if (!isArray && !k) return;

    let parsedValue: JSONValue;
    switch (valueType) {
      case 'string':
        parsedValue = valueInput;
        break;
      case 'number':
        parsedValue = Number(valueInput) || 0;
        break;
      case 'boolean':
        parsedValue = valueInput === 'true';
        break;
      case 'null':
        parsedValue = null;
        break;
      case 'object':
        parsedValue = {};
        break;
      case 'array':
        parsedValue = [];
        break;
      default:
        parsedValue = valueInput;
    }
    onAdd(k, parsedValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div
      className="jv-animate-slide-down flex items-center gap-2 py-1.5 px-2 ml-4 rounded-lg"
      style={{ background: 'var(--jv-bg-active)', border: '1px solid var(--jv-border-focus)' }}
    >
      {/* Key input (hidden for arrays) */}
      {!isArray && (
        <>
          <input
            ref={keyInputRef}
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="key"
            className="w-24 px-2 py-1 text-xs rounded border focus:outline-none focus:ring-1"
            style={{
              background: 'var(--jv-bg-secondary)',
              borderColor: 'var(--jv-border)',
              color: 'var(--jv-key)',
              fontFamily: 'var(--jv-font-mono)',
            }}
          />
          <span style={{ color: 'var(--jv-text-muted)' }}>:</span>
        </>
      )}

      {/* Type selector */}
      <select
        value={valueType}
        onChange={(e) => setValueType(e.target.value as typeof valueType)}
        className="px-1.5 py-1 text-xs rounded border focus:outline-none cursor-pointer"
        style={{
          background: 'var(--jv-bg-secondary)',
          borderColor: 'var(--jv-border)',
          color: 'var(--jv-text-secondary)',
          fontFamily: 'var(--jv-font-sans)',
        }}
      >
        <option value="string">String</option>
        <option value="number">Number</option>
        <option value="boolean">Boolean</option>
        <option value="null">Null</option>
        <option value="object">Object</option>
        <option value="array">Array</option>
      </select>

      {/* Value input (adapts to type) */}
      {valueType === 'boolean' ? (
        <select
          value={valueInput || 'true'}
          onChange={(e) => setValueInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-20 px-2 py-1 text-xs rounded border focus:outline-none cursor-pointer"
          style={{
            background: 'var(--jv-bg-secondary)',
            borderColor: 'var(--jv-border)',
            color: 'var(--jv-boolean)',
            fontFamily: 'var(--jv-font-mono)',
          }}
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      ) : valueType === 'null' || valueType === 'object' || valueType === 'array' ? (
        <span
          className="text-xs px-2 py-1 italic"
          style={{ color: 'var(--jv-text-muted)', fontFamily: 'var(--jv-font-mono)' }}
        >
          {valueType === 'null' ? 'null' : valueType === 'object' ? '{}' : '[]'}
        </span>
      ) : (
        <input
          ref={valueInputRef}
          type={valueType === 'number' ? 'number' : 'text'}
          value={valueInput}
          onChange={(e) => setValueInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="value"
          autoFocus={isArray}
          className="w-32 px-2 py-1 text-xs rounded border focus:outline-none focus:ring-1"
          style={{
            background: 'var(--jv-bg-secondary)',
            borderColor: 'var(--jv-border)',
            color: valueType === 'string' ? 'var(--jv-string)' : 'var(--jv-number)',
            fontFamily: 'var(--jv-font-mono)',
          }}
        />
      )}

      {/* Action buttons */}
      <button
        onClick={handleSubmit}
        className="p-1 rounded transition-colors"
        style={{ color: 'var(--jv-success)' }}
        title="Add (Enter)"
      >
        <CheckIcon size={14} />
      </button>
      <button
        onClick={onCancel}
        className="p-1 rounded transition-colors"
        style={{ color: 'var(--jv-text-muted)' }}
        title="Cancel (Esc)"
      >
        <XIcon size={14} />
      </button>
    </div>
  );
}
