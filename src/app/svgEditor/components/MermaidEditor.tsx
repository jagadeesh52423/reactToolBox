'use client';
import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import SampleDiagrams from '../components/SampleDiagrams';

// Updated the default diagram with more spacing and simpler structure
const DEFAULT_DIAGRAM = `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Success]
    B -->|No| D[Try Again]
    D --> A`;

const MermaidEditor: React.FC = () => {
  const [code, setCode] = useState(DEFAULT_DIAGRAM);
  const [error, setError] = useState<string>('');
  const [isRendering, setIsRendering] = useState(false);
  const [svgContent, setSvgContent] = useState<string>('');
  const [renderTrigger, setRenderTrigger] = useState(0); // Used to trigger rendering
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  
  // Initialize mermaid with improved configuration
  useEffect(() => {
    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        er: { useMaxWidth: false },
        flowchart: { 
          useMaxWidth: false,
          htmlLabels: true,
          curve: 'basis',
          rankSpacing: 80,
          nodeSpacing: 50,
          diagramPadding: 8,
        },
        sequence: { useMaxWidth: false },
        gantt: { useMaxWidth: false },
        logLevel: 'fatal',
      });
    } catch (err) {
      console.error("Failed to initialize mermaid:", err);
    }
  }, []);
  
  // Separate effect for rendering to handle DOM updates safely
  useEffect(() => {
    if (!renderTrigger || !code.trim()) return;
    
    const renderSvg = async () => {
      setIsRendering(true);
      setError('');
      
      try {
        // Pre-process the code
        let processedCode = code;
        processedCode = processedCode.replace(/(\w+)\s+--\s+([^-]+)\s+-->\s+(\w+)/g, '$1 -->|$2| $3');
        
        // Create a temporary container that's not in the React tree
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.width = '1200px';
        tempContainer.style.height = '800px';
        
        // Append to body instead of the React tree
        document.body.appendChild(tempContainer);
        
        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, processedCode, tempContainer);
        
        // Store the SVG content in state
        setSvgContent(svg);
        
        // Clean up the temporary container
        if (document.body.contains(tempContainer)) {
          document.body.removeChild(tempContainer);
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        
        // Provide better error messages
        let errorMessage = "Failed to render diagram. ";
        
        const errorStr = String(err);
        if (errorStr.includes("suitable point for the given distance")) {
          errorMessage += "There might be an issue with edge label positioning. Try the following:\n" +
                         "1. Use '-->|Label|' syntax instead of '-- Label -->'\n" + 
                         "2. Add more space between nodes (add more text in node labels)\n" +
                         "3. Try a simpler diagram first";
        } else if (code.includes('erDiagram')) {
          errorMessage += "ER diagrams are complex and may require simpler notation. Try a basic example first.";
        } else if (code.includes('classDiagram')) {
          errorMessage += "Check your class diagram syntax for proper formatting.";
        } else {
          errorMessage += err instanceof Error ? err.message : 'Please check your syntax.';
        }
        
        setError(errorMessage);
        setSvgContent('');
      } finally {
        setIsRendering(false);
      }
    };
    
    renderSvg();
  }, [renderTrigger, code]);
  
  // Separate effect to update the DOM with SVG content after React updates
  useEffect(() => {
    if (!svgContent || !svgContainerRef.current) return;
    
    // Safely update the container after React has updated the DOM
    const updateSvgContainer = () => {
      if (svgContainerRef.current) {
        // Clear the container
        svgContainerRef.current.innerHTML = '';
        
        // Create a wrapper div for the SVG
        const wrapper = document.createElement('div');
        wrapper.className = 'flex justify-center items-center w-full';
        wrapper.innerHTML = svgContent;
        
        // Append the wrapper
        svgContainerRef.current.appendChild(wrapper);
      }
    };
    
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(updateSvgContainer);
    
    // Cleanup function to prevent memory leaks
    return () => {
      if (svgContainerRef.current) {
        svgContainerRef.current.innerHTML = '';
      }
    };
  }, [svgContent]);

  // Trigger rendering instead of directly rendering
  const renderDiagram = () => {
    if (!code.trim()) {
      setError('Please enter some Mermaid diagram code.');
      return;
    }
    
    // Just increment the trigger to cause the useEffect to run
    setRenderTrigger(prev => prev + 1);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCode(content);
    };
    reader.readAsText(file);
  };
  
  // Download SVG function with improved error handling
  const handleDownloadSvg = () => {
    if (!svgContent) {
      setError('No SVG to download. Please render the diagram first.');
      return;
    }

    try {
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary anchor element
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diagram.svg';
      a.style.display = 'none';
      
      // Use a safer approach that doesn't leave elements in the DOM
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading SVG:", err);
      setError("Failed to download SVG. Please try again.");
    }
  };

  // Enhanced sample loading that fixes common issues
  const loadSample = (sampleCode: string) => {
    // Pre-process the code
    let processedCode = sampleCode;
    processedCode = processedCode.replace(/(\w+)\s+--\s+([^-]+)\s+-->\s+(\w+)/g, '$1 -->|$2| $3');
    
    setCode(processedCode);
    setError('');
    setSvgContent('');
    
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-2">
        <div className="flex-grow flex items-center gap-2">
          <input
            type="file"
            id="fileInput"
            accept=".txt,.md,.mmd"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => document.getElementById('fileInput')?.click()}
            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
          >
            Load File
          </button>
          <button
            onClick={() => setCode('')}
            className="px-3 py-1.5 bg-gray-200 rounded text-sm hover:bg-gray-300"
          >
            Clear
          </button>
          <SampleDiagrams onSelectSample={loadSample} />
        </div>
        <div className="flex gap-2">
          <button
            onClick={renderDiagram}
            disabled={isRendering}
            className="px-4 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {isRendering ? 'Rendering...' : 'Render Diagram'}
          </button>
          <button
            onClick={handleDownloadSvg}
            disabled={!svgContent}
            className="px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            Download SVG
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Editor Panel */}
        <div className="w-full lg:w-1/2">
          <div className="mb-2">
            <h2 className="text-lg font-semibold">Mermaid Code</h2>
          </div>
          <textarea
            ref={editorRef}
            className="w-full h-[calc(100vh-240px)] p-4 border rounded font-mono text-sm"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter Mermaid diagram code here..."
            spellCheck="false"
          />
        </div>
        
        {/* SVG Output Panel */}
        <div className="w-full lg:w-1/2">
          <div className="mb-2">
            <h2 className="text-lg font-semibold">Diagram Preview</h2>
          </div>
          <div className="border rounded bg-white p-4 h-[calc(100vh-240px)] overflow-auto">
            {error && (
              <div className="text-red-500 bg-red-50 p-4 rounded border border-red-200 mb-4">
                <strong>Error:</strong> {error}
              </div>
            )}
            <div className="relative w-full h-full" style={{ minHeight: "calc(100vh - 280px)" }}>
              {!svgContent && !error && !isRendering && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  Click "Render Diagram" to preview
                </div>
              )}
              {isRendering && (
                <div className="absolute inset-0 flex items-center justify-center text-blue-500">
                  Rendering diagram...
                </div>
              )}
              <div 
                ref={svgContainerRef}
                className="w-full h-full flex items-center justify-center"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MermaidEditor;
