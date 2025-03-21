'use client';
import React, { useState, useMemo } from 'react';
import { computeDiff, DiffResult } from '../utils/diffUtils';

const DEFAULT_TEXT_LEFT = `This is a sample text.
It has multiple lines.
We will compare this with another text.
This line will be removed.
This line will stay the same.`;

const DEFAULT_TEXT_RIGHT = `This is a sample text.
It has multiple lines with some changes.
We will compare this with another text.
This line will stay the same.
This is a new line added to the right text.`;

const TextDiffViewer: React.FC = () => {
  const [leftText, setLeftText] = useState(DEFAULT_TEXT_LEFT);
  const [rightText, setRightText] = useState(DEFAULT_TEXT_RIGHT);
  const [showDiff, setShowDiff] = useState(false);

  const diffResult = useMemo(() => {
    if (!showDiff) return { left: [], right: [] };
    return computeDiff(leftText, rightText);
  }, [leftText, rightText, showDiff]);

  const handleCompare = () => {
    setShowDiff(true);
  };

  const renderDiffLine = (line: string, type: string, lineNumber: number) => {
    const bgColor = type === 'added' ? 'bg-green-100' 
                  : type === 'removed' ? 'bg-red-100'
                  : type === 'changed' ? 'bg-yellow-100'
                  : '';
    const textColor = type === 'added' ? 'text-green-800' 
                    : type === 'removed' ? 'text-red-800'
                    : type === 'changed' ? 'text-yellow-800'
                    : '';
    
    return (
      <div className={`py-1 ${bgColor} ${textColor} px-2 font-mono whitespace-pre-wrap break-all flex`}>
        {lineNumber > 0 && (
          <div className="w-8 flex-shrink-0 text-gray-500 text-xs mr-2 text-right pr-2 border-r border-gray-300">
            {lineNumber}
          </div>
        )}
        <div className="flex-grow">
          {line || ' '}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-1/2">
          <div className="mb-2">
            <h2 className="text-lg font-semibold">Left Text</h2>
          </div>
          <textarea 
            className="w-full h-60 p-2 border rounded font-mono"
            value={leftText}
            onChange={(e) => setLeftText(e.target.value)}
          />
        </div>
        <div className="w-full lg:w-1/2">
          <div className="mb-2">
            <h2 className="text-lg font-semibold">Right Text</h2>
          </div>
          <textarea 
            className="w-full h-60 p-2 border rounded font-mono"
            value={rightText}
            onChange={(e) => setRightText(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-center mt-4 mb-6">
        <button
          onClick={handleCompare}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Compare Text
        </button>
      </div>

      {showDiff && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Differences</h2>
          <div className="flex flex-col lg:flex-row gap-4 border rounded overflow-hidden">
            <div className="w-full lg:w-1/2 border-r">
              <div className="bg-gray-100 p-2 font-semibold border-b">Left Text</div>
              <div>
                {diffResult.left.map((item, index) => (
                  <div key={`left-${index}`} className="border-b last:border-b-0">
                    {renderDiffLine(item.text, item.type, item.lineNumber)}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="bg-gray-100 p-2 font-semibold border-b">Right Text</div>
              <div>
                {diffResult.right.map((item, index) => (
                  <div key={`right-${index}`} className="border-b last:border-b-0">
                    {renderDiffLine(item.text, item.type, item.lineNumber)}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-100"></div>
              <span>Removed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-100"></div>
              <span>Added</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-yellow-100"></div>
              <span>Changed</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextDiffViewer;
