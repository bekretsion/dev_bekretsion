'use client';

import { RefObject, useEffect, useMemo, useRef } from 'react';
import { stories, arrangeStories, storyCategoryLabel, StoryCategory } from '@/lib/portfolio-data';

interface StoryModalProps {
  shown: boolean;
  open: boolean;
  origin: { x: string; y: string };
  closeRef: RefObject<HTMLButtonElement | null>;
  close: () => void;
  highlightCategory: StoryCategory | null;
}

export default function StoryModal({ shown, open, origin, closeRef, close, highlightCategory }: StoryModalProps) {
  const highlightedRef = useRef<HTMLElement | null>(null);
  const arranged = useMemo(
    () => (highlightCategory ? arrangeStories(highlightCategory) : stories),
    [highlightCategory]
  );

  useEffect(() => {
    if (shown && highlightedRef.current) {
      highlightedRef.current.scrollIntoView({ block: 'center', behavior: 'auto' });
    }
  }, [shown]);

  return (
    <div
      className={`project-panel${open ? ' open' : ''}`}
      hidden={!shown}
      style={{ '--ox': origin.x, '--oy': origin.y } as React.CSSProperties}
    >
      <div className="pp-inner" role="dialog" aria-modal="true" aria-label="Background and stories">
        <header className="pp-header">
          <div>
            <button ref={closeRef} type="button" className="pp-back" onClick={close}>
              ← Back
            </button>
            <div>
              <span className="pp-tag">{highlightCategory ? storyCategoryLabel[highlightCategory] : 'Background'}</span>
              <h2>A few things worth mentioning.</h2>
            </div>
          </div>
        </header>

        <div className="story-board">
          {arranged.map((s, i) => {
            const lit = s.category === highlightCategory;
            return (
              <article
                key={s.id}
                ref={(el) => {
                  // Scroll target is the first lit card; they lead the board.
                  if (lit && i === 0) highlightedRef.current = el;
                }}
                className={`story-card${s.span === 'lg' ? ' span-lg' : ''}${s.pinned ? ' pinned' : ''}${lit ? ' highlight' : ''}`}
                style={{ '--tilt': `${s.rotation}deg` } as React.CSSProperties}
                tabIndex={0}
              >
                <span className="tag">{storyCategoryLabel[s.category]}</span>
                {s.stat && <div className="story-stat">{s.stat}</div>}
                <h4>{s.title}</h4>
                <p>{s.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
