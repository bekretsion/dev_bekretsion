import PortfolioApp from '@/components/PortfolioApp';
import JsonLd from '@/components/JsonLd';
import SiteJsonLd from '@/components/SiteJsonLd';
import { PERSON_ID, SITE, SITE_TITLE, WEBSITE_ID } from '@/lib/site';

// The homepage is the page *about* the person, so the ProfilePage lives here only; the Person
// node itself comes from SiteJsonLd and is referenced by @id.
const profilePage = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  '@id': `${SITE}/#page`,
  url: SITE,
  name: SITE_TITLE,
  inLanguage: 'en',
  isPartOf: { '@id': WEBSITE_ID },
  mainEntity: { '@id': PERSON_ID },
  dateModified: '2026-09-14',
};

export default function Home() {
  return (
    <>
      <SiteJsonLd />
      <JsonLd data={profilePage} />
      <PortfolioApp />
    </>
  );
}
