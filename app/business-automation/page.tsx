import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import ServiceDocument from '@/components/ServiceDocument';
import { pageMetadata } from '@/lib/seo';
import { serviceBySlug } from '@/lib/services';

const doc = serviceBySlug('business-automation');

export const metadata: Metadata = pageMetadata({
  title: doc.metaTitle,
  description: doc.description,
  path: `/${doc.slug}`,
});

export default function Page() {
  return (
    <PageShell>
      <ServiceDocument doc={doc} />
    </PageShell>
  );
}
