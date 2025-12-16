'use client';
import React, { useRef } from 'react';

interface FileOperationsProps {
  onFileLoad: (content: string, filename: string) => void;
  onDownload: () => void;
  hasContent: boolean;
  disabled?: boolean;
}

/**
 * Component for file upload and download operations
 * Follows Single Responsibility Principle
 */
export const FileOperations: React.FC<FileOperationsProps> = ({
  onFileLoad,
  onDownload,
  hasContent,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      alert('Please select an HTML file (.html or .htm)');
      return;
    }

    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        onFileLoad(content, file.name);
      }
    };
    reader.onerror = () => {
      alert('Failed to read file');
    };
    reader.readAsText(file);

    // Reset input so the same file can be selected again
    event.target.value = '';
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-wrap gap-3 items-center bg-gray-50 border border-gray-300 rounded-lg p-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">File Operations:</span>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".html,.htm"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload HTML file"
      />

      {/* Upload button */}
      <button
        onClick={triggerFileInput}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
        aria-label="Upload HTML file"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        Upload HTML File
      </button>

      {/* Download button */}
      <button
        onClick={onDownload}
        disabled={!hasContent || disabled}
        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
        aria-label="Download formatted HTML"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Download Formatted
      </button>

      <div className="text-xs text-gray-500">
        Supported formats: .html, .htm
      </div>
    </div>
  );
};
