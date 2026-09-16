import type { Metadata } from 'next';
import { Facts } from '@/components/DocBlocks';
import { caseStudies } from '@/lib/case-studies';
import { NAME } from '@/lib/site';

// A deliberately bare page: no assistant, no email, no contact form and no links off it.
// It is the link to paste into Upwork proposals and job applications, where a page that can
// collect a client's details breaks the platform's rules about contacting people off it.
// Left out of search results on purpose: the case studies already cover this ground.
export const metadata: Metadata = {
  title: `Work samples — ${NAME}`,
  description: 'Backend and automation systems built by Bekretsion Seyoum: what each one does, how it works, and what it produced.',
  robots: { index: false, follow: false },
};

export default function WorkSamplesPage() {
  return (
    <main className="doc">
      <span className="eyebrow">Work samples</span>
      <h1>{NAME} — backend and automation work</h1>
      <p className="lede">
        Three systems I designed and built end to end. Each section covers what it does, how it works and what it
        produced when it ran.
      </p>
      {caseStudies.map((study) => (
        <section key={study.slug}>
          <h2>
            {study.title} · {study.tag}
          </h2>
          <p>{study.summary}</p>
          <Facts facts={study.facts} />
          <h3>What I built</h3>
          <ul>
            {study.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
          <h3>Stack</h3>
          <ul className="doc-stack">
            {study.stack.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
