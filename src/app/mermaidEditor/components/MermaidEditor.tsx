'use client';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import mermaid from 'mermaid';
import SampleDiagrams from '../components/SampleDiagrams';
import NodeStylePanel from './NodeStylePanel';
import PanelHeader from '@/components/common/PanelHeader';
import ToggleVisibilityButton from '@/components/common/ToggleVisibilityButton';
import MermaidCodeEditor from './MermaidCodeEditor';
import ThemeSelector from './ThemeSelector';
import { CUSTOM_THEMES, type CustomTheme, getThemeById } from '../themes';
import type { GradientDef } from '../themes';

// Updated the default diagram with more spacing and simpler structure
const DEFAULT_DIAGRAM = `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Success]
    B -->|No| D[Try Again]
    D --> A`;

// Gradient injection function - defined outside component to avoid re-render issues
const applyThemeGradients = (svgElement: SVGSVGElement, gradients: GradientDef[], targets: string[]) => {
  // Check if defs element exists, create if not
  let defsElement = svgElement.querySelector('defs');
  if (!defsElement) {
    defsElement = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svgElement.insertBefore(defsElement, svgElement.firstChild);
  }

  // Add gradient definitions
  gradients.forEach(gradientDef => {
    // Remove existing gradient with same ID
    const existingGradient = defsElement!.querySelector(`#${gradientDef.id}`);
    if (existingGradient) {
      existingGradient.remove();
    }

    // Create gradient element
    const gradient = document.createElementNS('http://www.w3.org/2000/svg',
      gradientDef.type === 'linear' ? 'linearGradient' : 'radialGradient'
    );
    gradient.setAttribute('id', gradientDef.id);

    if (gradientDef.type === 'linear') {
      gradient.setAttribute('x1', gradientDef.x1 || '0%');
      gradient.setAttribute('y1', gradientDef.y1 || '0%');
      gradient.setAttribute('x2', gradientDef.x2 || '100%');
      gradient.setAttribute('y2', gradientDef.y2 || '100%');
    } else {
      gradient.setAttribute('cx', gradientDef.cx || '50%');
      gradient.setAttribute('cy', gradientDef.cy || '50%');
      gradient.setAttribute('r', gradientDef.r || '50%');
    }

    // Add stops
    gradientDef.stops.forEach(stop => {
      const stopElement = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stopElement.setAttribute('offset', stop.offset);
      stopElement.setAttribute('stop-color', stop.color);
      gradient.appendChild(stopElement);
    });

    defsElement.appendChild(gradient);
  });

  // Apply gradients to target elements
  targets.forEach(target => {
    let selector = '';
    switch (target) {
      case 'node':
        selector = '.node rect, .node circle, .node ellipse, .node polygon, .node path';
        break;
      case 'cluster':
        selector = '.cluster rect';
        break;
      case 'edgePath':
        selector = '.edgePath path';
        break;
    }

    if (selector) {
      const elements = svgElement.querySelectorAll(selector);
      elements.forEach(el => {
        // CRITICAL: Check if element has inline style with fill property (user-defined from NodeStylePanel)
        // If it does, skip applying gradient to preserve user's custom colors
        const inlineStyle = el.getAttribute('style');
        const hasFillStyle = inlineStyle && inlineStyle.includes('fill:');

        if (!hasFillStyle) {
          el.setAttribute('fill', `url(#${gradients[0].id})`);
        }
      });
    }
  });
};

const MermaidEditor: React.FC = () => {
  const [code, setCode] = useLocalStorage<string>('reactToolBox_mermaidEditor_code', DEFAULT_DIAGRAM);
  const [selectedThemeId, setSelectedThemeId] = useLocalStorage<string>('reactToolBox_mermaidEditor_themeId', 'built-in-default');
  const [error, setError] = useState<string>('');
  const [isRendering, setIsRendering] = useState(false);
  const [svgContent, setSvgContent] = useState<string>('');
  const [renderTrigger, setRenderTrigger] = useState(0);
  const [diagramBgColor, setDiagramBgColor] = useState('#ffffff');
  const [isEditorVisible, setIsEditorVisible] = useState(true);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const renderCounterRef = useRef(0);

  // Get current theme - memoized to avoid new object reference every render
  const currentTheme = useMemo(() => getThemeById(selectedThemeId) || CUSTOM_THEMES[0], [selectedThemeId]);

  // Toggle editor visibility
  const toggleEditorVisibility = () => {
    setIsEditorVisible(prev => !prev);
  };

  // Handle theme selection
  const handleThemeSelect = useCallback((theme: CustomTheme) => {
    setSelectedThemeId(theme.id);

    // Auto-set suggested background color if theme has one
    if (theme.suggestedBgColor) {
      setDiagramBgColor(theme.suggestedBgColor);
    }
  }, [setSelectedThemeId]);

  // Initialize mermaid with improved configuration
  useEffect(() => {
    try {
      const config: any = {
        startOnLoad: false,
        theme: currentTheme.mermaidTheme || 'base',
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
      };

      // Add theme variables if present
      if (currentTheme.themeVariables) {
        config.themeVariables = currentTheme.themeVariables;
      }

      mermaid.initialize(config);
      // Trigger re-render when theme changes
      setRenderTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Failed to initialize mermaid:", err);
    }
    // currentTheme is derived from selectedThemeId (getThemeById(selectedThemeId))
    // so it changes whenever selectedThemeId changes - we include it to satisfy React hooks rules
  }, [selectedThemeId, currentTheme]);

  // Auto-render diagram on code change
  useEffect(() => {
    if (code.trim()) {
      // Debounce rendering to avoid excessive CPU usage while typing
      const timer = setTimeout(() => {
        setRenderTrigger(prev => prev + 1);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [code]);
  
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
  }, [renderTrigger, code]);
  
  // Separate effect to update the DOM with SVG content and apply gradients
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

        // Apply gradients if the theme has them
        if (currentTheme.gradients && currentTheme.gradientTargets) {
          const svgElement = wrapper.querySelector('svg');
          if (svgElement) {
            applyThemeGradients(svgElement, currentTheme.gradients, currentTheme.gradientTargets);
          }
        }
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
    // currentTheme is derived from selectedThemeId but React hooks requires it in deps
  }, [svgContent, selectedThemeId, currentTheme]);

  // Apply background color to the SVG container
  useEffect(() => {
    if (svgContainerRef.current) {
      svgContainerRef.current.style.backgroundColor = diagramBgColor;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  
  // Download SVG function - serialize from actual DOM element
  const handleDownloadSvg = () => {
    if (!svgContent || !svgContainerRef.current) {
      setError('No SVG to download. Please render the diagram first.');
      return;
    }

    try {
      // Get the actual SVG element from the DOM (which has gradients applied)
      const svgElement = svgContainerRef.current.querySelector('svg');
      if (!svgElement) {
        setError('SVG element not found.');
        return;
      }

      // Clone the SVG element to avoid modifying the displayed one
      const svgClone = svgElement.cloneNode(true) as SVGSVGElement;

      // Add background rectangle if color is not white
      if (diagramBgColor !== '#ffffff') {
        const backgroundRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        backgroundRect.setAttribute('width', '100%');
        backgroundRect.setAttribute('height', '100%');
        backgroundRect.setAttribute('fill', diagramBgColor);

        // Insert as first child (behind everything)
        svgClone.insertBefore(backgroundRect, svgClone.firstChild);
      }

      // Serialize the SVG with gradients and background
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgClone);

      const blob = new Blob([svgString], { type: 'image/svg+xml' });
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
    const nodesMap = new Map<string, {id: string; label: string; styles: Record<string, string>}>();

    // Helper function to get styles for a node
    const getNodeStyles = (nodeId: string): Record<string, string> => {
      const styleRegex = new RegExp(`style\\s+${nodeId}\\s+([^\\n]+)`, 'i');
      const styleMatch = code.match(styleRegex);
      const styles: Record<string, string> = {};
      if (styleMatch) {
        const styleStr = styleMatch[1];
        styleStr.split(',').forEach(pair => {
          const [prop, val] = pair.split(':').map(s => s.trim());
          if (prop && val) {
            styles[prop] = val;
          }
        });
      }
      return styles;
    };

    // Helper function to add a node if not already present
    const addNode = (id: string, label?: string) => {
      if (!nodesMap.has(id) && id.length > 0) {
        // Skip keywords
        const keywords = ['graph', 'subgraph', 'end', 'style', 'classDef', 'class', 'click', 'TD', 'TB', 'BT', 'RL', 'LR'];
        if (keywords.includes(id.toUpperCase()) || keywords.includes(id)) {
          return;
        }
        nodesMap.set(id, {
          id,
          label: label || id,
          styles: getNodeStyles(id)
        });
      }
    };

    // 1. Match nodes with explicit labels: A[label], B{label}, C(label), D((label)), E([label]), F[[label]], G[(label)]
    const labeledNodeRegex = /\b([A-Za-z][A-Za-z0-9_]*)(?:\[\[([^\]]*)\]\]|\[\(([^\)]*)\)\]|\(\[([^\]]*)\]\)|\[([^\]]*)\]|\{([^\}]*)\}|\(\(([^\)]*)\)\)|\(([^\)]*)\))/g;
    let match;

    while ((match = labeledNodeRegex.exec(code)) !== null) {
      const id = match[1];
      const label = match[2] || match[3] || match[4] || match[5] || match[6] || match[7] || match[8] || id;
      addNode(id, label);
    }

    // 2. Match nodes in relationship lines without explicit labels: A --> B, C --- D, E -.-> F
    const relationshipRegex = /\b([A-Za-z][A-Za-z0-9_]*)\s*(?:-->|---|-\.-|==>|--[^>]|-.->|<-->|<--->)\s*(?:\|[^|]*\|)?\s*([A-Za-z][A-Za-z0-9_]*)\b/g;

    while ((match = relationshipRegex.exec(code)) !== null) {
      addNode(match[1]);
      addNode(match[2]);
    }

    return Array.from(nodesMap.values());
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

  // Remove all style declarations for the given node IDs
  const handleResetStyles = (nodeIds: string[]) => {
    setCode(currentCode => {
      const lines = currentCode.split('\n');
      const filtered = lines.filter(line => {
        const trimmed = line.trim();
        if (!trimmed.startsWith('style ')) return true;
        // Check if this style line targets any of the nodeIds
        return !nodeIds.some(id => {
          const regex = new RegExp(`^style\\s+${id}\\s`);
          return regex.test(trimmed);
        });
      });
      // Clean up any trailing empty lines left behind
      let result = filtered.join('\n');
      result = result.replace(/\n{3,}/g, '\n\n').trimEnd();
      return result;
    });
    setTimeout(() => {
      setRenderTrigger(prev => prev + 1);
    }, 100);
  };

  return (
    <div className="h-[var(--tool-content-height)] flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Controls Bar */}
      <div className="px-6 py-4 flex flex-wrap items-center gap-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
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
            className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50"
          >
            Load File
          </button>
          <button
            onClick={() => setCode('')}
            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Clear
          </button>
          <SampleDiagrams onSelectSample={loadSample} />

          {/* Theme Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Theme:</label>
            <ThemeSelector
              selectedThemeId={selectedThemeId}
              onSelectTheme={handleThemeSelect}
            />
          </div>

          {/* Background Color Control */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Background:</label>
            <input
              type="color"
              value={diagramBgColor}
              onChange={(e) => setDiagramBgColor(e.target.value)}
              className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              title="Diagram Background Color"
            />
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

      {/* Main Content - Three Column Layout */}
      <main className="flex-1 p-6 overflow-hidden min-h-0">
        <div className="h-full">
          <div className={`grid gap-6 h-full ${
            isEditorVisible ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1 lg:grid-cols-12'
          }`}>
            {/* Left Panel - Editor (Collapsible) */}
            {isEditorVisible && (
              <div className="lg:col-span-4 flex flex-col h-full min-h-0">
                <div className="flex flex-col h-full bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
                  <PanelHeader title="Mermaid Code">
                    <div className="flex items-center gap-1 pr-2 border-r border-gray-300/50 dark:border-slate-600/50">
                      <ToggleVisibilityButton
                        isVisible={isEditorVisible}
                        onToggle={toggleEditorVisibility}
                      />
                    </div>
                  </PanelHeader>

                  {/* Mermaid Code Editor with Syntax Highlighting */}
                  <MermaidCodeEditor
                    value={code}
                    onChange={setCode}
                    placeholder="Enter your Mermaid diagram code here..."
                  />
                </div>
              </div>
            )}

            {/* Middle Panel - Diagram Preview */}
            <div className={`${
              isEditorVisible
                ? (svgContent ? 'lg:col-span-5' : 'lg:col-span-8')
                : (svgContent ? 'lg:col-span-9' : 'lg:col-span-12')
            } min-h-0`}>
              <div className="flex flex-col h-full bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
                <PanelHeader title="Diagram Preview">
                  {!isEditorVisible && (
                    <button
                      onClick={toggleEditorVisibility}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 bg-indigo-100/50 dark:bg-indigo-600/20 hover:bg-indigo-200/50 dark:hover:bg-indigo-600/40 border border-indigo-300/30 dark:border-indigo-500/30 transition-all duration-200 mr-1"
                      title="Show editor"
                    >
                      <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="text-sm">Show Editor</span>
                    </button>
                  )}
                </PanelHeader>

                <div className="flex-1 overflow-auto p-4">
                  {error && (
                    <div className="text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-4 rounded border border-red-200 dark:border-red-500/30 mb-4">
                      <strong>Error:</strong> {error}
                    </div>
                  )}
                  <div className="relative w-full h-full flex items-center justify-center">
                    {!svgContent && !error && !isRendering && (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-slate-400 text-center px-4">
                        <div>
                          <div className="text-lg mb-2">📊 Diagram Preview</div>
                          <div className="text-sm">Click "Render Diagram" to preview</div>
                        </div>
                      </div>
                    )}
                    {isRendering && (
                      <div className="absolute inset-0 flex items-center justify-center text-blue-500 dark:text-blue-400">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400 mx-auto mb-2"></div>
                          <div>Rendering diagram...</div>
                        </div>
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

            {/* Right Panel - Node Styles (Vertical) */}
            {svgContent && (
              <div className="lg:col-span-3 min-h-0">
                <div className="flex flex-col h-full bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
                  <PanelHeader title="Node Styles" />
                  <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 custom-scrollbar min-h-0">
                    <NodeStylePanel
                      nodes={nodes}
                      onStyleChange={handleNodeStyleChange}
                      onResetStyles={handleResetStyles}
                      themeDefaults={{
                        fill: currentTheme.themeVariables?.primaryColor || currentTheme.previewColors?.[0],
                        stroke: currentTheme.themeVariables?.primaryBorderColor || currentTheme.previewColors?.[1],
                        color: currentTheme.themeVariables?.primaryTextColor || currentTheme.previewColors?.[2],
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MermaidEditor;
