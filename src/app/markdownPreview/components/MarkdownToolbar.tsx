'use client';

import React, { RefObject } from 'react';
import {
    BoldIcon,
    ItalicIcon,
    HeadingIcon,
    LinkIcon,
    InlineCodeIcon,
    CodeBlockIcon,
    ListIcon,
    QuoteIcon,
    IconProps,
} from '@/components/shared/Icons';
import { TOOLBAR_ACTIONS, applyToolbarAction, ToolbarActionId } from '../utils/toolbarActions';

interface MarkdownToolbarProps {
    textareaRef: RefObject<HTMLTextAreaElement | null>;
    onChange: (value: string) => void;
}

const TOOLBAR_BUTTONS: { id: ToolbarActionId; Icon: React.FC<IconProps> }[] = [
    { id: 'bold', Icon: BoldIcon },
    { id: 'italic', Icon: ItalicIcon },
    { id: 'heading', Icon: HeadingIcon },
    { id: 'link', Icon: LinkIcon },
    { id: 'code', Icon: InlineCodeIcon },
    { id: 'codeBlock', Icon: CodeBlockIcon },
    { id: 'list', Icon: ListIcon },
    { id: 'quote', Icon: QuoteIcon },
];

/**
 * Formatting toolbar for the markdown editor. Inserts/wraps markdown syntax at the
 * current cursor or selection in the underlying textarea.
 */
export default function MarkdownToolbar({ textareaRef, onChange }: MarkdownToolbarProps) {
    const handleAction = (id: ToolbarActionId) => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        applyToolbarAction(textarea, onChange, TOOLBAR_ACTIONS[id].config);
    };

    return (
        <div className="flex items-center gap-1 px-3 py-2 bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200/50 dark:border-slate-700/50 flex-wrap">
            {TOOLBAR_BUTTONS.map(({ id, Icon }) => (
                <button
                    key={id}
                    type="button"
                    onClick={() => handleAction(id)}
                    title={TOOLBAR_ACTIONS[id].title}
                    aria-label={TOOLBAR_ACTIONS[id].title}
                    className="p-1.5 rounded text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                >
                    <Icon size={16} />
                </button>
            ))}
        </div>
    );
}
