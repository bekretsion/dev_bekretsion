import PortfolioApp from '@/components/PortfolioApp';
import JsonLd from '@/components/JsonLd';
import { PERSON_ID, SITE, SITE_TITLE, WEBSITE_ID } from '@/lib/site';

// The homepage is the page *about* the person, so the ProfilePage lives here only; the Person
// node itself is declared once in the root layout and referenced by @id.
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
      <JsonLd data={profilePage} />
      <PortfolioApp />
    </>
  );
}
