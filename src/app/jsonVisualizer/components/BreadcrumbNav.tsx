'use client';

import { BreadcrumbNavProps, JsonValueType } from '../models/JsonModels';

const TYPE_COLORS: Record<string, string> = {
  [JsonValueType.OBJECT]: 'var(--jv-key)',
  [JsonValueType.ARRAY]: 'var(--jv-number)',
  [JsonValueType.STRING]: 'var(--jv-string)',
  [JsonValueType.NUMBER]: 'var(--jv-number)',
  [JsonValueType.BOOLEAN]: 'var(--jv-boolean)',
  [JsonValueType.NULL]: 'var(--jv-null)',
};

export default function BreadcrumbNav({ segments, onNavigate }: BreadcrumbNavProps) {
  if (segments.length <= 1) return null;

  return (
    <div
      className="flex items-center gap-1 px-4 py-2 overflow-x-auto border-b"
      style={{
        borderColor: 'var(--jv-border)',
        background: 'var(--jv-bg-secondary)',
        fontFamily: 'var(--jv-font-mono)',
      }}
    >
      {segments.map((segment, i) => (
        <div key={i} className="flex items-center gap-1 jv-animate-breadcrumb">
          {i > 0 && (
            <span className="text-xs" style={{ color: 'var(--jv-text-muted)' }}>
              ›
            </span>
          )}
          <button
            onClick={() => onNavigate(segment.path)}
            className={`
              flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-all
              ${segment.isLast ? 'font-semibold' : 'hover:opacity-80'}
            `}
            style={{
              color: segment.isLast ? 'var(--jv-accent)' : 'var(--jv-text-secondary)',
              background: segment.isLast ? 'var(--jv-bg-active)' : 'transparent',
              fontFamily: 'var(--jv-font-mono)',
            }}
          >
            {/* Type indicator dot */}
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: TYPE_COLORS[segment.type] || 'var(--jv-text-muted)' }}
            />
            {segment.key}
          </button>
        </div>
      ))}
    </div>
  );
}
