'use client';

import Image from 'next/image';
import Link from 'next/link';
import { RefObject, useEffect, useMemo, useRef } from 'react';
import { storiesFor, storyCategoryLabel, StoryCategory } from '@/lib/portfolio-data';

interface StoryModalProps {
  shown: boolean;
  open: boolean;
  origin: { x: string; y: string };
  closeRef: RefObject<HTMLButtonElement | null>;
  close: () => void;
  /** The shape that was opened; only its category's cards are on the board. */
  category: StoryCategory | null;
}

export default function StoryModal({ shown, open, origin, closeRef, close, category }: StoryModalProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const cards = useMemo(() => (category ? storiesFor(category) : []), [category]);
  const label = category ? storyCategoryLabel[category] : 'Background';

  // Each shape's board starts at the top, wherever the last one was scrolled to.
  useEffect(() => {
    if (shown && boardRef.current) boardRef.current.scrollTop = 0;
  }, [shown, category]);

  return (
    <div
      className={`project-panel${open ? ' open' : ''}`}
      hidden={!shown}
      style={{ '--ox': origin.x, '--oy': origin.y } as React.CSSProperties}
    >
      <div className="pp-inner" role="dialog" aria-modal="true" aria-label={label}>
        <header className="pp-header">
          <div>
            <button ref={closeRef} type="button" className="pp-back" onClick={close}>
              ← Back
            </button>
            <h2>{label}</h2>
          </div>
        </header>

        <div className="story-board" ref={boardRef}>
          {cards.map((s) => {
            const photos = s.media?.filter((m) => m.type === 'image') ?? [];
            const clips = s.media?.filter((m) => m.type === 'video') ?? [];
            return (
            <article
              key={s.id}
              className={`story-card${s.span === 'lg' ? ' span-lg' : ''}${s.pinned ? ' pinned' : ''}`}
              style={{ '--tilt': `${s.rotation}deg` } as React.CSSProperties}
              tabIndex={0}
            >
              {s.stat && <div className="story-stat">{s.stat}</div>}
              <h4>{s.title}</h4>
              <p>{s.body}</p>
              {photos.length > 0 && (
                <div className={`story-shots${photos.length > 1 ? ' two' : ''}`}>
                  {photos.map((m) => (
                    <Image
                      key={m.src}
                      src={m.src}
                      alt={m.alt}
                      width={m.width}
                      height={m.height}
                      sizes="(max-width: 760px) 90vw, 360px"
                      // Landscape shots get a wider frame; portraits a taller one. Nothing stretches.
                      style={{ aspectRatio: m.width >= m.height ? '4 / 3' : '4 / 5' }}
                    />
                  ))}
                </div>
              )}
              {clips.map((m) => (
                <video
                  key={m.src}
                  className="story-video"
                  src={m.src}
                  poster={m.poster}
                  aria-label={m.alt}
                  controls
                  preload="none"
                  playsInline
                />
              ))}
              {s.link &&
                (s.link.href.startsWith('/') ? (
                  <Link className="story-link" href={s.link.href}>
                    {s.link.label} →
                  </Link>
                ) : (
                  <a className="story-link" href={s.link.href} target="_blank" rel="noopener">
                    {s.link.label} ↗
                  </a>
                ))}
            </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
