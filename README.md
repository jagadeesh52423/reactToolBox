# React ToolBox 🧰

A comprehensive collection of web-based developer tools built with Next.js, React, and TypeScript. This toolbox provides essential utilities for web developers, designers, and anyone working with data formats, colors, and code.

## 🚀 Features & Tools

### 🎨 **Color Picker**
Advanced color selection and manipulation tool with multiple input methods:
- **Multiple Color Spaces**: HEX, RGB, HSL, HSV support with real-time conversion
- **Interactive Color Wheel**: Intuitive hue selection with visual feedback
- **Comprehensive Palettes**: Material Design, Tailwind CSS, Bootstrap, and CSS named colors
- **Color Harmony**: Generate complementary, analogous, and triadic color schemes
- **Eyedropper Tool**: Sample colors directly from your screen (supported browsers)
- **Random Color Generator**: Generate random colors with one click
- **Copy Functionality**: Copy colors in any format to clipboard
- **Color History**: Save and reuse favorite colors

### 📊 **JSON Visualizer**
Interactive JSON viewer and editor with advanced features:
- **Tree View Visualization**: Collapsible/expandable JSON structure
- **Advanced Search**: Fuzzy search with filtering capabilities
- **Side-by-Side Compare**: Compare two JSON objects with diff highlighting
- **Edit Capabilities**: Modify JSON values inline
- **Search & Filter**: Hide non-matching nodes for better focus
- **Export Options**: Download modified JSON

### 🔄 **JSON Compare**
Powerful JSON comparison tool:
- **Visual Diff**: Side-by-side comparison with color-coded differences
- **Word-Level Diff**: Precise change detection
- **Tree Structure**: Navigate differences in hierarchical view
- **Export Results**: Save comparison results

### ✂️ **Text Compare**
Text comparison utility for finding differences:
- **Line-by-Line Diff**: Visual comparison of text files
- **Highlighting**: Color-coded additions, deletions, and modifications
- **Multiple Formats**: Support various text formats

### 🏷️ **HTML Formatter**
Clean and format HTML code:
- **Pretty Print**: Format HTML with proper indentation
- **Syntax Highlighting**: Colored HTML syntax display
- **Copy to Clipboard**: Easy copying of formatted code
- **Real-time Processing**: Instant formatting as you type

### 📊 **Mermaid Editor**
Advanced diagram creation tool:
- **Live Preview**: Real-time diagram rendering
- **Node Styling**: Comprehensive color controls for diagram elements
  - Background colors, border colors, text colors
  - Border width adjustment
  - Grid/List view toggle for node management
  - Multi-select with Ctrl/Cmd for bulk styling
- **Background Customization**: Set custom background colors for diagrams
- **Auto-render**: Diagrams render automatically on page load
- **Export Options**: Download diagrams as SVG files with styling preserved
- **Sample Diagrams**: Quick start with pre-built examples
- **File Upload**: Load existing Mermaid files

### 📝 **Text Utilities**
Collection of text transformation tools:
- **Case Conversion**: Transform text between different cases
- **Text Processing**: Various text manipulation utilities

### 🔤 **Text Case Converter**
Convert text between different case formats:
- **Multiple Cases**: camelCase, PascalCase, snake_case, kebab-case, and more
- **Bulk Processing**: Convert large amounts of text at once

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [React 18](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Diagrams**: [Mermaid](https://mermaid.js.org/)
- **Code Highlighting**: Custom syntax highlighter
- **Deployment**: [Vercel](https://vercel.com/) ready

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jagadeesh52423/reactToolBox.git
   cd reactToolBox
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── colorPicker/             # Color Picker tool
│   ├── htmlFormatter/           # HTML Formatter tool
│   ├── jsonCompare/             # JSON Compare tool
│   ├── jsonVisualizer/          # JSON Visualizer tool
│   ├── svgEditor/               # Mermaid Editor (SVG diagrams)
│   ├── textCompare/             # Text Compare tool
│   ├── textUtilities/           # Text Utilities collection
│   └── textCase/                # Text Case Converter
├── components/                  # Shared React components
│   └── ToolsNavigation.tsx      # Main navigation component
└── globals.css                  # Global styles
```

## 🎯 Recent Enhancements

### v2.0.0 - Major Feature Updates
- **Mermaid Editor**: Complete overhaul with advanced styling controls and background customization
- **Color Picker**: Major upgrade with HSV support, color wheel, harmony tools, and eyedropper
- **JSON Visualizer**: Added fuzzy search and advanced filtering capabilities
- **UI/UX**: Improved layouts, grid/list toggles, and better user experience across all tools

### Key Improvements
- **Auto-render**: Mermaid diagrams now render automatically on page load
- **Multi-select**: Bulk styling operations in Mermaid Editor with Ctrl/Cmd selection
- **Enhanced Search**: Fuzzy search and filtering in JSON Visualizer
- **Better Export**: SVG exports now preserve custom styling and background colors
- **Responsive Design**: Improved mobile and tablet experience

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checking

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Acknowledgments

- Built with [Claude Code](https://claude.com/claude-code) - AI-powered development assistant
- Powered by Next.js and the React ecosystem
- UI components styled with Tailwind CSS
- Diagrams rendered with Mermaid.js

## 📞 Support

If you encounter any issues or have suggestions for new features, please [open an issue](https://github.com/jagadeesh52423/reactToolBox/issues) on GitHub.

---

**Made with ❤️ for developers by developers**