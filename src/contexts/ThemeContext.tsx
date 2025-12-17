'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ThemeMode, ResolvedTheme, ThemeContextValue, THEME_STORAGE_KEY } from '@/types/theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Hook to access theme context
 * @throws Error if used outside ThemeProvider
 */
export function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}

interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: ThemeMode;
}

/**
 * ThemeProvider Component
 *
 * Provides theme context to the application with support for:
 * - Light, dark, and auto (system) modes
 * - localStorage persistence
 * - System preference detection and listening
 * - Smooth transitions
 */
export function ThemeProvider({ children, defaultTheme = 'auto' }: ThemeProviderProps) {
    const [theme, setThemeState] = useState<ThemeMode>(defaultTheme);
    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
    const [mounted, setMounted] = useState(false);

    // Get system preference
    const getSystemTheme = useCallback((): ResolvedTheme => {
        if (typeof window === 'undefined') return 'light';
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }, []);

    // Resolve theme based on mode
    const resolveTheme = useCallback((mode: ThemeMode): ResolvedTheme => {
        if (mode === 'auto') {
            return getSystemTheme();
        }
        return mode;
    }, [getSystemTheme]);

    // Apply theme to document
    const applyTheme = useCallback((resolved: ResolvedTheme) => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(resolved);
        setResolvedTheme(resolved);
    }, []);

    // Set theme handler
    const setTheme = useCallback((newTheme: ThemeMode) => {
        setThemeState(newTheme);
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
        applyTheme(resolveTheme(newTheme));
    }, [applyTheme, resolveTheme]);

    // Initialize on mount
    useEffect(() => {
        const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
        const initialTheme = stored || defaultTheme;
        setThemeState(initialTheme);
        applyTheme(resolveTheme(initialTheme));
        setMounted(true);
    }, [defaultTheme, applyTheme, resolveTheme]);

    // Listen for system preference changes (for auto mode)
    useEffect(() => {
        if (!mounted) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'auto') {
                applyTheme(getSystemTheme());
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [mounted, theme, applyTheme, getSystemTheme]);

    // Prevent hydration mismatch - render children even before mount
    // The ThemeScript handles initial state
    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
