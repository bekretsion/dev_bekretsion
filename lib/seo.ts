import type { Metadata } from 'next';
import { NAME } from './site';

// The share card from app/opengraph-image.tsx. A page that sets its own openGraph or twitter
// block replaces the inherited one wholesale (image included), so every page passes it again.
const SHARE_IMAGE = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: `${NAME} — software engineer in Addis Ababa, Ethiopia`,
};

/** Title, description, canonical, share card and X card for an inner page, all in one place. */
export function pageMetadata({
  title,
  description,
  path,
  type = 'website',
}: {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type, title, description, url: path, siteName: NAME, locale: 'en_US', images: [SHARE_IMAGE] },
    twitter: { card: 'summary_large_image', title, description, images: [SHARE_IMAGE.url] },
  };
}
