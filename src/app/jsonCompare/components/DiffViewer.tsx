'use client';
import React, { useMemo } from 'react';

interface DiffViewerProps {
  left: string;
  right: string;
}

interface Difference {
  path: string;
  leftValue?: any;
  rightValue?: any;
  type: 'added' | 'removed' | 'changed';
}

const DiffViewer: React.FC<DiffViewerProps> = ({ left, right }) => {
  const differences = useMemo(() => {
    try {
      const leftObj = JSON.parse(left);
      const rightObj = JSON.parse(right);
      return findDifferences(leftObj, rightObj);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return [];
    }
  }, [left, right]);

  // Function to find differences between two objects
  function findDifferences(left: any, right: any, path = ''): Difference[] {
    if (left === right) return [];
    
    // Different types
    if (typeof left !== typeof right) {
      return [{ path, leftValue: left, rightValue: right, type: 'changed' }];
    }
    
    // Primitive values that are different
    if (typeof left !== 'object' || left === null || right === null) {
      return [{ path, leftValue: left, rightValue: right, type: 'changed' }];
    }
    
    const differences: Difference[] = [];
    const allKeys = new Set([...Object.keys(left), ...Object.keys(right)]);
    
    for (const key of allKeys) {
      const currentPath = path ? `${path}.${key}` : key;
      
      // Key exists in left but not in right
      if (!(key in right)) {
        differences.push({ 
          path: currentPath, 
          leftValue: left[key], 
          type: 'removed' 
        });
        continue;
      }
      
      // Key exists in right but not in left
      if (!(key in left)) {
        differences.push({ 
          path: currentPath, 
          rightValue: right[key], 
          type: 'added' 
        });
        continue;
      }
      
      // Recursively compare nested objects
      differences.push(...findDifferences(left[key], right[key], currentPath));
    }
    
    return differences;
  }

  return (
    <div className="border rounded">
      {differences.length === 0 ? (
        <div className="p-4 text-center text-green-600 bg-green-50">
          JSON objects are identical!
        </div>
      ) : (
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border-b text-left">Path</th>
              <th className="px-4 py-2 border-b text-left">Type</th>
              <th className="px-4 py-2 border-b text-left">Left Value</th>
              <th className="px-4 py-2 border-b text-left">Right Value</th>
            </tr>
          </thead>
          <tbody>
            {differences.map((diff, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b font-mono">{diff.path}</td>
                <td className={`px-4 py-2 border-b ${
                  diff.type === 'added' ? 'text-green-600' : 
                  diff.type === 'removed' ? 'text-red-600' : 'text-amber-600'
                }`}>
                  {diff.type}
                </td>
                <td className="px-4 py-2 border-b font-mono">
                  {diff.leftValue !== undefined ? JSON.stringify(diff.leftValue) : '-'}
                </td>
                <td className="px-4 py-2 border-b font-mono">
                  {diff.rightValue !== undefined ? JSON.stringify(diff.rightValue) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DiffViewer;
