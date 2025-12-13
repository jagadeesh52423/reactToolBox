'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import mermaid from 'mermaid';
import SampleDiagrams from '../components/SampleDiagrams';
import NodeStylePanel from './NodeStylePanel';

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse rounded">Loading editor...</div>
});

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
  const [renderTrigger, setRenderTrigger] = useState(0);
  const [showNodePanel, setShowNodePanel] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [diagramBgColor, setDiagramBgColor] = useState('#ffffff');
  const [showEditor, setShowEditor] = useState(true);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const renderCounterRef = useRef(0);

  // Ensure client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Initialize mermaid with improved configuration
  useEffect(() => {
    if (!mounted) return;

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
  }, [mounted]);

  // Auto-render diagram on initial load
  useEffect(() => {
    if (mounted && code.trim()) {
      // Delay to ensure mermaid is fully initialized
      const timer = setTimeout(() => {
        setRenderTrigger(prev => prev + 1);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [mounted, code]);
  
  // Separate effect for rendering to handle DOM updates safely
  useEffect(() => {
    if (!mounted || !renderTrigger || !code.trim()) return;
    
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
        
        // Use a counter instead of Date.now() to avoid hydration issues
        renderCounterRef.current += 1;
        const id = `mermaid-${renderCounterRef.current}`;
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
  }, [mounted, renderTrigger, code]);
  
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

  // Apply background color to the SVG container
  useEffect(() => {
    if (svgContainerRef.current) {
      svgContainerRef.current.style.backgroundColor = diagramBgColor;
    }
  }, [diagramBgColor, svgContent]);

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
      // Add background color to the SVG content
      let modifiedSvgContent = svgContent;

      // If background color is not white, add a background rectangle
      if (diagramBgColor !== '#ffffff') {
        // Parse the SVG to add background rectangle
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
        const svgElement = svgDoc.querySelector('svg');

        if (svgElement) {
          // Create background rectangle
          const backgroundRect = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'rect');
          backgroundRect.setAttribute('width', '100%');
          backgroundRect.setAttribute('height', '100%');
          backgroundRect.setAttribute('fill', diagramBgColor);

          // Insert background rectangle as first element
          svgElement.insertBefore(backgroundRect, svgElement.firstChild);

          // Serialize back to string
          modifiedSvgContent = new XMLSerializer().serializeToString(svgDoc);
        }
      }

      const blob = new Blob([modifiedSvgContent], { type: 'image/svg+xml' });
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

  // Parse style string into a map of property-value pairs
  const parseStyleString = (styleStr: string): Record<string, string> => {
    const styleObj: Record<string, string> = {};
    if (!styleStr) return styleObj;

    // Remove "style nodeId " prefix if it exists
    const cleanStyleStr = styleStr.replace(/^style\s+\w+\s+/, '');

    // Split by comma and extract property:value pairs
    cleanStyleStr.split(',').forEach(pair => {
      const [prop, val] = pair.split(':').map(s => s.trim());
      if (prop && val) {
        styleObj[prop] = val;
      }
    });

    return styleObj;
  };

  // Convert style object back to Mermaid style string
  const styleObjToString = (styleObj: Record<string, string>): string => {
    return Object.entries(styleObj)
      .map(([prop, val]) => `${prop}:${val}`)
      .join(',');
  };

  // Extract nodes from the current diagram code
  const nodes = useMemo(() => {
    const extractedNodes: Array<{id: string; label: string; styles: Record<string, string>}> = [];
    
    // Regular expression to match node definitions in a flowchart
    const nodeRegex = /\b([A-Za-z0-9_]+)(\[([^\]]*)\]|\{([^\}]*)\}|\(([^\)]*)\))/g;
    let match;
    
    while ((match = nodeRegex.exec(code)) !== null) {
      const id = match[1];
      const label = match[3] || match[4] || match[5] || id;
      
      // Check for styles for this node
      const styleRegex = new RegExp(`style\\s+${id}\\s+([^\\n]+)`, 'i');
      const styleMatch = code.match(styleRegex);
      
      const styles: Record<string, string> = {};
      if (styleMatch) {
        const styleStr = styleMatch[1];
        // Parse style string to object
        styleStr.split(',').forEach(pair => {
          const [prop, val] = pair.split(':').map(s => s.trim());
          if (prop && val) {
            styles[prop] = val;
          }
        });
      }
      
      extractedNodes.push({
        id,
        label,
        styles
      });
    }
    
    return extractedNodes;
  }, [code]);
  
  // Apply style change from the NodeStylePanel
  const handleNodeStyleChange = (nodeId: string, property: string, value: string) => {
    // Use functional update to prevent race conditions in bulk operations
    setCode(currentCode => {
      // Check if this node already has styling
      const existingStyleRegex = new RegExp(`style\\s+${nodeId}\\s+([^\\n]+)`, 'i');
      const existingStyleMatch = currentCode.match(existingStyleRegex);

      let newCode = currentCode;

      if (existingStyleMatch) {
        // Parse existing style
        const existingStyles = parseStyleString(existingStyleMatch[1]);

        // Update with new property value
        existingStyles[property] = value;

        // Create the new style declaration
        const newStyleDeclaration = `style ${nodeId} ${styleObjToString(existingStyles)}`;

        // Replace in the code
        newCode = currentCode.replace(existingStyleRegex, newStyleDeclaration);
      } else {
        // No existing style, create a new one
        const styleObj: Record<string, string> = {
          [property]: value
        };

        const styleDeclaration = `style ${nodeId} ${styleObjToString(styleObj)}`;

        if (currentCode.includes('style ')) {
          // Find the last style declaration
          const lines = currentCode.split('\n');
          let lastStyleIndex = -1;

          for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].trim().startsWith('style ')) {
              lastStyleIndex = i;
              break;
            }
          }

          if (lastStyleIndex !== -1) {
            // Insert after the last style
            lines.splice(lastStyleIndex + 1, 0, styleDeclaration);
            newCode = lines.join('\n');
          } else {
            // Couldn't find the style section, append to end
            newCode = `${currentCode}\n\n${styleDeclaration}`;
          }
        } else {
          // No existing styles, append to the end with a blank line
          newCode = `${currentCode}\n\n${styleDeclaration}`;
        }
      }

      return newCode;
    });

    // Trigger a re-render after a small delay
    setTimeout(() => {
      setRenderTrigger(prev => prev + 1);
    }, 100);
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
          <button
            onClick={() => setShowNodePanel(!showNodePanel)}
            className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded text-sm hover:bg-indigo-200"
          >
            {showNodePanel ? 'Hide Node Styles' : 'Show Node Styles'}
          </button>

          <button
            onClick={() => setShowEditor(!showEditor)}
            className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
          >
            {showEditor ? 'Hide Editor' : 'Show Editor'}
          </button>

          {/* Background Color Control */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Background:</label>
            {mounted && (
              <input
                type="color"
                value={diagramBgColor}
                onChange={(e) => setDiagramBgColor(e.target.value)}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                title="Diagram Background Color"
              />
            )}
          </div>
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

      <div className="flex flex-col space-y-4">
        {/* Node Style Panel */}
        {showNodePanel && svgContent && (
          <NodeStylePanel
            nodes={nodes}
            onStyleChange={handleNodeStyleChange}
          />
        )}

        <div className={`flex flex-col lg:flex-row gap-4 ${showEditor ? '' : 'lg:justify-center'}`}>
          {/* Editor Panel */}
          {showEditor && (
            <div className="w-full lg:w-1/2 transition-all duration-300">
              <div className="mb-2">
                <h2 className="text-lg font-semibold">Mermaid Code</h2>
              </div>
              <div className={`border rounded bg-white ${
                showNodePanel && svgContent
                  ? 'h-[calc(100vh-350px)]'
                  : 'h-[calc(100vh-280px)]'
              }`}>
                {mounted && (
                  <MonacoEditor
                    height="100%"
                    defaultLanguage="mermaid"
                    language="mermaid"
                    theme="vs"
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    options={{
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 14,
                      lineNumbers: 'on',
                      roundedSelection: false,
                      selectOnLineNumbers: true,
                      wordWrap: 'on',
                      automaticLayout: true,
                      tabSize: 2,
                      insertSpaces: true,
                      folding: true,
                      foldingStrategy: 'indentation',
                      renderLineHighlight: 'all',
                      cursorBlinking: 'smooth',
                      smoothScrolling: true,
                      contextmenu: true,
                      mouseWheelZoom: true,
                      multiCursorModifier: 'ctrlCmd',
                      bracketPairColorization: {
                        enabled: true,
                      },
                    }}
                  />
                )}
                {!mounted && (
                  <div className="w-full h-full bg-gray-100 animate-pulse rounded flex items-center justify-center">
                    <span className="text-gray-500">Loading editor...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SVG Output Panel */}
          <div className={`w-full transition-all duration-300 ${
            showEditor
              ? 'lg:w-1/2'
              : 'lg:w-4/5 lg:max-w-6xl lg:mx-auto'
          }`}>
            <div className="mb-2">
              <h2 className="text-lg font-semibold">Diagram Preview</h2>
            </div>
            <div className={`border rounded bg-white overflow-auto ${
              // Dynamic height calculation based on both editor and node panel visibility
              showEditor
                ? (showNodePanel && svgContent ? 'h-[calc(100vh-310px)]' : 'h-[calc(100vh-240px)]')
                : (showNodePanel && svgContent ? 'h-[calc(100vh-250px)]' : 'h-[calc(100vh-180px)]')
            }`}>
              {error && (
                <div className="text-red-500 bg-red-50 p-4 rounded border border-red-200 mb-4">
                  <strong>Error:</strong> {error}
                </div>
              )}
              <div className={`relative w-full flex items-center justify-center ${
                showEditor
                  ? (showNodePanel && svgContent ? 'h-[calc(100vh-310px)]' : 'h-[calc(100vh-240px)]')
                  : (showNodePanel && svgContent ? 'h-[calc(100vh-250px)]' : 'h-[calc(100vh-180px)]')
              } ${error ? 'h-[calc(100%-4rem)]' : ''}`}>
                {!svgContent && !error && !isRendering && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-center px-4">
                    {showEditor
                      ? 'Click "Render Diagram" to preview'
                      : (
                          <div>
                            <div className="text-lg mb-2">📊 Diagram Preview Mode</div>
                            <div className="text-sm">Editor is hidden for better viewing experience</div>
                            <div className="text-xs mt-2 opacity-75">
                              {showNodePanel && svgContent ? 'Node styling panel available above' : 'Render a diagram to see styling options'}
                            </div>
                          </div>
                        )
                    }
                  </div>
                )}
                {isRendering && (
                  <div className="absolute inset-0 flex items-center justify-center text-blue-500">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <div>Rendering diagram...</div>
                    </div>
                  </div>
                )}
                <div
                  ref={svgContainerRef}
                  className="w-full h-full flex items-center justify-center p-4"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MermaidEditor;
