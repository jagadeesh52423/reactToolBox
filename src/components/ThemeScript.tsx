import React from 'react';

/**
 * ThemeScript Component
 *
 * Inline script that runs before React hydration to prevent
 * flash of wrong theme on page load.
 *
 * This script:
 * 1. Reads the saved theme preference from localStorage
 * 2. Checks system preference if theme is 'auto' or not set
 * 3. Applies the correct class to <html> immediately
 */
export function ThemeScript() {
    const script = `
        (function() {
            try {
                var stored = localStorage.getItem('reactToolBox-theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                var isDark = stored === 'dark' || ((stored === 'auto' || !stored) && prefersDark);
                document.documentElement.classList.add(isDark ? 'dark' : 'light');
            } catch (e) {
                document.documentElement.classList.add('light');
            }
        })();
    `;

    return (
        <script
            dangerouslySetInnerHTML={{ __html: script }}
            suppressHydrationWarning
        />
    );
}

export default ThemeScript;
