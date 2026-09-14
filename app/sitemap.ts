import type { MetadataRoute } from 'next';
import { caseStudies } from '@/lib/case-studies';
import { services } from '@/lib/services';
import { SITE } from '@/lib/site';

// Every indexable page. New pages come from the data files, so they're listed automatically.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    ...services.map((s) => ({
      url: `${SITE}/${s.slug}`,
      lastModified: new Date(s.updated),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })),
    ...caseStudies.map((c) => ({
      url: `${SITE}/projects/${c.slug}`,
      lastModified: new Date(c.updated),
      changeFrequency: 'yearly' as const,
      priority: 0.7,
    })),
  ];
}
