import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How React Toolbox handles your data and privacy.',
};

const LAST_UPDATED = '2026-05-10';

export default function PrivacyPage() {
  return (
    <article className="prose dark:prose-invert max-w-3xl mx-auto px-4 py-8">
      <h1>Privacy Policy</h1>
      <p>
        <em>Last updated: {LAST_UPDATED}</em>
      </p>

      <p>
        React Toolbox is a free collection of developer utilities. This policy describes what
        data we handle and how. The short version: almost everything you do happens in your
        browser, and we collect as little as possible.
      </p>

      <h2>No accounts, no logins</h2>
      <p>
        React Toolbox does not require you to create an account, sign in, or provide any
        personal information. There is no user database.
      </p>

      <h2>Data processed in your browser</h2>
      <p>
        The tools (JSON Visualizer, JSON Compare, Mermaid Editor, etc.) operate entirely
        client-side. Any text, JSON, SVG, code, or other content you paste into a tool is
        processed in your browser and is not transmitted to our servers.
      </p>

      <h2>Local storage</h2>
      <p>
        We use your browser&apos;s <code>localStorage</code> to remember preferences such as
        your theme (light/dark), recent inputs for some tools, and your cookie-consent choice
        (key <code>cookie-consent</code>). This data stays on your device. You can clear it at
        any time via your browser settings.
      </p>

      <h2>Analytics (optional, consent-gated)</h2>
      <p>
        If analytics is enabled by the site operator and you click &ldquo;Accept&rdquo; on the
        cookie banner, we may load Google Analytics 4 to record anonymous, aggregate usage
        (page views, basic device info, IP-anonymized region). This helps us understand which
        tools are useful. If you click &ldquo;Decline&rdquo;, no analytics scripts are loaded
        and no analytics cookies are set.
      </p>

      <h2>Advertising</h2>
      <p>
        This site may, in the future, display ads via Google AdSense or a similar provider.
        When ads are present, they will only load after you grant consent. Ad providers may set
        their own cookies, governed by their own privacy policies.
      </p>

      <h2>Server-side data</h2>
      <p>
        The site is hosted on Vercel. As with any web host, Vercel automatically receives
        standard request metadata (IP address, user agent, request path, timestamp) for
        reliability and abuse prevention. We do not collect, store, or analyze server-side
        request logs ourselves beyond what the hosting provider retains.
      </p>

      <h2>What we do not do</h2>
      <ul>
        <li>We do not sell your data.</li>
        <li>We do not share your data with third parties for marketing.</li>
        <li>We do not target children under 13.</li>
        <li>We do not track you across other websites.</li>
      </ul>

      <h2>Your choices</h2>
      <ul>
        <li>Decline cookies — analytics will not load.</li>
        <li>Clear browser storage — removes all preferences and consent state.</li>
        <li>Use the site without consent — all core tools work without analytics.</li>
      </ul>

      <h2>Contact</h2>
      <p>
        Questions, concerns, or takedown requests? Open an issue on the project&apos;s{' '}
        <a
          href="https://github.com/jagadeesh52423/reactToolBox"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub repository
        </a>
        .
      </p>
    </article>
  );
}
