import Link from 'next/link';
import type { Rich } from '@/lib/rich';

/** Renders Rich copy: internal hrefs become client-side links, external ones open in a new tab. */
export default function RichText({ value }: { value: Rich }) {
  return (
    <>
      {value.map((part, i) => {
        if (typeof part === 'string') return part;
        if (part.href.startsWith('/')) {
          return (
            <Link key={i} href={part.href}>
              {part.text}
            </Link>
          );
        }
        return (
          <a key={i} href={part.href} target="_blank" rel="noopener">
            {part.text}
          </a>
        );
      })}
    </>
  );
}
