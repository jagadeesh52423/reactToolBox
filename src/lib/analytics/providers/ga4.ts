import type { AnalyticsProvider } from '../types';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function createGa4Provider(measurementId: string): AnalyticsProvider {
  let loaded = false;

  return {
    name: 'ga4',

    load() {
      if (loaded || typeof window === 'undefined') return;
      if (!measurementId) return;

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer!.push(args);
      };
      window.gtag('js', new Date());
      window.gtag('config', measurementId, { anonymize_ip: true });

      loaded = true;
    },

    pageview(url: string) {
      if (typeof window === 'undefined' || !window.gtag) return;
      window.gtag('config', measurementId, { page_path: url });
    },

    event(name: string, props?: Record<string, unknown>) {
      if (typeof window === 'undefined' || !window.gtag) return;
      window.gtag('event', name, props ?? {});
    },
  };
}
