'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'cookie-consent';
const CONSENT_EVENT = 'consent-changed';

type ConsentValue = 'accepted' | 'declined';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as ConsentValue | null;
      if (stored !== 'accepted' && stored !== 'declined') {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const persist = (value: ConsentValue) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Ignore storage failures (private mode, etc.)
    }
    window.dispatchEvent(new Event(CONSENT_EVENT));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-0 inset-x-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div className="max-w-3xl mx-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">
          We use cookies and local storage to remember your preferences. With your consent, we
          also load privacy-respecting analytics to understand which tools are useful. See our{' '}
          <a
            href="/privacy"
            className="underline text-blue-600 dark:text-blue-400 hover:no-underline"
          >
            Privacy Policy
          </a>
          .
        </p>
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => persist('declined')}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => persist('accepted')}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
