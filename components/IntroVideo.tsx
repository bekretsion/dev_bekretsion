'use client';

import Image from 'next/image';
import { useState } from 'react';
import { intro } from '@/lib/portfolio-data';

// A poster with a play button stands in for the YouTube player until the visitor asks for it:
// the player's scripts (around a megabyte) never load for people who don't watch, and the click
// that swaps it in counts as a user gesture, so the video starts right away, with sound, inside
// the page.
export default function IntroVideo() {
  const [playing, setPlaying] = useState(false);

  return (
    <figure className="intro">
      <div className="intro-frame" style={{ aspectRatio: intro.aspect }}>
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${intro.youtubeId}?autoplay=1&playsinline=1&rel=0`}
            title={intro.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            type="button"
            className="intro-poster"
            onClick={() => setPlaying(true)}
            aria-label={`Play intro video: ${intro.title}`}
          >
            <Image
              src={`https://i.ytimg.com/vi/${intro.youtubeId}/maxresdefault.jpg`}
              alt=""
              fill
              sizes="(max-width: 1099px) 768px, 44vw"
              loading="eager"
            />
            <span className="intro-play" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
            </span>
          </button>
        )}
      </div>
      <figcaption className="intro-caption">
        <span className="eyebrow">Intro</span>
        <span className="intro-title">{intro.title}</span>
      </figcaption>
    </figure>
  );
}
