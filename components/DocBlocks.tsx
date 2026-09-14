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

export function ContactCta({ subject }: { subject: string }) {
  return (
    <aside className="doc-cta">
      <h2>Work with me</h2>
      <p>Tell me what your business needs and I&rsquo;ll reply with how I&rsquo;d build it.</p>
      <a className="doc-button" href={`mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`}>
        Email me
      </a>
      <p className="doc-cta-address">{EMAIL}</p>
    </aside>
  );
}
