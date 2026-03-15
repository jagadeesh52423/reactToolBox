'use client';
import dynamic from 'next/dynamic';

const MermaidEditor = dynamic(() => import('./components/MermaidEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-[var(--tool-content-height)] flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="text-center text-gray-500 dark:text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
        <div className="text-sm">Loading Mermaid Editor...</div>
      </div>
    </div>
  ),
});

export default function MermaidEditorPage() {
  return <MermaidEditor />;
}
