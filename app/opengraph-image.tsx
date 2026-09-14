import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

// The card shown when the site is shared on LinkedIn, X, WhatsApp, Slack, etc.
// Rendered once at build time from the same photo the header uses.
export const dynamic = 'force-static';
export const alt = 'Bekretsion Seyoum — software engineer in Addis Ababa, Ethiopia';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// The text column gets an explicit width: the image renderer won't wrap text inside a
// flex row without one, and long lines run off the right edge of the card.
const PAD = 80;
const PHOTO = 260;
const GAP = 56;
const TEXT_WIDTH = size.width - PAD * 2 - PHOTO - GAP;

export default async function Image() {
  const photo = await readFile(path.join(process.cwd(), 'public', 'me.jpg'));
  const src = `data:image/jpeg;base64,${photo.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: `0 ${PAD}px`,
          gap: GAP,
          background: 'linear-gradient(135deg, #1C1A17 0%, #121110 60%)',
          color: '#F2ECE0',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: PHOTO,
            height: PHOTO,
            borderRadius: PHOTO / 2,
            overflow: 'hidden',
            border: '4px solid #E3A94A',
            flexShrink: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" width={PHOTO} height={PHOTO} style={{ objectFit: 'cover' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: TEXT_WIDTH }}>
          <div style={{ fontSize: 22, letterSpacing: 3, color: '#E3A94A', textTransform: 'uppercase' }}>
            Software engineer · Addis Ababa, Ethiopia
          </div>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05 }}>Bekretsion Seyoum</div>
          <div style={{ fontSize: 30, color: '#9C9285', lineHeight: 1.3 }}>
            Real-time backends, voice AI that picks up the phone, and business automation.
          </div>
          <div style={{ fontSize: 28, color: '#E3A94A', marginTop: 8 }}>bekretsion.com</div>
        </div>
      </div>
    ),
    size
  );
}
