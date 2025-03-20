'use client';
import React, { useState } from 'react';
import DiffViewer from './DiffViewer';

const DEFAULT_LEFT = { name: "John", age: 30, address: { city: "New York", zip: 10001 } };
const DEFAULT_RIGHT = { name: "John", age: 31, address: { city: "Boston", zip: "02108" } };

const JsonComparer: React.FC = () => {
  const [leftJson, setLeftJson] = useState<string>(JSON.stringify(DEFAULT_LEFT, null, 2));
  const [rightJson, setRightJson] = useState<string>(JSON.stringify(DEFAULT_RIGHT, null, 2));
  const [error, setError] = useState<string>('');
  const [showDiff, setShowDiff] = useState<boolean>(false);
  
  const validateJson = (json: string): boolean => {
    try {
      JSON.parse(json);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleCompare = () => {
    if (!validateJson(leftJson)) {
      setError('Invalid JSON in left editor');
      return;
    }
    
    if (!validateJson(rightJson)) {
      setError('Invalid JSON in right editor');
      return;
    }
    
    setError('');
    setShowDiff(true);
  };

  const formatJson = (side: 'left' | 'right') => {
    try {
      const json = side === 'left' ? leftJson : rightJson;
      const formatted = JSON.stringify(JSON.parse(json), null, 2);
      if (side === 'left') {
        setLeftJson(formatted);
      } else {
        setRightJson(formatted);
      }
      setError('');
    } catch (e) {
      setError(`Invalid JSON in ${side} editor`);
    }
  };

  return (
    <div>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="w-full md:w-1/2">
          <div className="flex justify-between mb-2">
            <h2 className="text-lg font-semibold">Left JSON</h2>
            <button
              onClick={() => formatJson('left')}
              className="bg-gray-200 hover:bg-gray-300 rounded px-3 py-1 text-sm"
            >
              Format
            </button>
          </div>
          <textarea
            className="w-full h-64 font-mono p-2 border rounded"
            value={leftJson}
            onChange={(e) => setLeftJson(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-1/2">
          <div className="flex justify-between mb-2">
            <h2 className="text-lg font-semibold">Right JSON</h2>
            <button
              onClick={() => formatJson('right')}
              className="bg-gray-200 hover:bg-gray-300 rounded px-3 py-1 text-sm"
            >
              Format
            </button>
          </div>
          <textarea
            className="w-full h-64 font-mono p-2 border rounded"
            value={rightJson}
            onChange={(e) => setRightJson(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={handleCompare}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Compare JSON
        </button>
      </div>
      
      {showDiff && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Differences</h2>
          <DiffViewer left={leftJson} right={rightJson} />
        </div>
      )}
    </div>
  );
};

export default JsonComparer;
