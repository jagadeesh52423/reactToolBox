# Project Task Board
> Last updated: 2026-03-15 | Session: 1

## Legend
- `TODO` — Not started
- `IN_PROGRESS` — Currently being worked on
- `DONE` — Completed and verified

## Tasks

### TASK-001: Create flowchart parser
- **Status**: TODO
- **Priority**: P0 (Critical)
- **Complexity**: MODERATE
- **Description**: Create `src/app/mermaidEditor/utils/flowchartParser.ts` — parse Mermaid flowchart syntax into structured graph model with node shapes, edges, labels, subgraphs

### TASK-002: Create flowchart gradient themes
- **Status**: TODO
- **Priority**: P0 (Critical)
- **Complexity**: SIMPLE
- **Description**: Create `src/app/mermaidEditor/utils/flowchartThemes.ts` — 6 gradient theme presets mapping node shapes to gradient colors

### TASK-003: Create flowchart SVG renderer
- **Status**: TODO
- **Priority**: P0 (Critical)
- **Complexity**: COMPLEX
- **Blocked By**: TASK-001, TASK-002
- **Description**: Create `src/app/mermaidEditor/utils/flowchartRenderer.ts` — use dagre for layout, render parsed graph to SVG with gradients, shadows, arrows, edge labels, legend

### TASK-004: Integrate custom renderer into MermaidEditor
- **Status**: TODO
- **Priority**: P0 (Critical)
- **Complexity**: MODERATE
- **Blocked By**: TASK-003
- **Description**: Add render mode toggle (Standard/Gradient SVG) to MermaidEditor.tsx, integrate custom renderer, add gradient theme selector
