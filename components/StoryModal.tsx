'use client';

import { RefObject, useEffect, useMemo, useRef } from 'react';
import { storiesFor, storyCategoryHeading, storyCategoryLabel, StoryCategory } from '@/lib/portfolio-data';

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
            <div>
              <span className="pp-tag">{label}</span>
              {category && <h2>{storyCategoryHeading[category]}</h2>}
            </div>
          </div>
        </header>

        <div className="story-board" ref={boardRef}>
          {cards.map((s) => (
            <article
              key={s.id}
              className={`story-card${s.span === 'lg' ? ' span-lg' : ''}${s.pinned ? ' pinned' : ''}`}
              style={{ '--tilt': `${s.rotation}deg` } as React.CSSProperties}
              tabIndex={0}
            >
              {s.stat && <div className="story-stat">{s.stat}</div>}
              <h4>{s.title}</h4>
              <p>{s.body}</p>
              {s.link && (
                <a className="story-link" href={s.link.href} target="_blank" rel="noopener">
                  {s.link.label} ↗
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
