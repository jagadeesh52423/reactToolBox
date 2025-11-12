'use client';
import { useState } from 'react';
import { JSONValue } from '../types';
import { getTypeStyles } from '../utils/jsonHelpers';

interface PrimitiveValueProps {
    data: JSONValue;
    isHighlighted: boolean;
    onUpdate?: (value: JSONValue) => void;
}

const PrimitiveValue: React.FC<PrimitiveValueProps> = ({ data, isHighlighted, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const [error, setError] = useState('');
    const { color, icon } = getTypeStyles(data);

    const startEditing = () => {
        if (typeof data === 'object' && data !== null) return;
        setIsEditing(true);
        setEditValue(JSON.stringify(data));
        setError('');
    };

    const saveEdit = () => {
        try {
            const parsedValue = JSON.parse(editValue);
            if (onUpdate) {
                onUpdate(parsedValue);
            }
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

    if (isEditing) {
        return (
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className={`border rounded px-1 py-0.5 text-sm font-mono focus:outline-none focus:ring-1 ${
                            error ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                        }`}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit();
                            if (e.key === 'Escape') cancelEdit();
                        }}
                        autoFocus
                    />
                    <button onClick={saveEdit} className="text-sm bg-green-500 text-white px-2 py-0.5 rounded hover:bg-green-600">Save</button>
                    <button onClick={cancelEdit} className="text-sm bg-gray-500 text-white px-2 py-0.5 rounded hover:bg-gray-600">Cancel</button>
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
                className={`${color} ${isHighlighted ? 'bg-yellow-200 dark:bg-yellow-800 px-1 rounded' : ''} cursor-pointer`}
                onClick={startEditing}
                title="Click to edit"
            >
                {JSON.stringify(data)}
            </span>
            <span className="text-xs opacity-50 bg-gray-100 dark:bg-gray-700 px-1 rounded" title="Value type">
                {icon}
            </span>
        </div>
    );
};

export default PrimitiveValue;
