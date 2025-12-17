'use client';

import { useState } from 'react';
import { JSONValue, JsonValueType } from '../models/JsonModels';
import { getJsonParserService } from '../services/JsonParserService';
import { CheckIcon, XIcon } from './Icons';

interface JsonPrimitiveEditorProps {
    value: JSONValue;
    isHighlighted: boolean;
    onUpdate: (value: JSONValue) => void;
}

/**
 * JsonPrimitiveEditor Component - Professional Redesign
 *
 * Displays and allows inline editing of primitive JSON values.
 * Features type-colored values and smooth edit transitions.
 */
export default function JsonPrimitiveEditor({
    value,
    isHighlighted,
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

    // Get color based on type
    const getValueColor = () => {
        switch (typeStyle.type) {
            case JsonValueType.STRING:
                return 'text-emerald-400';
            case JsonValueType.NUMBER:
                return 'text-blue-400';
            case JsonValueType.BOOLEAN:
                return 'text-purple-400';
            case JsonValueType.NULL:
                return 'text-slate-500 italic';
            default:
                return 'text-slate-300';
        }
    };

    // Get badge styling based on type
    const getBadgeStyle = () => {
        switch (typeStyle.type) {
            case JsonValueType.STRING:
                return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case JsonValueType.NUMBER:
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case JsonValueType.BOOLEAN:
                return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case JsonValueType.NULL:
                return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
            default:
                return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
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
                        className={`
                            px-2 py-1 text-sm font-mono rounded-md
                            bg-slate-800 border focus:outline-none focus:ring-1
                            ${error
                                ? 'border-red-500/50 focus:ring-red-500/30 text-red-300'
                                : 'border-slate-600 focus:ring-indigo-500/30 text-slate-200'
                            }
                        `}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                    <button
                        onClick={saveEdit}
                        className="p-1.5 rounded-md bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-colors"
                        title="Save (Enter)"
                    >
                        <CheckIcon size={14} />
                    </button>
                    <button
                        onClick={cancelEdit}
                        className="p-1.5 rounded-md bg-slate-600/20 text-slate-400 hover:bg-slate-600/30 transition-colors"
                        title="Cancel (Esc)"
                    >
                        <XIcon size={14} />
                    </button>
                </div>
                {error && (
                    <div className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">
                        {error}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <span
                className={`
                    font-mono text-sm cursor-pointer transition-all duration-150
                    hover:opacity-80
                    ${getValueColor()}
                    ${isHighlighted ? 'bg-yellow-500/20 px-1.5 py-0.5 rounded ring-1 ring-yellow-500/40' : ''}
                `}
                onClick={startEditing}
                title="Click to edit"
            >
                {JSON.stringify(value)}
            </span>
            <span
                className={`
                    px-1.5 py-0.5 text-[10px] font-medium rounded border uppercase tracking-wide
                    ${getBadgeStyle()}
                `}
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
