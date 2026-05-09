// implement this interface to add a new analytics backend.
export interface AnalyticsProvider {
  name: string;
  load(): void;
  pageview(url: string): void;
  event(name: string, props?: Record<string, unknown>): void;
}
