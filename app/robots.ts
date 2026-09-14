import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

// AI search and assistant crawlers, named so a proxy's managed robots rules can't quietly
// shut them out. A crawler follows only its most specific group, so each repeats the /api/ rule.
const AI_CRAWLERS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  'PerplexityBot',
  'Perplexity-User',
  'Claude-SearchBot',
  'Claude-User',
  'ClaudeBot',
  'Google-Extended',
  'Applebot-Extended',
];

export default function robots(): MetadataRoute.Robots {
  return {
    // The API routes are the voice agent's booking tools; nothing there is a page.
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/'] },
      { userAgent: AI_CRAWLERS, allow: '/', disallow: ['/api/'] },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
