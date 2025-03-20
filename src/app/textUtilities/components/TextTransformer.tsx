'use client';
import React, { useState } from 'react';
import { 
  toUpperCase, toLowerCase, toTitleCase, 
  toCamelCase, toPascalCase, toSnakeCase, toKebabCase,
  countCharacters, countWords, countLines,
  trimWhitespace, removeExtraSpaces, encodeURL, decodeURL
} from '../utils/textUtils';

const DEFAULT_TEXT = `This is some sample text.
It has multiple lines and some extra   spaces.
You can transform it using various text utilities.`;

interface TransformOption {
  id: string;
  label: string;
  transform: (text: string) => string;
  category: 'case' | 'format' | 'encoding' | 'counting';
}

const TextTransformer: React.FC = () => {
  const [inputText, setInputText] = useState(DEFAULT_TEXT);
  const [outputText, setOutputText] = useState('');
  const [activeCategory, setActiveCategory] = useState<'case' | 'format' | 'encoding' | 'counting'>('case');
  
  const transformOptions: TransformOption[] = [
    // Case transformations
    { id: 'uppercase', label: 'UPPERCASE', transform: toUpperCase, category: 'case' },
    { id: 'lowercase', label: 'lowercase', transform: toLowerCase, category: 'case' },
    { id: 'titlecase', label: 'Title Case', transform: toTitleCase, category: 'case' },
    { id: 'camelcase', label: 'camelCase', transform: toCamelCase, category: 'case' },
    { id: 'pascalcase', label: 'PascalCase', transform: toPascalCase, category: 'case' },
    { id: 'snakecase', label: 'snake_case', transform: toSnakeCase, category: 'case' },
    { id: 'kebabcase', label: 'kebab-case', transform: toKebabCase, category: 'case' },
    
    // Formatting
    { id: 'trim', label: 'Trim Whitespace', transform: trimWhitespace, category: 'format' },
    { id: 'singlespace', label: 'Remove Extra Spaces', transform: removeExtraSpaces, category: 'format' },
    
    // Encoding
    { id: 'encodeurl', label: 'URL Encode', transform: encodeURL, category: 'encoding' },
    { id: 'decodeurl', label: 'URL Decode', transform: decodeURL, category: 'encoding' },
    
    // Counting functions return different results - handle separately
    { id: 'countchars', label: 'Count Characters', transform: (t) => `Characters: ${countCharacters(t)}`, category: 'counting' },
    { id: 'countwords', label: 'Count Words', transform: (t) => `Words: ${countWords(t)}`, category: 'counting' },
    { id: 'countlines', label: 'Count Lines', transform: (t) => `Lines: ${countLines(t)}`, category: 'counting' },
  ];
  
  const handleTransform = (transformFn: (text: string) => string) => {
    setOutputText(transformFn(inputText));
  };
  
  const handleCopyOutput = () => {
    navigator.clipboard.writeText(outputText);
    alert('Text copied to clipboard!');
  };

  const filteredOptions = transformOptions.filter(option => option.category === activeCategory);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory('case')}
          className={`px-3 py-1 rounded ${activeCategory === 'case' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Case Conversion
        </button>
        <button
          onClick={() => setActiveCategory('format')}
          className={`px-3 py-1 rounded ${activeCategory === 'format' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Formatting
        </button>
        <button
          onClick={() => setActiveCategory('encoding')}
          className={`px-3 py-1 rounded ${activeCategory === 'encoding' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Encoding
        </button>
        <button
          onClick={() => setActiveCategory('counting')}
          className={`px-3 py-1 rounded ${activeCategory === 'counting' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Counting
        </button>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/2">
          <div className="mb-2 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Input Text</h2>
            <button
              onClick={() => setInputText('')}
              className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
            >
              Clear
            </button>
          </div>
          <textarea
            className="w-full h-64 p-3 border rounded font-mono text-sm"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to transform..."
          />
        </div>
        
        <div className="w-full lg:w-1/2">
          <div className="mb-2 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Output</h2>
            {outputText && (
              <button
                onClick={handleCopyOutput}
                className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
              >
                Copy
              </button>
            )}
          </div>
          <div className="w-full h-64 p-3 border rounded font-mono text-sm bg-gray-50 overflow-auto whitespace-pre-wrap">
            {outputText || 'Transformed output will appear here...'}
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Transformations</h3>
        <div className="flex flex-wrap gap-2">
          {filteredOptions.map(option => (
            <button
              key={option.id}
              onClick={() => handleTransform(option.transform)}
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-3">Quick Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-3 rounded">
            <p className="font-semibold">Characters:</p>
            <p>{countCharacters(inputText)}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="font-semibold">Words:</p>
            <p>{countWords(inputText)}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="font-semibold">Lines:</p>
            <p>{countLines(inputText)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextTransformer;
