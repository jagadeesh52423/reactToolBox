'use client';
import dynamic from 'next/dynamic';

const JsonVisualizerRefactored = dynamic(() => import('./components/JsonVisualizerRefactored'), {
  ssr: false,
  loading: () => (
    <div
      className="h-full flex items-center justify-center"
      style={{ background: 'var(--jv-bg-primary)' }}
    >
      <div className="text-center" style={{ color: 'var(--jv-text-muted)' }}>
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-3"
          style={{ borderColor: 'var(--jv-accent)' }}
        ></div>
        <div className="text-sm" style={{ fontFamily: 'var(--jv-font-sans)' }}>
          Loading JSON Visualizer...
        </div>
      </div>
    </div>
  ),
});

export default function JsonVisualizerPage() {
  return <JsonVisualizerRefactored />;
}
