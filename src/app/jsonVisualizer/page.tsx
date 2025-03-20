'use client';
import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import JsonView, { JsonViewRef } from './components/JsonView';

type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

const SAMPLE_JSON = `{
  "name": "JSON Visualizer",
  "version": "1.0.0",
  "features": ["Expand/Collapse", "Search", "Edit", "Delete"],
  "isAwesome": true,
  "author": {
    "name": "You",
    "role": "Developer"
  },
  "examples": [
    {"type": "string", "value": "text"},
    {"type": "number", "value": 42},
    {"type": "boolean", "value": true},
    {"type": "null", "value": null}
  ]
}`;

export default function JsonVisualizer() {
    const [jsonInput, setJsonInput] = useState('');
    const [parsedJson, setParsedJson] = useState<JSONValue | null>(null);
    const [error, setError] = useState<string>('');
    const [searchText, setSearchText] = useState('');
    const [searchLevel, setSearchLevel] = useState<string>('');
    const jsonViewRef = useRef<JsonViewRef>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize with sample JSON
    useState(() => {
        try {
            handleJsonChange(SAMPLE_JSON);
        } catch (error) {
            // If sample JSON fails, just start empty
        }
    });

    const handleDelete = (path: string[]) => {
        if (!parsedJson) return;
        
        if (confirm('Are you sure you want to delete this item?')) {
            try {
                // Create a deep clone of the original data
                const newJson = JSON.parse(JSON.stringify(parsedJson));
                
                if (path.length === 1) {
                    // Handle root level deletion
                    if (Array.isArray(newJson)) {
                        newJson.splice(parseInt(path[0]), 1);
                    } else {
                        delete newJson[path[0]];
                    }
                } else {
                    // Handle nested deletions
                    let current = newJson;
                    // Navigate to the parent of the target
                    for (let i = 0; i < path.length - 1; i++) {
                        current = current[path[i]];
                    }
                    
                    // Delete from parent
                    const lastKey = path[path.length - 1];
                    if (Array.isArray(current)) {
                        current.splice(parseInt(lastKey), 1);
                    } else if (typeof current === 'object' && current !== null) {
                        delete current[lastKey];
                    }
                }

                // Update both states
                setParsedJson(newJson);
                setJsonInput(JSON.stringify(newJson, null, 2));
            } catch (error) {
                console.error('Error during deletion:', error);
            }
        }
    };

    // Handle updating values
    const handleUpdate = (path: string[], newValue: JSONValue) => {
        if (!parsedJson) return;
        
        try {
            // Create a deep clone of the original data
            const newJson = JSON.parse(JSON.stringify(parsedJson));
            
            if (path.length === 0) {
                // Should not happen - can't update root
                return;
            }

            // Find the parent object/array
            let current = newJson;
            for (let i = 0; i < path.length - 1; i++) {
                current = current[path[i]];
            }
            
            // Update the value
            const lastKey = path[path.length - 1];
            current[lastKey] = newValue;

            // Update both states
            setParsedJson(newJson);
            setJsonInput(JSON.stringify(newJson, null, 2));
        } catch (error) {
            console.error('Error during update:', error);
        }
    };

    const handleJsonChange = (value: string) => {
        setJsonInput(value);
        try {
            const parsed: JSONValue = value ? JSON.parse(value) : null;
            setParsedJson(parsed);
            setError('');
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Invalid JSON format';
            setError(errorMessage);
            setParsedJson(null);
        }
    };

    const handleSearch = () => {
        const level = searchLevel ? parseInt(searchLevel) : undefined;
        if (jsonViewRef.current) {
            jsonViewRef.current.searchNodes(searchText, level);
        }
    };

    const handlePrettify = () => {
        try {
            const parsed = JSON.parse(jsonInput);
            const formatted = JSON.stringify(parsed, null, 2);
            setJsonInput(formatted);
        } catch (error) {
            // If not valid JSON, don't try to prettify
        }
    };

    const handleExpandAll = () => {
        if (jsonViewRef.current) {
            jsonViewRef.current.expandAll();
        }
    };
    
    const handleCollapseAll = () => {
        if (jsonViewRef.current) {
            jsonViewRef.current.collapseAll();
        }
    };

    const handleCopyAll = () => {
        navigator.clipboard.writeText(jsonInput);
    };

    const handleDownload = () => {
        if (!jsonInput) return;
        
        const blob = new Blob([jsonInput], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            handleJsonChange(content);
        };
        reader.readAsText(file);
    };

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="min-h-screen p-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">JSON Visualizer</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">View, edit, and explore JSON data</p>
                </div>
                <Link 
                    href="/" 
                    className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                >
                    <Image
                        className="dark:invert"
                        src="/vercel.svg"
                        alt="Vercel logomark"
                        width={20}
                        height={20}
                    />
                    Home
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-lg font-medium">JSON Input</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrettify}
                                    className="px-3 py-1.5 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm"
                                    title="Format JSON with proper indentation"
                                >
                                    Prettify
                                </button>
                                <button
                                    onClick={handleCopyAll}
                                    className="px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                                    title="Copy JSON to clipboard"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="w-full h-[calc(100vh-14rem)] p-4 font-mono text-sm border rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={jsonInput}
                            onChange={(e) => handleJsonChange(e.target.value)}
                            placeholder="Paste your JSON here..."
                            spellCheck="false"
                        />
                        {error && (
                            <div className="mt-2 p-2 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
                                {error}
                            </div>
                        )}
                        <div className="flex gap-2 mt-3">
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                accept="application/json" 
                                className="hidden" 
                                onChange={handleFileUpload}
                            />
                            <button
                                onClick={triggerFileUpload}
                                className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex-grow"
                            >
                                Import JSON
                            </button>
                            <button
                                onClick={handleDownload}
                                className="px-3 py-1.5 bg-cyan-500 text-white rounded hover:bg-cyan-600 text-sm flex-grow"
                                disabled={!jsonInput}
                            >
                                Download JSON
                            </button>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-lg font-medium">JSON Viewer</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleExpandAll}
                                    className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                >
                                    Expand All
                                </button>
                                <button
                                    onClick={handleCollapseAll}
                                    className="px-3 py-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                                >
                                    Collapse All
                                </button>
                            </div>
                        </div>
                        <div className="mb-3 flex flex-wrap gap-2 bg-white dark:bg-gray-900 p-2 rounded-lg border">
                            <div className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    placeholder="Search keys and values..."
                                    className="border p-1.5 rounded flex-grow min-w-[160px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <input
                                    type="number"
                                    value={searchLevel}
                                    onChange={(e) => setSearchLevel(e.target.value)}
                                    placeholder="Level"
                                    className="border p-1.5 rounded w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="1"
                                />
                                <button
                                    onClick={handleSearch}
                                    className="px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                        <div className="border rounded-lg p-4 overflow-auto bg-white dark:bg-gray-900 h-[calc(100vh-18rem)]">
                            {parsedJson ? (
                                <JsonView 
                                    ref={jsonViewRef}
                                    data={parsedJson} 
                                    onDelete={handleDelete}
                                    onUpdate={handleUpdate}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    {error ? 'Fix JSON errors to view' : 'Enter valid JSON to visualize'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
