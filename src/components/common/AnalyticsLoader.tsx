'use client';

import { useEffect } from 'react';
import { bootstrapProviders, getEnabledProviders } from '@/lib/analytics/registry';

const STORAGE_KEY = 'cookie-consent';
const CONSENT_EVENT = 'consent-changed';

function hasConsent(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'accepted';
  } catch {
    return false;
  }
}

export default function AnalyticsLoader() {
  useEffect(() => {
    bootstrapProviders();

    const loadIfConsented = () => {
      if (!hasConsent()) return;
      for (const provider of getEnabledProviders()) {
        provider.load();
      }
    };

    loadIfConsented();
    window.addEventListener(CONSENT_EVENT, loadIfConsented);
    return () => window.removeEventListener(CONSENT_EVENT, loadIfConsented);
  }, []);

  return null;
}
