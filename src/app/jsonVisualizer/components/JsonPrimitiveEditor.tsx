'use client';

import { useState } from 'react';
import { JSONValue, JsonValueType, SearchOptions } from '../models/JsonModels';
import { getJsonParserService } from '../services/JsonParserService';
import { CheckIcon, XIcon } from '@/components/shared/Icons';
import HighlightedText from './HighlightedText';

interface JsonPrimitiveEditorProps {
    value: JSONValue;
    isHighlighted: boolean;
    searchOptions: SearchOptions;
    onUpdate: (value: JSONValue) => void;
}

export default function JsonPrimitiveEditor({
    value,
    isHighlighted,
    searchOptions,
    onUpdate
}: JsonPrimitiveEditorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const [error, setError] = useState('');

    const parserService = getJsonParserService();
    const typeStyle = parserService.getTypeStyle(value);

    const startEditing = () => {
        if (typeof value === 'object' && value !== null) return;
        setIsEditing(true);
        setEditValue(JSON.stringify(value));
        setError('');
    };

    const saveEdit = () => {
        try {
            const parsedValue = JSON.parse(editValue);
            onUpdate(parsedValue);
            setIsEditing(false);
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid JSON value');
        }
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setError('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            saveEdit();
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    };

    const getValueClass = () => {
        if (typeStyle.type === JsonValueType.NULL) return 'italic';
        return '';
    };

    const getValueCSSColor = () => {
        switch (typeStyle.type) {
            case JsonValueType.STRING: return 'var(--jv-string)';
            case JsonValueType.NUMBER: return 'var(--jv-number)';
            case JsonValueType.BOOLEAN: return 'var(--jv-boolean)';
            case JsonValueType.NULL: return 'var(--jv-null)';
            default: return 'var(--jv-text-secondary)';
        }
    };

    const getBadgeCSSStyle = (): React.CSSProperties => {
        switch (typeStyle.type) {
            case JsonValueType.STRING:
                return { background: 'rgba(5, 150, 105, 0.1)', color: 'var(--jv-string)', border: '1px solid rgba(5, 150, 105, 0.2)' };
            case JsonValueType.NUMBER:
                return { background: 'rgba(37, 99, 235, 0.1)', color: 'var(--jv-number)', border: '1px solid rgba(37, 99, 235, 0.2)' };
            case JsonValueType.BOOLEAN:
                return { background: 'rgba(124, 58, 237, 0.1)', color: 'var(--jv-boolean)', border: '1px solid rgba(124, 58, 237, 0.2)' };
            case JsonValueType.NULL:
                return { background: 'var(--jv-type-badge-bg)', color: 'var(--jv-null)', border: '1px solid rgba(100, 116, 139, 0.2)' };
            default:
                return { background: 'var(--jv-type-badge-bg)', color: 'var(--jv-text-muted)', border: '1px solid rgba(100, 116, 139, 0.2)' };
        }
    };

    if (isEditing) {
        return (
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="px-2 py-1 text-sm rounded-md focus:outline-none focus:ring-1"
                        style={{
                            background: 'var(--jv-bg-secondary)',
                            border: error ? '1px solid var(--jv-danger)' : '1px solid var(--jv-border)',
                            color: error ? 'var(--jv-danger)' : 'var(--jv-text-primary)',
                            fontFamily: 'var(--jv-font-mono)',
                        }}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                    <button
                        onClick={saveEdit}
                        className="p-1.5 rounded-md transition-colors"
                        style={{ background: 'rgba(5, 150, 105, 0.1)', color: 'var(--jv-success)' }}
                        title="Save (Enter)"
                    >
                        <CheckIcon size={14} />
                    </button>
                    <button
                        onClick={cancelEdit}
                        className="p-1.5 rounded-md transition-colors"
                        style={{ background: 'var(--jv-type-badge-bg)', color: 'var(--jv-text-muted)' }}
                        title="Cancel (Esc)"
                    >
                        <XIcon size={14} />
                    </button>
                </div>
                {error && (
                    <div
                        className="text-xs px-2 py-1 rounded"
                        style={{ color: 'var(--jv-danger)', background: 'rgba(239, 68, 68, 0.1)' }}
                    >
                        {error}
                    </div>
                )}
            </div>
        );
    }

    const displayValue = JSON.stringify(value);

    return (
        <div className="flex items-center gap-2">
            <span
                className={`text-sm cursor-pointer transition-all duration-150 hover:opacity-80 ${getValueClass()}`}
                style={{
                    color: getValueCSSColor(),
                    fontFamily: 'var(--jv-font-mono)',
                    ...(isHighlighted ? {
                        background: 'var(--jv-search-highlight)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        boxShadow: '0 0 0 1px rgba(250, 204, 21, 0.4)',
                    } : {}),
                }}
                onClick={startEditing}
                title="Click to edit"
            >
                {searchOptions.searchText ? (
                    <HighlightedText
                        text={displayValue}
                        searchOptions={searchOptions}
                    />
                ) : (
                    displayValue
                )}
            </span>
            <span
                className="px-1.5 py-0.5 text-[10px] font-medium rounded uppercase tracking-wide"
                style={getBadgeCSSStyle()}
                title={typeStyle.label}
            >
                {typeStyle.type === JsonValueType.STRING ? 'str' :
                 typeStyle.type === JsonValueType.NUMBER ? 'num' :
                 typeStyle.type === JsonValueType.BOOLEAN ? 'bool' :
                 typeStyle.type === JsonValueType.NULL ? 'null' : '?'}
            </span>
        </div>
    );
}
