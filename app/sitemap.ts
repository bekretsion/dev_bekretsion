import type { MetadataRoute } from 'next';

const SITE = 'https://www.bekretsion.com';

// One page today. Add each new page (case studies, the automation page) here as it ships.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 }];
}
