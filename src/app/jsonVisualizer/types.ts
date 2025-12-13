export type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

export interface JsonViewProps {
    data: JSONValue;
    level?: number;
    path?: string[];
    onDelete: (path: string[]) => void;
    onUpdate?: (path: string[], newValue: JSONValue) => void;
}

export interface JsonViewRef {
    expandAll: () => void;
    collapseAll: () => void;
    searchNodes: (searchText: string, level?: number, isFilterEnabled?: boolean, isFuzzyEnabled?: boolean) => void;
}

export interface TypeStyle {
    color: string;
    icon: string;
}
