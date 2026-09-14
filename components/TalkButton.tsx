'use client';

import { OPEN_CALL_EVENT } from '@/lib/call';

/** An inline "Talk to me" call to action. Opens the same call panel as the floating launcher. */
export default function TalkButton({ children = 'Talk to me' }: { children?: React.ReactNode }) {
  return (
    <button type="button" className="talk-button" onClick={() => window.dispatchEvent(new Event(OPEN_CALL_EVENT))}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v4a2 2 0 0 1-2 2C9.5 21 3 14.5 3 6a2 2 0 0 1 1-2z" />
      </svg>
      {children}
    </button>
  );
}
