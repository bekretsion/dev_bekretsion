import Image from 'next/image';
import Link from 'next/link';
import { profile } from '@/lib/portfolio-data';
import SiteFooter from './SiteFooter';

// Header and footer for the inner pages (services, case studies). Server-rendered: no client JS.
export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="doc-top">
        <Link href="/" className="brand doc-brand" aria-label="Bekretsion Seyoum, home">
          <span className={`avatar${profile.photo ? '' : ' avatar-empty'}`}>
            {profile.photo ? (
              <Image src={profile.photo} alt="" width={96} height={96} />
            ) : (
              <span aria-hidden="true">{profile.initials}</span>
            )}
          </span>
          <span className="wordmark">
            Bekretsion
            <span className="wordmark-last">
              <span className="wordmark-dot"> · </span>Seyoum
            </span>
          </span>
        </Link>
        <nav className="doc-nav" aria-label="Site">
          <Link href="/#grid">Projects</Link>
          <Link href="/ai-voice-receptionist">AI receptionist</Link>
          <Link href="/business-automation">Automation</Link>
        </nav>
      </header>
      {children}
      <SiteFooter />
    </>
  );
}
