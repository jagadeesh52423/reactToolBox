'use client';

import { useEffect, useRef } from 'react';
import { ClipboardIcon } from '@/components/shared/Icons';

export interface ContextMenuItem {
    label: string;
    value: string;
    icon?: React.ReactNode;
    shortcut?: string;
    type?: 'copy' | 'action';
    action?: () => void;
}

interface ContextMenuProps {
    x: number;
    y: number;
    items: ContextMenuItem[];
    onSelect: (item: ContextMenuItem) => void;
    onClose: () => void;
    onAddChild?: () => void;
    onDuplicate?: () => void;
}

export default function ContextMenu({ x, y, items, onSelect, onClose, onAddChild, onDuplicate }: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        const handleScroll = () => {
            onClose();
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        document.addEventListener('scroll', handleScroll, true);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('scroll', handleScroll, true);
        };
    }, [onClose]);

    // Adjust position if menu would go off-screen
    useEffect(() => {
        if (menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            if (rect.right > viewportWidth) {
                menuRef.current.style.left = `${x - rect.width}px`;
            }
            if (rect.bottom > viewportHeight) {
                menuRef.current.style.top = `${y - rect.height}px`;
            }
        }
    }, [x, y]);

    const handleItemClick = (item: ContextMenuItem) => {
        navigator.clipboard.writeText(item.value);
        onSelect(item);
        onClose();
    };

    return (
        <div
            ref={menuRef}
            className="fixed z-50 min-w-[180px] py-1 rounded-lg shadow-lg border overflow-hidden jv-animate-scale-in"
            style={{ left: x, top: y, background: 'var(--jv-bg-panel)', borderColor: 'var(--jv-border)' }}
        >
            <div
                className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider border-b"
                style={{ color: 'var(--jv-text-muted)', borderColor: 'var(--jv-border)' }}
            >
                Copy
            </div>
            {items.map((item, index) => (
                <button
                    key={index}
                    onClick={() => handleItemClick(item)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left"
                    style={{ color: 'var(--jv-text-primary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--jv-bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    <ClipboardIcon size={14} />
                    <span className="flex-1">{item.label}</span>
                    <span
                        className="text-xs max-w-[100px] truncate"
                        style={{ color: 'var(--jv-text-muted)', fontFamily: 'var(--jv-font-mono)' }}
                    >
                        {item.value.length > 20 ? item.value.slice(0, 20) + '...' : item.value}
                    </span>
                </button>
            ))}

            {/* Divider */}
            {(onAddChild || onDuplicate) && (
                <div className="my-1 border-t" style={{ borderColor: 'var(--jv-border)' }} />
            )}
            {/* Actions section header */}
            {(onAddChild || onDuplicate) && (
                <div
                    className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'var(--jv-text-muted)' }}
                >
                    Actions
                </div>
            )}
            {onAddChild && (
                <button
                    onClick={() => { onAddChild(); onClose(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left"
                    style={{ color: 'var(--jv-text-primary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--jv-bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    <span>+</span>
                    <span className="flex-1">Add Child</span>
                    <span className="text-xs" style={{ color: 'var(--jv-text-muted)', fontFamily: 'var(--jv-font-mono)' }}>A</span>
                </button>
            )}
            {onDuplicate && (
                <button
                    onClick={() => { onDuplicate(); onClose(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left"
                    style={{ color: 'var(--jv-text-primary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--jv-bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    <ClipboardIcon size={14} />
                    <span className="flex-1">Duplicate</span>
                    <span className="text-xs" style={{ color: 'var(--jv-text-muted)', fontFamily: 'var(--jv-font-mono)' }}>D</span>
                </button>
            )}
        </div>
    );
}
