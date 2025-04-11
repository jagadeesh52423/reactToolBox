'use client';
import React, { useState } from 'react';

interface SampleDiagramsProps {
  onSelectSample: (code: string) => void;
}

const SAMPLE_DIAGRAMS = [
  {
    name: "Simple Flowchart",
    code: `graph LR
    A[First] --> B[Second] --> C[Third]`
  },
  {
    name: "Basic Flowchart with Labels",
    code: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Success]
    B -->|No| D[Try Again]
    D --> A`
  },
  {
    name: "Decision Tree",
    code: `graph TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]`
  },
  {
    name: "Sequence Diagram",
    code: `sequenceDiagram
    Alice->>Bob: Hello Bob
    Bob-->>Alice: Hi Alice!`
  },
  {
    name: "Class Diagram",
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
    code: `erDiagram
    CUSTOMER ||--o{ ORDER : places`
  },
  {
    name: "Gantt Chart",
    code: `gantt
    title Project Schedule
    dateFormat YYYY-MM-DD
    section Planning
    Design     : a1, 2023-01-01, 10d
    section Development
    Coding     : a2, after a1, 15d`
  }
];

const SampleDiagrams: React.FC<SampleDiagramsProps> = ({ onSelectSample }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState<string | null>(null);

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
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-left bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <ul className="py-1 overflow-auto max-h-60">
            {SAMPLE_DIAGRAMS.map((sample, index) => (
              <li key={index}>
                <button
                  onClick={() => handleSelectSample(sample.code, sample.name)}
                  className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 focus:outline-none"
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
