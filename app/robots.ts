import type { MetadataRoute } from 'next';

const SITE = 'https://www.bekretsion.com';

export default function robots(): MetadataRoute.Robots {
  return {
    // The API routes are the voice agent's booking tools; nothing there is a page.
    rules: { userAgent: '*', allow: '/', disallow: ['/api/'] },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
