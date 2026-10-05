import JsonLd from '@/components/JsonLd';
import { NAME, PERSON_ID, PROFILES, SITE, WEBSITE_ID } from '@/lib/site';

// The site and the person it's about. Other pages point at these by @id — the homepage's
// ProfilePage, and the author/provider of each service and case study. alternateName tells search
// engines "Bekre" and "Bekretsion" are the same person; sameAs links the profiles elsewhere that
// belong to him.
//
// Rendered by the homepage and by PageShell, not the root layout: /work is the page pasted into
// Upwork proposals and applications, and it must carry no contact details, not even hidden ones.
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: SITE,
      name: NAME,
      inLanguage: 'en',
      publisher: { '@id': PERSON_ID },
    },
    {
      '@type': 'Person',
      '@id': PERSON_ID,
      name: NAME,
      givenName: 'Bekretsion',
      familyName: 'Seyoum',
      alternateName: ['Bekre', 'Bekretsion'],
      jobTitle: 'Software Engineer',
      worksFor: { '@type': 'Organization', name: 'Pyronix AI', url: 'https://www.pyronix.tech/' },
      description:
        'Backend software engineer in Addis Ababa, Ethiopia, building real-time APIs, AI voice receptionists in Amharic and 95+ languages, and business automation.',
      url: SITE,
      image: `${SITE}/me.jpg`,
      email: 'mailto:bekretsionseyoum4@gmail.com',
      address: { '@type': 'PostalAddress', addressLocality: 'Addis Ababa', addressCountry: 'ET' },
      alumniOf: {
        '@type': 'CollegeOrUniversity',
        name: 'Hope Enterprise University College',
        url: 'https://www.heuc.edu.et/',
      },
      award: ['National finalist, ALX Ethiopia × Kuriftu Hospitality Hackathon 2026'],
      knowsAbout: [
        'Backend development',
        'Full-stack development',
        'Next.js',
        'React',
        'Node.js',
        'TypeScript',
        'PostgreSQL',
        'Real-time systems',
        'WebSockets',
        'Voice AI',
        'ElevenLabs',
        'Vapi',
        'Business automation',
        'n8n',
        'Amharic voice assistants',
      ],
      sameAs: [PROFILES.linkedin, PROFILES.github, PROFILES.youtube],
    },
  ],
};

export default function SiteJsonLd() {
  return <JsonLd data={structuredData} />;
}
