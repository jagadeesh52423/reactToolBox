'use client';

import { useEffect, useRef } from 'react';
import { ClipboardIcon } from './Icons';

export interface ContextMenuItem {
    label: string;
    value: string;
    icon?: React.ReactNode;
}

interface ContextMenuProps {
    x: number;
    y: number;
    items: ContextMenuItem[];
    onSelect: (item: ContextMenuItem) => void;
    onClose: () => void;
}

/**
 * ContextMenu Component
 *
 * A floating context menu that appears on right-click.
 * Provides copy options for JSON keys, values, and paths.
 */
export default function ContextMenu({ x, y, items, onSelect, onClose }: ContextMenuProps) {
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
            className="fixed z-50 min-w-[180px] py-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
            style={{ left: x, top: y }}
        >
            <div className="px-3 py-1.5 text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider border-b border-gray-100 dark:border-slate-700">
                Copy
            </div>
            {items.map((item, index) => (
                <button
                    key={index}
                    onClick={() => handleItemClick(item)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-left"
                >
                    <ClipboardIcon size={14} />
                    <span className="flex-1">{item.label}</span>
                    <span className="text-xs text-gray-400 dark:text-slate-500 max-w-[100px] truncate font-mono">
                        {item.value.length > 20 ? item.value.slice(0, 20) + '...' : item.value}
                    </span>
                </button>
            ))}
        </div>
    );
}
