import TalkButton from './TalkButton';
import { EMAIL } from '@/lib/site';

/** The row of headline numbers near the top of a service or case-study page. */
export function Facts({ facts }: { facts: { value: string; label: string }[] }) {
  if (!facts.length) return null;
  return (
    <dl className="doc-facts">
      {facts.map((f) => (
        <div className="doc-fact" key={f.label}>
          <dt>{f.value}</dt>
          <dd>{f.label}</dd>
        </div>
      ))}
    </dl>
  );
}

/** End-of-page call to action: talk to the assistant first, email as the fallback. */
export function ContactCta({ subject }: { subject: string }) {
  return (
    <aside className="doc-cta">
      <h2>Let&rsquo;s talk about your project</h2>
      <p>Tell my assistant what you need. It takes about two minutes, and I&rsquo;ll follow up personally.</p>
      <TalkButton />
      <p className="doc-cta-address">
        Prefer email? <a href={`mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`}>{EMAIL}</a>
      </p>
    </aside>
  );
}
