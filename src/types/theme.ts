/**
 * Theme System Types
 *
 * Defines types for the global theming system supporting
 * light, dark, and auto (system preference) modes.
 */

/** Theme mode selected by user */
export type ThemeMode = 'light' | 'dark' | 'auto';

/** Resolved theme actually applied to the UI */
export type ResolvedTheme = 'light' | 'dark';

/** Theme context value provided to consumers */
export interface ThemeContextValue {
    /** Current theme mode setting */
    theme: ThemeMode;
    /** Resolved theme (what is actually displayed) */
    resolvedTheme: ResolvedTheme;
    /** Function to change the theme */
    setTheme: (theme: ThemeMode) => void;
}

/** localStorage key for persisting theme preference */
export const THEME_STORAGE_KEY = 'reactToolBox-theme';
