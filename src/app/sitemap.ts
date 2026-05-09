import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

const TOOL_ROUTES: string[] = [
  '/base64',
  '/colorPicker',
  '/cronParser',
  '/csvConverter',
  '/htmlFormatter',
  '/jsonCompare',
  '/jsonVisualizer',
  '/markdownPreview',
  '/mermaidEditor',
  '/regexTester',
  '/textCompare',
  '/textUtilities',
  '/timestampConverter',
  '/uuidGenerator',
];

const LEGAL_ROUTES: string[] = ['/privacy', '/terms'];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: SITE_URL, lastModified, changeFrequency: 'monthly', priority: 1.0 },
    ...TOOL_ROUTES.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...LEGAL_ROUTES.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    })),
  ];
}
