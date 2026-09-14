import Link from 'next/link';
import { caseStudies } from '@/lib/case-studies';
import { services } from '@/lib/services';
import { EMAIL, PROFILES } from '@/lib/site';

// On every page: the internal links that let crawlers (and people) reach each service and case study.
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <h2>Services</h2>
        <ul>
          {services.map((s) => (
            <li key={s.slug}>
              <Link href={`/${s.slug}`}>{s.name}</Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Case studies</h2>
        <ul>
          {caseStudies.map((c) => (
            <li key={c.slug}>
              <Link href={`/projects/${c.slug}`}>{c.title}</Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Contact</h2>
        <ul>
          <li>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </li>
          <li>
            <a href={PROFILES.linkedin} target="_blank" rel="noopener">
              LinkedIn
            </a>
          </li>
          <li>
            <a href={PROFILES.github} target="_blank" rel="noopener">
              GitHub
            </a>
          </li>
          <li>
            <a href={PROFILES.youtube} target="_blank" rel="noopener">
              YouTube
            </a>
          </li>
        </ul>
      </div>
      <p className="site-footer-note">Bekretsion Seyoum · software engineer · Addis Ababa, Ethiopia</p>
    </footer>
  );
}
