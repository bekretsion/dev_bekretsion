import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageShell from '@/components/PageShell';
import JsonLd from '@/components/JsonLd';
import { ContactCta, Facts } from '@/components/DocBlocks';
import { caseStudies, caseStudyBySlug } from '@/lib/case-studies';
import { pageMetadata } from '@/lib/seo';
import { NAME, PERSON_ID, SITE, WEBSITE_ID, formatDate } from '@/lib/site';

type Props = { params: Promise<{ slug: string }> };

// Only the listed case studies exist; anything else under /projects/ is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const study = caseStudyBySlug((await params).slug);
  if (!study) return {};
  return pageMetadata({
    title: study.metaTitle,
    description: study.description,
    path: `/projects/${study.slug}`,
    type: 'article',
  });
}

export default async function CaseStudyPage({ params }: Props) {
  const study = caseStudyBySlug((await params).slug);
  if (!study) notFound();

  const url = `${SITE}/projects/${study.slug}`;
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: `${study.title}: ${study.tag} case study`,
        description: study.summary,
        url,
        mainEntityOfPage: url,
        inLanguage: 'en',
        datePublished: study.published,
        dateModified: study.updated,
        author: { '@id': PERSON_ID },
        publisher: { '@id': PERSON_ID },
        isPartOf: { '@id': WEBSITE_ID },
        keywords: study.stack.join(', '),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
          { '@type': 'ListItem', position: 2, name: study.title, item: url },
        ],
      },
    ],
  };

  return (
    <PageShell>
      <main className="doc">
        <JsonLd data={data} />
        <nav className="doc-crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true"> / </span>
          <Link href="/#grid">Projects</Link>
          <span aria-hidden="true"> / </span>
          {study.title}
        </nav>
        <span className="eyebrow">{study.tag} · case study</span>
        <h1>{study.title}</h1>
        <p className="lede">{study.summary}</p>
        <p className="doc-meta">
          By {NAME} · Updated <time dateTime={study.updated}>{formatDate(study.updated)}</time>
        </p>
        <Facts facts={study.facts} />
        <section>
          <h2>What I built</h2>
          <ul>
            {study.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2>Stack</h2>
          <ul className="doc-stack">
            {study.stack.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
        {study.links.length > 0 && (
          <section>
            <h2>See it</h2>
            <ul>
              {study.links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noopener">
                    {l.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
        <ContactCta subject={`About ${study.title}`} />
      </main>
    </PageShell>
  );
}
