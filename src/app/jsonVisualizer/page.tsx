'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import JsonView from './components/JsonView';

type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

export default function LearnJs() {
    const [jsonInput, setJsonInput] = useState('');
    const [parsedJson, setParsedJson] = useState<JSONValue | null>(null);
    const [error, setError] = useState<string>('');
    const [searchText, setSearchText] = useState('');
    const [searchLevel, setSearchLevel] = useState<string>('');
    const jsonViewRef = useRef(null);

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

    return (
        <div className="min-h-screen p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">JSON Visualizer</h1>
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
            <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2">
                    <textarea
                        className="w-full h-[calc(100vh-8rem)] p-4 font-mono text-sm border rounded-lg bg-gray-50 dark:bg-gray-800"
                        value={jsonInput}
                        onChange={(e) => handleJsonChange(e.target.value)}
                        placeholder="Paste your JSON here..."
                    />
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </div>
                <div className="w-full md:w-1/2">
                    <div className="mb-4 flex flex-wrap gap-2">
                        <div className="flex gap-2 items-center">
                            <input
                                type="text"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                placeholder="Search..."
                                className="border p-1 rounded"
                            />
                            <input
                                type="number"
                                value={searchLevel}
                                onChange={(e) => setSearchLevel(e.target.value)}
                                placeholder="Level"
                                className="border p-1 rounded w-20"
                                min="1"
                            />
                            <button
                                onClick={handleSearch}
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                Find
                            </button>
                        </div>
                    </div>
                    <div className="border rounded-lg p-4 overflow-auto bg-gray-50 dark:bg-gray-800 h-[calc(100vh-12rem)]">
                        {parsedJson && (
                            <JsonView 
                                ref={jsonViewRef}
                                data={parsedJson} 
                                onDelete={handleDelete}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
