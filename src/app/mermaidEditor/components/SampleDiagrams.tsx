'use client';
import React, { useState } from 'react';

interface SampleDiagramsProps {
  onSelectSample: (code: string) => void;
  renderMode?: 'standard' | 'gradient';
}

interface SampleDiagram {
  name: string;
  code: string;
  type: 'flowchart' | 'other';
}

const SAMPLE_DIAGRAMS: SampleDiagram[] = [
  {
    name: "Decision Tree",
    type: 'flowchart',
    code: `graph TD
    A([Start]) --> B[Fetch data from API]
    B --> C{Response OK?}
    C -->|Yes| D[Process data]
    C -->|No| E[Log error & retry]
    D --> F[Save to database]
    F --> G([End])
    E -.-> B`
  },
  {
    name: "Sequence Diagram",
    type: 'other',
    code: `sequenceDiagram
    Alice->>Bob: Hello Bob
    Bob-->>Alice: Hi Alice!`
  },
  {
    name: "Class Diagram",
    type: 'other',
    code: `classDiagram
    class Animal {
      +String name
      +makeSound()
    }
    class Dog {
      +bark()
    }
    Animal <|-- Dog`
  },
  {
    name: "Simple Entity Diagram",
    type: 'other',
    code: `erDiagram
    CUSTOMER ||--o{ ORDER : places`
  },
  {
    name: "Gantt Chart",
    type: 'other',
    code: `gantt
    title Project Schedule
    dateFormat YYYY-MM-DD
    section Planning
    Design     : a1, 2023-01-01, 10d
    section Development
    Coding     : a2, after a1, 15d`
  }
];

const SampleDiagrams: React.FC<SampleDiagramsProps> = ({ onSelectSample, renderMode = 'standard' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState<string | null>(null);

  const filteredSamples = renderMode === 'gradient'
    ? SAMPLE_DIAGRAMS.filter(s => s.type === 'flowchart')
    : SAMPLE_DIAGRAMS;

  // Load a sample and close the dropdown
  const handleSelectSample = (code: string, name: string) => {
    onSelectSample(code);
    setSelectedSample(name);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-xs">
      {/* Dropdown trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-left bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
      >
        <span>{selectedSample || 'Select a sample diagram'}</span>
        <svg
          className={`w-5 h-5 ml-2 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg">
          <ul className="py-1 overflow-auto max-h-60">
            {filteredSamples.map((sample, index) => (
              <li key={index}>
                <button
                  onClick={() => handleSelectSample(sample.code, sample.name)}
                  className="block w-full px-4 py-2 text-sm text-left text-gray-900 dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none"
                >
                  {sample.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SampleDiagrams;
