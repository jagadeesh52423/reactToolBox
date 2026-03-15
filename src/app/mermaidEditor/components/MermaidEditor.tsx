'use client';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import mermaid from 'mermaid';
import SampleDiagrams from '../components/SampleDiagrams';
import NodeStylePanel from './NodeStylePanel';
import EdgeStylePanel from './EdgeStylePanel';
import PanelHeader from '@/components/common/PanelHeader';
import ToggleVisibilityButton from '@/components/common/ToggleVisibilityButton';
import Editor, { type BeforeMount, type OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import ThemeSelector from './ThemeSelector';
import { CUSTOM_THEMES, type CustomTheme, getThemeById } from '../themes';
import type { GradientDef } from '../themes';

// Monaco: register Mermaid language and themes before editor mounts
let mermaidLanguageRegistered = false;

const handleEditorWillMount: BeforeMount = (monaco) => {
  if (mermaidLanguageRegistered) return;
  mermaidLanguageRegistered = true;

  monaco.languages.register({ id: 'mermaid' });

  monaco.languages.setMonarchTokensProvider('mermaid', {
    keywords: [
      'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram',
      'stateDiagram-v2', 'erDiagram', 'gantt', 'pie', 'gitgraph', 'mindmap',
      'timeline', 'journey', 'quadrantChart', 'sankey-beta', 'xychart-beta',
      'subgraph', 'end', 'participant', 'actor', 'activate', 'deactivate',
      'note', 'loop', 'alt', 'else', 'opt', 'par', 'critical', 'break',
      'rect', 'class', 'section', 'title', 'dateFormat', 'axisFormat',
    ],
    directions: ['TD', 'TB', 'LR', 'RL', 'BT', 'DT', 'BR', 'left of', 'right of', 'over'],
    styleKeywords: ['style', 'classDef', 'linkStyle', 'click'],

    tokenizer: {
      root: [
        // Comments
        [/%%.*$/, 'comment'],
        // Style directives
        [/\b(style|classDef|linkStyle|click)\b/, 'keyword.style'],
        // Arrows (order matters — longer first)
        [/--?>|==?>|-.->|<-->|<--->|--x|--o|===|---/, 'operator.arrow'],
        // Edge labels |text|
        [/\|[^|]*\|/, 'string.label'],
        // Node shapes: [text], (text), {text}, ((text)), [[text]], >text]
        [/\[\[.*?\]\]/, 'string.node'],
        [/\(\(.*?\)\)/, 'string.node'],
        [/\[.*?\]/, 'string.node'],
        [/\(.*?\)/, 'string.node'],
        [/\{.*?\}/, 'string.node'],
        // Quoted strings
        [/"[^"]*"/, 'string'],
        [/'[^']*'/, 'string'],
        // Directions
        [/\b(TD|TB|LR|RL|BT|DT|BR)\b/, 'keyword.direction'],
        // Keywords
        [/\b(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|gantt|pie|gitgraph|mindmap|timeline|journey|quadrantChart|sankey-beta|xychart-beta|subgraph|end|participant|actor|activate|deactivate|note|loop|alt|else|opt|par|critical|break|rect|class|section|title|dateFormat|axisFormat)\b/, 'keyword'],
        // Hex colors
        [/#[0-9a-fA-F]{3,8}\b/, 'number.hex'],
        // Numbers
        [/\b\d+(\.\d+)?\b/, 'number'],
        // Identifiers
        [/[A-Za-z_]\w*/, 'identifier'],
      ],
    },
  });

  // Light theme
  monaco.editor.defineTheme('mermaid-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
      { token: 'keyword', foreground: '0000ff', fontStyle: 'bold' },
      { token: 'keyword.direction', foreground: 'af00db' },
      { token: 'keyword.style', foreground: 'e06c00', fontStyle: 'bold' },
      { token: 'operator.arrow', foreground: 'd63200', fontStyle: 'bold' },
      { token: 'string.label', foreground: 'a31515' },
      { token: 'string.node', foreground: '0070c1' },
      { token: 'string', foreground: 'a31515' },
      { token: 'number.hex', foreground: '098658' },
      { token: 'number', foreground: '098658' },
    ],
    colors: {},
  });

  // Dark theme
  monaco.editor.defineTheme('mermaid-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
      { token: 'keyword', foreground: '569cd6', fontStyle: 'bold' },
      { token: 'keyword.direction', foreground: 'c586c0' },
      { token: 'keyword.style', foreground: 'ce9178', fontStyle: 'bold' },
      { token: 'operator.arrow', foreground: 'd7ba7d', fontStyle: 'bold' },
      { token: 'string.label', foreground: 'ce9178' },
      { token: 'string.node', foreground: '9cdcfe' },
      { token: 'string', foreground: 'ce9178' },
      { token: 'number.hex', foreground: 'b5cea8' },
      { token: 'number', foreground: 'b5cea8' },
    ],
    colors: {},
  });
};

// Edge gradient type for per-edge gradient definitions
interface EdgeGradientDef {
  edgeIndex: number;
  property: string; // 'stroke' | 'color'
  stops: Array<{ offset: string; color: string }>;
}

// Node gradient type for per-node gradient definitions
interface NodeGradientDef {
  nodeId: string;
  property: string; // 'fill' | 'stroke' | 'color'
  stops: Array<{ offset: string; color: string }>;
}

// Helper: ensure <defs> exists in SVG, create a linearGradient, return gradient ID
const injectLinearGradient = (
  svgElement: SVGSVGElement,
  gradId: string,
  stops: Array<{ offset: string; color: string }>,
  targetElement: SVGGraphicsElement,
) => {
  let defsElement = svgElement.querySelector('defs');
  if (!defsElement) {
    defsElement = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svgElement.insertBefore(defsElement, svgElement.firstChild);
  }

  // Remove existing gradient with same ID
  const existing = defsElement.querySelector(`#${gradId}`);
  if (existing) existing.remove();

  const bbox = targetElement.getBBox();
  const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  gradient.setAttribute('id', gradId);
  gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
  gradient.setAttribute('x1', String(bbox.x));
  gradient.setAttribute('y1', String(bbox.y));
  gradient.setAttribute('x2', String(bbox.x + bbox.width));
  gradient.setAttribute('y2', String(bbox.y + bbox.height));

  stops.forEach(stop => {
    const stopEl = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stopEl.setAttribute('offset', stop.offset);
    stopEl.setAttribute('stop-color', stop.color);
    gradient.appendChild(stopEl);
  });

  defsElement.appendChild(gradient);
  return `url(#${gradId})`;
};

// Apply per-edge gradient colors via SVG injection (post-render)
const applyEdgeGradients = (svgElement: SVGSVGElement, edgeGradients: EdgeGradientDef[]) => {
  if (edgeGradients.length === 0) return;

  const edgePaths = svgElement.querySelectorAll('.edgePath path');
  const edgeLabels = svgElement.querySelectorAll('.edgeLabel');

  edgeGradients.forEach(({ edgeIndex, property, stops }) => {
    if (stops.length < 2) return;

    if ((property || 'stroke') === 'stroke') {
      const edgePath = edgePaths[edgeIndex] as SVGPathElement | undefined;
      if (!edgePath) return;
      const gradUrl = injectLinearGradient(svgElement, `edgeGrad-${edgeIndex}`, stops, edgePath);
      edgePath.setAttribute('stroke', gradUrl);
    } else if (property === 'color') {
      // Apply gradient to edge label text
      const labelGroup = edgeLabels[edgeIndex] as SVGGraphicsElement | undefined;
      if (!labelGroup) return;
      const textEls = labelGroup.querySelectorAll('span, text, foreignObject *');
      if (textEls.length === 0) return;
      const gradUrl = injectLinearGradient(svgElement, `edgeTextGrad-${edgeIndex}`, stops, labelGroup);
      // For foreignObject HTML labels, use CSS background-clip approach
      textEls.forEach(el => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.style) {
          htmlEl.style.backgroundImage = `linear-gradient(to right, ${stops.map(s => `${s.color} ${s.offset}`).join(', ')})`;
          htmlEl.style.webkitBackgroundClip = 'text';
          htmlEl.style.backgroundClip = 'text';
          htmlEl.style.webkitTextFillColor = 'transparent';
          htmlEl.style.color = 'transparent';
        }
      });
    }
  });
};

// Apply per-node gradient colors via SVG injection (post-render)
const applyNodeGradients = (svgElement: SVGSVGElement, nodeGradients: NodeGradientDef[]) => {
  if (nodeGradients.length === 0) return;

  // Find all node groups — Mermaid gives nodes IDs like "flowchart-A-0"
  const nodeGroups = svgElement.querySelectorAll('.node');

  nodeGradients.forEach(({ nodeId, property, stops }) => {
    if (stops.length < 2) return;

    // Find the node group containing this nodeId
    const groupsArr = Array.from(nodeGroups);
    const group = groupsArr.find(g => {
      const id = g.getAttribute('id') || '';
      return id.includes(`-${nodeId}-`) || id.endsWith(`-${nodeId}`);
    });
    if (!group) return;

    if (property === 'fill' || property === 'stroke') {
      const shape = group.querySelector('rect, circle, ellipse, polygon, path') as SVGGraphicsElement | null;
      if (!shape) return;
      const gradUrl = injectLinearGradient(svgElement, `nodeGrad-${nodeId}-${property}`, stops, shape);
      shape.setAttribute(property, gradUrl);
    } else if (property === 'color') {
      const foreignObj = group.querySelector('foreignObject');
      if (foreignObj) {
        const textEls = foreignObj.querySelectorAll('span, div, p');
        textEls.forEach((el: Element) => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.style) {
            htmlEl.style.backgroundImage = `linear-gradient(to right, ${stops.map(s => `${s.color} ${s.offset}`).join(', ')})`;
            htmlEl.style.webkitBackgroundClip = 'text';
            htmlEl.style.backgroundClip = 'text';
            htmlEl.style.webkitTextFillColor = 'transparent';
            htmlEl.style.color = 'transparent';
          }
        });
      } else {
        const textEl = group.querySelector('text') as SVGGraphicsElement | null;
        if (textEl) {
          const gradUrl = injectLinearGradient(svgElement, `nodeGrad-${nodeId}-text`, stops, textEl);
          textEl.setAttribute('fill', gradUrl);
        }
      }
    }
  });
};

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
  const [activeStyleTab, setActiveStyleTab] = useState<'nodes' | 'edges'>('nodes');
  const [edgeGradients, setEdgeGradients] = useLocalStorage<EdgeGradientDef[]>('reactToolBox_mermaidEditor_edgeGradients', []);
  const [nodeGradients, setNodeGradients] = useLocalStorage<NodeGradientDef[]>('reactToolBox_mermaidEditor_nodeGradients', []);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const renderCounterRef = useRef(0);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [monacoTheme, setMonacoTheme] = useState('mermaid-light');

  // Get current theme - memoized to avoid new object reference every render
  const currentTheme = useMemo(() => getThemeById(selectedThemeId) || CUSTOM_THEMES[0], [selectedThemeId]);

  // Detect dark mode and switch Monaco theme
  useEffect(() => {
    const html = document.documentElement;
    const updateTheme = () => {
      setMonacoTheme(html.classList.contains('dark') ? 'mermaid-dark' : 'mermaid-light');
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(html, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleEditorMount: OnMount = (monacoEditor) => {
    editorRef.current = monacoEditor;
  };

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

        // Apply per-edge gradients
        if (edgeGradients.length > 0) {
          const svgElement = wrapper.querySelector('svg');
          if (svgElement) {
            applyEdgeGradients(svgElement, edgeGradients);
          }
        }

        // Apply per-node gradients
        if (nodeGradients.length > 0) {
          const svgElement = wrapper.querySelector('svg');
          if (svgElement) {
            applyNodeGradients(svgElement, nodeGradients);
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
  }, [svgContent, selectedThemeId, currentTheme, edgeGradients, nodeGradients]);

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

  // Extract edges from the current diagram code
  const edges = useMemo(() => {
    const edgesArray: Array<{
      index: number;
      from: string;
      to: string;
      label: string;
      styles: Record<string, string>;
    }> = [];

    // Helper function to get styles for an edge by index
    const getEdgeStyles = (edgeIndex: number): Record<string, string> => {
      const linkStyleRegex = new RegExp(`linkStyle\\s+${edgeIndex}\\s+([^\\n]+)`, 'i');
      const linkStyleMatch = code.match(linkStyleRegex);
      const styles: Record<string, string> = {};
      if (linkStyleMatch) {
        const styleStr = linkStyleMatch[1];
        styleStr.split(',').forEach(pair => {
          const [prop, val] = pair.split(':').map(s => s.trim());
          if (prop && val) {
            styles[prop] = val;
          }
        });
      }
      return styles;
    };

    // Parse edges IN ORDER to match 0-based indexing used by linkStyle
    // Match: A --> B, A -->|Label| B, A ---|Label| B, etc.
    const edgeRegex = /\b([A-Za-z][A-Za-z0-9_]*)(?:\s*(?:\[\[.*?\]\]|\(\(.*?\)\)|\[.*?\]|\(.*?\)|\{.*?\}|>.*?\]))?[\s\n]*(-->|---|==>|-.->|<-->|<--->)[\s\n]*(?:\|([^|]*)\|)?[\s\n]*([A-Za-z][A-Za-z0-9_]*)\b/g;
    let match;
    let edgeIndex = 0;

    while ((match = edgeRegex.exec(code)) !== null) {
      const from = match[1];
      const to = match[4];
      const label = match[3] || '';

      edgesArray.push({
        index: edgeIndex,
        from,
        to,
        label,
        styles: getEdgeStyles(edgeIndex)
      });

      edgeIndex++;
    }

    return edgesArray;
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

  // Apply style change from the EdgeStylePanel
  const handleEdgeStyleChange = (edgeIndex: number, property: string, value: string) => {
    setCode(currentCode => {
      const existingLinkStyleRegex = new RegExp(`linkStyle\\s+${edgeIndex}\\s+([^\\n]+)`, 'i');
      const existingLinkStyleMatch = currentCode.match(existingLinkStyleRegex);

      let newCode = currentCode;

      if (existingLinkStyleMatch) {
        // Parse existing style
        const existingStyles = parseStyleString(existingLinkStyleMatch[1]);

        // Update with new property value
        existingStyles[property] = value;

        // CRITICAL: Ensure fill:none is always present (mermaid requirement)
        if (!existingStyles['fill']) {
          existingStyles['fill'] = 'none';
        }

        // Create the new linkStyle declaration
        const newLinkStyleDeclaration = `linkStyle ${edgeIndex} ${styleObjToString(existingStyles)}`;

        // Replace in the code
        newCode = currentCode.replace(existingLinkStyleRegex, newLinkStyleDeclaration);
      } else {
        // No existing linkStyle, create a new one
        const styleObj: Record<string, string> = {
          [property]: value,
          fill: 'none' // CRITICAL: Always include fill:none
        };

        const linkStyleDeclaration = `linkStyle ${edgeIndex} ${styleObjToString(styleObj)}`;

        if (currentCode.includes('linkStyle ')) {
          // Find the last linkStyle declaration
          const lines = currentCode.split('\n');
          let lastLinkStyleIndex = -1;

          for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].trim().startsWith('linkStyle ')) {
              lastLinkStyleIndex = i;
              break;
            }
          }

          if (lastLinkStyleIndex !== -1) {
            // Insert after the last linkStyle
            lines.splice(lastLinkStyleIndex + 1, 0, linkStyleDeclaration);
            newCode = lines.join('\n');
          } else {
            // Couldn't find the linkStyle section, append to end
            newCode = `${currentCode}\n\n${linkStyleDeclaration}`;
          }
        } else {
          // No existing linkStyles, append to the end with a blank line
          newCode = `${currentCode}\n\n${linkStyleDeclaration}`;
        }
      }

      return newCode;
    });

    setTimeout(() => {
      setRenderTrigger(prev => prev + 1);
    }, 100);
  };

  // Change edge label
  const handleEdgeLabelChange = (edgeIndex: number, newLabel: string) => {
    setCode(currentCode => {
      // Parse edges in order to find the Nth edge
      const edgeRegex = /\b([A-Za-z][A-Za-z0-9_]*)(?:\s*(?:\[\[.*?\]\]|\(\(.*?\)\)|\[.*?\]|\(.*?\)|\{.*?\}|>.*?\]))?[\s\n]*(-->|---|==>|-.->|<-->|<--->)[\s\n]*(?:\|([^|]*)\|)?[\s\n]*([A-Za-z][A-Za-z0-9_]*)\b/g;
      let match;
      let currentIndex = 0;
      let newCode = currentCode;

      // Reset regex to start from beginning
      edgeRegex.lastIndex = 0;

      while ((match = edgeRegex.exec(currentCode)) !== null) {
        if (currentIndex === edgeIndex) {
          // Found the target edge
          const fullMatch = match[0];
          const from = match[1];
          const arrow = match[2];
          const to = match[4];
          const oldLabel = match[3] || '';

          let replacement: string;
          if (newLabel.trim()) {
            // Add or update label
            replacement = `${from} ${arrow}|${newLabel}| ${to}`;
          } else {
            // Remove label
            replacement = `${from} ${arrow} ${to}`;
          }

          // Replace this specific occurrence
          newCode = currentCode.slice(0, match.index) + replacement + currentCode.slice(match.index + fullMatch.length);
          break;
        }

        currentIndex++;
      }

      return newCode;
    });

    setTimeout(() => {
      setRenderTrigger(prev => prev + 1);
    }, 100);
  };

  // Remove linkStyle declarations for the given edge indices
  const handleResetEdgeStyles = (edgeIndices: number[]) => {
    setCode(currentCode => {
      const lines = currentCode.split('\n');
      const filtered = lines.filter(line => {
        const trimmed = line.trim();
        if (!trimmed.startsWith('linkStyle ')) return true;
        // Check if this linkStyle line targets any of the edgeIndices
        return !edgeIndices.some(idx => {
          const regex = new RegExp(`^linkStyle\\s+${idx}\\s`);
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

  const handleEdgeGradientChange = (edgeIndex: number, property: string, stops: Array<{ offset: string; color: string }>) => {
    setEdgeGradients(prev => {
      const existing = prev.filter(g => !(g.edgeIndex === edgeIndex && g.property === property));
      return [...existing, { edgeIndex, property, stops }];
    });
    setTimeout(() => { setRenderTrigger(prev => prev + 1); }, 100);
  };

  const handleEdgeGradientRemove = (edgeIndices: number[]) => {
    setEdgeGradients(prev => prev.filter(g => !edgeIndices.includes(g.edgeIndex)));
    setTimeout(() => { setRenderTrigger(prev => prev + 1); }, 100);
  };

  const handleNodeGradientChange = (nodeId: string, property: string, stops: Array<{ offset: string; color: string }>) => {
    setNodeGradients(prev => {
      const existing = prev.filter(g => !(g.nodeId === nodeId && g.property === property));
      return [...existing, { nodeId, property, stops }];
    });
    setTimeout(() => { setRenderTrigger(prev => prev + 1); }, 100);
  };

  const handleNodeGradientRemove = (nodeIds: string[]) => {
    setNodeGradients(prev => prev.filter(g => !nodeIds.includes(g.nodeId)));
    setTimeout(() => { setRenderTrigger(prev => prev + 1); }, 100);
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

                  {/* Monaco Code Editor with Mermaid syntax highlighting */}
                  <div className="flex-1 min-h-0">
                    <Editor
                      height="100%"
                      language="mermaid"
                      theme={monacoTheme}
                      value={code}
                      onChange={(val) => setCode(val || '')}
                      beforeMount={handleEditorWillMount}
                      onMount={handleEditorMount}
                      options={{
                        minimap: { enabled: false },
                        lineNumbers: 'on',
                        wordWrap: 'on',
                        scrollBeyondLastLine: false,
                        fontSize: 14,
                        automaticLayout: true,
                        tabSize: 2,
                        renderLineHighlight: 'line',
                        overviewRulerLanes: 0,
                        hideCursorInOverviewRuler: true,
                        scrollbar: {
                          verticalScrollbarSize: 8,
                          horizontalScrollbarSize: 8,
                        },
                        padding: { top: 8 },
                      }}
                    />
                  </div>
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

            {/* Right Panel - Node & Edge Styles (Tabbed) */}
            {svgContent && (
              <div className="lg:col-span-3 min-h-0">
                <div className="flex flex-col h-full bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
                  {/* Tabbed Header */}
                  <div className="flex items-center border-b border-gray-200/50 dark:border-slate-700/50 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-slate-800/50 dark:to-slate-800/30">
                    <button
                      onClick={() => setActiveStyleTab('nodes')}
                      className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                        activeStyleTab === 'nodes'
                          ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-white/50 dark:bg-slate-900/50'
                          : 'text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 hover:bg-white/30 dark:hover:bg-slate-900/30'
                      }`}
                    >
                      Nodes ({nodes.length})
                    </button>
                    <button
                      onClick={() => setActiveStyleTab('edges')}
                      className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                        activeStyleTab === 'edges'
                          ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-white/50 dark:bg-slate-900/50'
                          : 'text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 hover:bg-white/30 dark:hover:bg-slate-900/30'
                      }`}
                    >
                      Edges ({edges.length})
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 custom-scrollbar min-h-0">
                    {activeStyleTab === 'nodes' ? (
                      <NodeStylePanel
                        nodes={nodes}
                        onStyleChange={handleNodeStyleChange}
                        onResetStyles={(nodeIds) => {
                          handleResetStyles(nodeIds);
                          handleNodeGradientRemove(nodeIds);
                        }}
                        themeDefaults={{
                          fill: currentTheme.themeVariables?.primaryColor || currentTheme.previewColors?.[0],
                          stroke: currentTheme.themeVariables?.primaryBorderColor || currentTheme.previewColors?.[1],
                          color: currentTheme.themeVariables?.primaryTextColor || currentTheme.previewColors?.[2],
                        }}
                        nodeGradients={nodeGradients}
                        onGradientChange={handleNodeGradientChange}
                        onGradientRemove={handleNodeGradientRemove}
                      />
                    ) : (
                      <EdgeStylePanel
                        edges={edges}
                        onStyleChange={handleEdgeStyleChange}
                        onLabelChange={handleEdgeLabelChange}
                        onResetStyles={(indices) => {
                          handleResetEdgeStyles(indices);
                          handleEdgeGradientRemove(indices);
                        }}
                        themeDefaults={{
                          stroke: currentTheme.themeVariables?.lineColor || currentTheme.previewColors?.[1],
                        }}
                        edgeGradients={edgeGradients}
                        onGradientChange={handleEdgeGradientChange}
                        onGradientRemove={handleEdgeGradientRemove}
                      />
                    )}
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
