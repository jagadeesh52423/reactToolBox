'use client';

import RegexTesterTool from './components/RegexTesterTool';

/**
 * Regex Tester Page
 *
 * Test and debug regular expressions with live matching.
 *
 * Features:
 * - Live regex matching with highlighted results
 * - Flag toggles (g, i, m, s)
 * - Common regex presets
 * - Match groups and capture display
 * - Match highlighting overlay on test string
 */
export default function RegexTesterPage() {
    return <RegexTesterTool />;
}
