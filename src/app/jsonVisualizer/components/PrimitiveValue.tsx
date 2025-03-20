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
    const { color, icon } = getTypeStyles(data);

    const startEditing = () => {
        if (typeof data === 'object' && data !== null) return;
        setIsEditing(true);
        setEditValue(JSON.stringify(data));
    };

    const saveEdit = () => {
        try {
            const parsedValue = JSON.parse(editValue);
            if (onUpdate) {
                onUpdate(parsedValue);
            }
            setIsEditing(false);
        } catch (err) {
            alert('Invalid JSON value: ' + err);
        }
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-2">
                <input 
                    type="text" 
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="border rounded px-1 py-0.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                    autoFocus
                />
                <button onClick={saveEdit} className="text-sm bg-green-500 text-white px-2 py-0.5 rounded">Save</button>
                <button onClick={() => setIsEditing(false)} className="text-sm bg-gray-500 text-white px-2 py-0.5 rounded">Cancel</button>
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
