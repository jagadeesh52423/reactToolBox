/**
 * Shared JSON Type Styles
 *
 * Consistent styling for JSON value types across the application.
 * Used by JSON Visualizer, JSON Compare, and other JSON tools.
 */

export interface TypeStyle {
    color: string;
    darkColor: string;
    bgColor: string;
    darkBgColor: string;
    borderColor: string;
    darkBorderColor: string;
    icon: string;
    label: string;
}

export const JSON_TYPE_STYLES: Record<string, TypeStyle> = {
    STRING: {
        color: 'text-green-600',
        darkColor: 'dark:text-green-400',
        bgColor: 'bg-green-50',
        darkBgColor: 'dark:bg-green-900/20',
        borderColor: 'border-green-200',
        darkBorderColor: 'dark:border-green-500/30',
        icon: 'ABC',
        label: 'String'
    },
    NUMBER: {
        color: 'text-blue-600',
        darkColor: 'dark:text-blue-400',
        bgColor: 'bg-blue-50',
        darkBgColor: 'dark:bg-blue-900/20',
        borderColor: 'border-blue-200',
        darkBorderColor: 'dark:border-blue-500/30',
        icon: '123',
        label: 'Number'
    },
    BOOLEAN: {
        color: 'text-purple-600',
        darkColor: 'dark:text-purple-400',
        bgColor: 'bg-purple-50',
        darkBgColor: 'dark:bg-purple-900/20',
        borderColor: 'border-purple-200',
        darkBorderColor: 'dark:border-purple-500/30',
        icon: '0/1',
        label: 'Boolean'
    },
    NULL: {
        color: 'text-gray-500',
        darkColor: 'dark:text-gray-400',
        bgColor: 'bg-gray-50',
        darkBgColor: 'dark:bg-gray-900/20',
        borderColor: 'border-gray-200',
        darkBorderColor: 'dark:border-gray-500/30',
        icon: 'Ø',
        label: 'Null'
    },
    ARRAY: {
        color: 'text-amber-600',
        darkColor: 'dark:text-amber-400',
        bgColor: 'bg-amber-50',
        darkBgColor: 'dark:bg-amber-900/20',
        borderColor: 'border-amber-200',
        darkBorderColor: 'dark:border-amber-500/30',
        icon: '[ ]',
        label: 'Array'
    },
    OBJECT: {
        color: 'text-cyan-600',
        darkColor: 'dark:text-cyan-400',
        bgColor: 'bg-cyan-50',
        darkBgColor: 'dark:bg-cyan-900/20',
        borderColor: 'border-cyan-200',
        darkBorderColor: 'dark:border-cyan-500/30',
        icon: '{ }',
        label: 'Object'
    }
};

// Diff-specific styles
export const DIFF_TYPE_STYLES = {
    ADDED: {
        color: 'text-emerald-600',
        darkColor: 'dark:text-emerald-400',
        bgColor: 'bg-emerald-50',
        darkBgColor: 'dark:bg-emerald-900/20',
        borderColor: 'border-emerald-300',
        darkBorderColor: 'dark:border-emerald-500/30',
        label: 'added'
    },
    REMOVED: {
        color: 'text-red-600',
        darkColor: 'dark:text-red-400',
        bgColor: 'bg-red-50',
        darkBgColor: 'dark:bg-red-900/20',
        borderColor: 'border-red-300',
        darkBorderColor: 'dark:border-red-500/30',
        label: 'removed'
    },
    CHANGED: {
        color: 'text-amber-600',
        darkColor: 'dark:text-amber-400',
        bgColor: 'bg-amber-50',
        darkBgColor: 'dark:bg-amber-900/20',
        borderColor: 'border-amber-300',
        darkBorderColor: 'dark:border-amber-500/30',
        label: 'changed'
    },
    UNCHANGED: {
        color: 'text-gray-600',
        darkColor: 'dark:text-gray-400',
        bgColor: 'bg-gray-50',
        darkBgColor: 'dark:bg-slate-800/30',
        borderColor: 'border-gray-200',
        darkBorderColor: 'dark:border-slate-600',
        label: 'unchanged'
    }
};

/**
 * Get the type of a JSON value
 */
export function getJsonValueType(value: unknown): keyof typeof JSON_TYPE_STYLES {
    if (value === null) return 'NULL';
    if (Array.isArray(value)) return 'ARRAY';
    switch (typeof value) {
        case 'string': return 'STRING';
        case 'number': return 'NUMBER';
        case 'boolean': return 'BOOLEAN';
        case 'object': return 'OBJECT';
        default: return 'NULL';
    }
}

/**
 * Get combined Tailwind classes for a JSON type
 */
export function getTypeClasses(type: keyof typeof JSON_TYPE_STYLES): string {
    const style = JSON_TYPE_STYLES[type];
    return `${style.color} ${style.darkColor}`;
}

/**
 * Get combined Tailwind classes for a diff type
 */
export function getDiffTypeClasses(type: keyof typeof DIFF_TYPE_STYLES): string {
    const style = DIFF_TYPE_STYLES[type];
    return `${style.color} ${style.darkColor}`;
}

/**
 * Get background classes for a diff type
 */
export function getDiffBgClasses(type: keyof typeof DIFF_TYPE_STYLES): string {
    const style = DIFF_TYPE_STYLES[type];
    return `${style.bgColor} ${style.darkBgColor} ${style.borderColor} ${style.darkBorderColor}`;
}
