import type { AnalyticsProvider } from './types';
import { createGa4Provider } from './providers/ga4';

// implement AnalyticsProvider and call registerProvider() to add a new analytics backend.
const providers: AnalyticsProvider[] = [];

export function registerProvider(provider: AnalyticsProvider): void {
  if (providers.some((p) => p.name === provider.name)) return;
  providers.push(provider);
}

export function getEnabledProviders(): AnalyticsProvider[] {
  return [...providers];
}

export function clearProviders(): void {
  providers.length = 0;
}

let bootstrapped = false;

export function bootstrapProviders(): void {
  if (bootstrapped) return;
  bootstrapped = true;

  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (gaId) {
    registerProvider(createGa4Provider(gaId));
  }
  // Future: if (process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) registerProvider(createPlausibleProvider(...));
}
