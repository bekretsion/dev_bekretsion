import Link from 'next/link';
import JsonLd from './JsonLd';
import RichText from './RichText';
import { ContactCta, Facts } from './DocBlocks';
import { plainText } from '@/lib/rich';
import { NAME, PERSON_ID, SITE, WEBSITE_ID, formatDate } from '@/lib/site';
import type { ServiceDoc } from '@/lib/services';

export default function ServiceDocument({ doc }: { doc: ServiceDoc }) {
  const url = `${SITE}/${doc.slug}`;
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#page`,
        url,
        name: doc.metaTitle,
        description: doc.description,
        inLanguage: 'en',
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': `${url}#service` },
        author: { '@id': PERSON_ID },
        dateModified: doc.updated,
      },
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: doc.name,
        serviceType: doc.serviceType,
        description: doc.lede,
        url,
        provider: { '@id': PERSON_ID },
        areaServed: { '@type': 'Country', name: 'Ethiopia' },
        ...(doc.availableLanguage ? { availableLanguage: doc.availableLanguage } : {}),
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: doc.faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: plainText(f.a) },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
          { '@type': 'ListItem', position: 2, name: doc.name, item: url },
        ],
      },
    ],
  };

  return (
    <main className="doc">
      <JsonLd data={data} />
      <nav className="doc-crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true"> / </span>
        {doc.name}
      </nav>
      <span className="eyebrow">{doc.eyebrow}</span>
      <h1>{doc.title}</h1>
      <p className="lede">{doc.lede}</p>
      <p className="doc-meta">
        {NAME} · Addis Ababa, Ethiopia · Updated <time dateTime={doc.updated}>{formatDate(doc.updated)}</time>
      </p>
      <Facts facts={doc.facts} />
      {doc.sections.map((s) => (
        <section key={s.heading}>
          <h2>{s.heading}</h2>
          {s.paragraphs?.map((p, i) => (
            <p key={i}>
              <RichText value={p} />
            </p>
          ))}
          {s.items && (
            <ul>
              {s.items.map((item, i) => (
                <li key={i}>
                  <RichText value={item} />
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
      <section>
        <h2>Questions</h2>
        {doc.faq.map((f) => (
          <div className="doc-qa" key={f.q}>
            <h3>{f.q}</h3>
            <p>
              <RichText value={f.a} />
            </p>
          </div>
        ))}
      </section>
      <ContactCta subject={doc.name} />
    </main>
  );
}
