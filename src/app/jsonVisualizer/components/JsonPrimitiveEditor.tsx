'use client';

import { useState } from 'react';
import { JSONValue } from '../models/JsonModels';
import { getJsonParserService } from '../services/JsonParserService';

interface JsonPrimitiveEditorProps {
    value: JSONValue;
    isHighlighted: boolean;
    onUpdate: (value: JSONValue) => void;
}

/**
 * JsonPrimitiveEditor Component
 *
 * Displays and allows inline editing of primitive JSON values.
 * Shows type-specific styling and validation.
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
        // Only allow editing primitives
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

    if (isEditing) {
        return (
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className={`border rounded px-1 py-0.5 text-sm font-mono focus:outline-none focus:ring-1 bg-white dark:bg-gray-800 ${
                            error
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                        }`}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                    <button
                        onClick={saveEdit}
                        className="text-sm bg-green-500 text-white px-2 py-0.5 rounded hover:bg-green-600 transition-colors"
                    >
                        Save
                    </button>
                    <button
                        onClick={cancelEdit}
                        className="text-sm bg-gray-500 text-white px-2 py-0.5 rounded hover:bg-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
                {error && (
                    <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
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
                    ${typeStyle.color} ${typeStyle.darkColor}
                    ${isHighlighted ? 'bg-yellow-200 dark:bg-yellow-800 px-1 rounded' : ''}
                    cursor-pointer hover:underline
                `}
                onClick={startEditing}
                title="Click to edit"
            >
                {JSON.stringify(value)}
            </span>
            <span
                className="text-xs opacity-50 bg-gray-100 dark:bg-gray-700 px-1 rounded"
                title={typeStyle.label}
            >
                {typeStyle.icon}
            </span>
        </div>
    );
}
