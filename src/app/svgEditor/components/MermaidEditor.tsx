'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import mermaid from 'mermaid';
import SampleDiagrams from '../components/SampleDiagrams';
import ColorPalette from './ColorPalette';
import NodeStylePanel from './NodeStylePanel';

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
  const [showColorHelp, setShowColorHelp] = useState(false);
  const [showNodePanel, setShowNodePanel] = useState(true);
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

  // Improved color style application that merges styles properly
  const applyColorStyle = (styleText: string) => {
    if (!editorRef.current) return;
    
    const textarea = editorRef.current;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    
    if (selectionStart === selectionEnd) {
      // No selection, just inform user what to do
      setError('Please select a node or edge in your code first, then apply a color');
      return;
    }
    
    // Get the selected text
    const selectedText = code.substring(selectionStart, selectionEnd);
    
    // Extract node ID from various formats
    let nodeId = null;
    
    // Match node patterns: A[Text] or B{Text} or C(Text)
    const nodeMatch = selectedText.match(/^([A-Za-z0-9_]+)(\[.*\]|\(.*\)|{.*})$/);
    if (nodeMatch) {
      // It's a node with a label, extract just the ID
      nodeId = nodeMatch[1];
    } else if (selectedText.match(/^[A-Za-z0-9_]+$/)) {
      // It's just a node ID without a label
      nodeId = selectedText;
    } else {
      setError('Please select a valid node ID or node definition to apply a style');
      return;
    }
    
    // Parse the new style to apply
    const newStyleProps = parseStyleString(styleText);
    
    // Check if this node already has styling
    const existingStyleRegex = new RegExp(`style\\s+${nodeId}\\s+([^\\n]+)`, 'i');
    const existingStyleMatch = code.match(existingStyleRegex);
    
    let styleDeclaration = '';
    
    if (existingStyleMatch) {
      // Parse existing style string to object
      const existingStyleProps = parseStyleString(existingStyleMatch[1]);
      
      // Merge styles - new style properties override existing ones
      const mergedStyle = { ...existingStyleProps, ...newStyleProps };
      
      // Generate the new style string
      styleDeclaration = `style ${nodeId} ${styleObjToString(mergedStyle)}`;
      
      // Replace the existing style
      const newCode = code.replace(existingStyleRegex, styleDeclaration);
      setCode(newCode);
    } else {
      // No existing style for this node
      styleDeclaration = `style ${nodeId} ${styleText}`;
      
      // Determine where to append the style
      if (code.includes('style ')) {
        // Append to the end of the existing styles section
        // First, find the last style declaration
        const lines = code.split('\n');
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
          setCode(lines.join('\n'));
        } else {
          // Couldn't find the style section, append to end
          setCode(`${code}\n\n${styleDeclaration}`);
        }
      } else {
        // No existing styles, append to the end with a blank line
        setCode(`${code}\n\n${styleDeclaration}`);
      }
    }
    
    // Keep selection on the original node
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.setSelectionRange(selectionStart, selectionEnd);
        editorRef.current.focus();
      }
    }, 0);
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
    // Check if this node already has styling
    const existingStyleRegex = new RegExp(`style\\s+${nodeId}\\s+([^\\n]+)`, 'i');
    const existingStyleMatch = code.match(existingStyleRegex);
    
    let newCode = code;
    
    if (existingStyleMatch) {
      // Parse existing style
      const existingStyles = parseStyleString(existingStyleMatch[1]);
      
      // Update with new property value
      existingStyles[property] = value;
      
      // Create the new style declaration
      const newStyleDeclaration = `style ${nodeId} ${styleObjToString(existingStyles)}`;
      
      // Replace in the code
      newCode = code.replace(existingStyleRegex, newStyleDeclaration);
    } else {
      // No existing style, create a new one
      const styleObj: Record<string, string> = {
        [property]: value
      };
      
      const styleDeclaration = `style ${nodeId} ${styleObjToString(styleObj)}`;
      
      if (code.includes('style ')) {
        // Find the last style declaration
        const lines = code.split('\n');
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
          newCode = `${code}\n\n${styleDeclaration}`;
        }
      } else {
        // No existing styles, append to the end with a blank line
        newCode = `${code}\n\n${styleDeclaration}`;
      }
    }
    
    // Update the code
    setCode(newCode);
    
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
          <ColorPalette onColorSelect={(style, name) => applyColorStyle(style)} />
          <button
            onClick={() => setShowColorHelp(!showColorHelp)}
            className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded text-sm hover:bg-amber-200"
          >
            {showColorHelp ? 'Hide Help' : 'Color Help'}
          </button>
          <button
            onClick={() => setShowNodePanel(!showNodePanel)}
            className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded text-sm hover:bg-indigo-200"
          >
            {showNodePanel ? 'Hide Node Panel' : 'Show Node Panel'}
          </button>
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
      
      {/* Color Help Section */}
      {showColorHelp && (
        <div className="bg-yellow-50 p-4 rounded-lg mb-4">
          <h3 className="font-semibold mb-2">How to use colors in Mermaid:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm mb-1">For nodes:</h4>
              <pre className="bg-white p-2 rounded text-xs">
{`A[My Node]
style A fill:#f9a,stroke:#333,stroke-width:2px`}
              </pre>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">For classDefs (multiple nodes):</h4>
              <pre className="bg-white p-2 rounded text-xs">
{`classDef important fill:#f96,stroke:#333,stroke-width:2px
class A,B important`}
              </pre>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Colored links:</h4>
              <pre className="bg-white p-2 rounded text-xs">
{`A --> B
linkStyle 0 stroke:#f00,stroke-width:2px`}
              </pre>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Using the color picker:</h4>
              <p className="text-xs">1. Select a node in the editor (e.g., "A[Start]")</p>
              <p className="text-xs">2. Choose a color from the palette</p>
              <p className="text-xs">3. The style will be applied automatically</p>
            </div>
          </div>
        </div>
      )}

      {/* Node Style Panel */}
      {showNodePanel && svgContent && (
        <NodeStylePanel 
          nodes={nodes} 
          onStyleChange={handleNodeStyleChange} 
        />
      )}

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Editor Panel */}
        <div className="w-full lg:w-1/2">
          <div className="mb-2">
            <h2 className="text-lg font-semibold">Mermaid Code</h2>
          </div>
          <textarea
            ref={editorRef}
            className="w-full h-[calc(100vh-280px)] p-4 border rounded font-mono text-sm"
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
