'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Conversation } from '@elevenlabs/client';
import type { Mode, Status } from '@elevenlabs/client';
import { useOverlay } from '@/lib/useOverlay';
import { profile } from '@/lib/portfolio-data';
import { OPEN_CALL_EVENT } from '@/lib/call';
import { EMAIL_PATTERN } from '@/lib/lead';

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

// The greeting bubble: shown once per visit, a few seconds in, until opened or dismissed.
const BUBBLE_DELAY_MS = 7000;
const BUBBLE_DISMISSED_KEY = 'bk-call-bubble-dismissed';

interface TranscriptEntry {
  id: number;
  role: 'user' | 'agent';
  text: string;
}

function sessionFlag(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function setSessionFlag(key: string) {
  try {
    sessionStorage.setItem(key, '1');
  } catch {
    // Blocked storage: the bubble may just show again on the next page.
  }
}

export default function CallPanel() {
  const overlay = useOverlay();

  const [mode, setMode] = useState<'idle' | 'voice' | 'text'>('idle');
  const [status, setStatus] = useState<Status>('disconnected');
  const [agentMode, setAgentMode] = useState<Mode>('listening');
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [textInput, setTextInput] = useState('');
  const [bubble, setBubble] = useState(false);
  const [nudge, setNudge] = useState(false);

  // The "type your email instead" box, opened by the agent's show_email_box tool.
  const [emailBox, setEmailBox] = useState<'hidden' | 'open' | 'done'>('hidden');
  const [emailDraft, setEmailDraft] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const typedEmailRef = useRef<string | null>(null);

  const conversationRef = useRef<Conversation | null>(null);
  const nextIdRef = useRef(0);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ block: 'end' });
  }, [transcript]);

  function openPanel() {
    setBubble(false);
    setSessionFlag(BUBBLE_DISMISSED_KEY);
    overlay.openAt({ x: '50%', y: '50%' });
  }
  // Inline "Talk to me" buttons open the panel through a window event; the ref keeps the
  // listener pointed at the current render's openPanel.
  const openRef = useRef(openPanel);
  openRef.current = openPanel;

  useEffect(() => {
    const onOpen = () => openRef.current();
    window.addEventListener(OPEN_CALL_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CALL_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (sessionFlag(BUBBLE_DISMISSED_KEY)) return;
    const timer = setTimeout(() => {
      if (sessionFlag(BUBBLE_DISMISSED_KEY)) return;
      setBubble(true);
      setNudge(true);
    }, BUBBLE_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  function dismissBubble() {
    setBubble(false);
    setSessionFlag(BUBBLE_DISMISSED_KEY);
  }

  function resetEmailBox() {
    setEmailBox('hidden');
    setEmailDraft('');
    setEmailError(null);
    typedEmailRef.current = null;
  }

  async function endCall() {
    await conversationRef.current?.endSession();
    conversationRef.current = null;
    setMode('idle');
    setStatus('disconnected');
    setTranscript([]);
    resetEmailBox();
  }

  function close() {
    void endCall();
    overlay.close();
  }

  async function start(textOnly: boolean) {
    setError(null);
    setTranscript([]);
    resetEmailBox();

    if (!AGENT_ID) {
      setError('The assistant isn’t configured yet — no agent ID set.');
      return;
    }

    try {
      if (!textOnly) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      const conversation = await Conversation.startSession({
        agentId: AGENT_ID,
        // Text chats go over a websocket: WebRTC is built for audio, and a text-only session over
        // it closed right after the first message.
        connectionType: textOnly ? 'websocket' : 'webrtc',
        textOnly,
        clientTools: {
          // Shows the email field on screen; the agent calls it right after asking for an email.
          show_email_box: async () => {
            setEmailBox('open');
            return 'The email box is now showing on their screen.';
          },
          // Sends the lead. A typed email always wins over what the model heard or copied.
          submit_lead: async (params: Record<string, unknown>) => {
            const email = typedEmailRef.current ?? (typeof params.email === 'string' ? params.email : '');
            try {
              const res = await fetch('/api/lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...params, email, conversationId: conversationRef.current?.getId() }),
              });
              const data = await res.json().catch(() => ({}));
              if (res.ok) {
                setEmailBox('hidden');
                return 'Saved. Tell them Bekretsion will be in touch soon.';
              }
              return `Not saved: ${data.error ?? 'unknown error'}`;
            } catch {
              return 'Not saved: network error. Ask them to try again in a moment.';
            }
          },
        },
        onConnect: () => setStatus('connected'),
        onDisconnect: (details) => {
          setStatus('disconnected');
          conversationRef.current = null;
          setMode('idle');
          if (details.reason === 'error') {
            setError(('message' in details && details.message) || 'The connection dropped. Please try again.');
          }
        },
        onError: (message) => setError(message),
        onMessage: ({ message, role }) => {
          setTranscript((prev) => [...prev, { id: nextIdRef.current++, role, text: message }]);
        },
        onModeChange: ({ mode }) => setAgentMode(mode),
        onStatusChange: ({ status }) => setStatus(status),
      });
      conversationRef.current = conversation;
      setMode(textOnly ? 'text' : 'voice');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start — check microphone permissions.');
    }
  }

  function submitTypedEmail(e: React.FormEvent) {
    e.preventDefault();
    const email = emailDraft.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      setEmailError('That doesn’t look like an email address.');
      return;
    }
    typedEmailRef.current = email;
    setEmailError(null);
    setEmailBox('done');
    sendAsUser(`My email is ${email}`);
    setTimeout(() => setEmailBox((box) => (box === 'done' ? 'hidden' : box)), 1600);
  }

  /** Messages sent from the page aren't echoed back by the SDK, so show them in the chat here. */
  function sendAsUser(text: string) {
    if (!conversationRef.current) return;
    conversationRef.current.sendUserMessage(text);
    setTranscript((prev) => [...prev, { id: nextIdRef.current++, role: 'user', text }]);
  }

  function sendText() {
    const text = textInput.trim();
    if (!text) return;
    sendAsUser(text);
    setTextInput('');
  }

  function toggleMute() {
    const next = !muted;
    conversationRef.current?.setMicMuted(next);
    setMuted(next);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && overlay.open) close();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlay.open]);

  useEffect(() => () => void conversationRef.current?.endSession(), []);

  return (
    <>
      {bubble && !overlay.shown && (
        <div className="call-bubble">
          <button type="button" className="call-bubble-body" onClick={openPanel}>
            <strong>Hi, I’m Bekretsion’s assistant.</strong>
            <span>Tell me what you’re working on and I’ll set up a talk with him.</span>
          </button>
          <button type="button" className="call-bubble-close" aria-label="Dismiss" onClick={dismissBubble}>
            ×
          </button>
        </div>
      )}

      <button
        type="button"
        className={`call-launcher${nudge ? ' nudge' : ''}`}
        onClick={openPanel}
        aria-label="Talk to Bekretsion’s assistant"
      >
        <span className="call-launcher-avatar" aria-hidden="true">
          <span className="call-launcher-face">
            {profile.photo ? (
              <Image src={profile.photo} alt="" width={96} height={96} />
            ) : (
              <span>{profile.initials}</span>
            )}
          </span>
          <span className="call-launcher-dot" />
        </span>
        <span className="call-launcher-text">
          <strong>Talk to me</strong>
          <span>AI assistant · 2 min</span>
        </span>
      </button>

      <div className={`call-backdrop${overlay.open ? ' open' : ''}`} hidden={!overlay.shown} onClick={close} />

      <div className={`call-modal-wrap${overlay.open ? ' open' : ''}`} hidden={!overlay.shown}>
        <div
          className="call-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Talk to Bekretsion’s assistant"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="call-modal-header">
            <div>
              <span className="pp-tag">Talk to me</span>
              <h2>Tell my assistant what you’re working on.</h2>
              <p>It asks a few quick questions and sets up a talk with me. Voice or text, about two minutes.</p>
            </div>
            <button ref={overlay.closeRef} type="button" className="call-modal-close" onClick={close} aria-label="Close">
              ×
            </button>
          </header>

          <div className="call-board">
            {mode === 'idle' && (
              <div className="call-start">
                {error && <p className="call-error">{error}</p>}
                <div className="call-start-actions">
                  <button type="button" className="call-start-btn" onClick={() => start(false)}>
                    <svg viewBox="0 0 24 24">
                      <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
                      <path d="M19 11a7 7 0 0 1-14 0M12 18v3" />
                    </svg>
                    Start a voice call
                  </button>
                  <button type="button" className="call-start-btn" onClick={() => start(true)}>
                    <svg viewBox="0 0 24 24">
                      <path d="M4 4h16v12H7l-3 3z" />
                    </svg>
                    Start a text chat
                  </button>
                </div>
              </div>
            )}

            {mode !== 'idle' && (
              <div className="call-active">
                <div className="call-status">
                  <span className={`call-status-dot call-status-${status}`} />
                  {status === 'connecting' && 'Connecting…'}
                  {status === 'connected' &&
                    (mode === 'text'
                      ? agentMode === 'speaking' ? 'Typing…' : 'Online'
                      : agentMode === 'speaking' ? 'Speaking…' : 'Listening…')}
                  {status === 'disconnecting' && 'Ending…'}
                  {status === 'disconnected' && 'Disconnected'}
                </div>

                <div className="call-transcript">
                  {transcript.length === 0 && <p className="call-transcript-empty">Connecting you with the assistant…</p>}
                  {transcript.map((t) => (
                    <p key={t.id} className={`call-line call-line-${t.role}`}>
                      {t.text}
                    </p>
                  ))}
                  <div ref={transcriptEndRef} />
                </div>

                {emailBox !== 'hidden' && (
                  <form className="call-email" onSubmit={submitTypedEmail} noValidate>
                    {emailBox === 'done' ? (
                      <p className="call-email-done">✓ Got it</p>
                    ) : (
                      <>
                        <label htmlFor="call-email-input">Prefer to type your email?</label>
                        <div className="call-email-row">
                          <input
                            id="call-email-input"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            autoCapitalize="none"
                            spellCheck={false}
                            placeholder="you@company.com"
                            value={emailDraft}
                            onChange={(e) => setEmailDraft(e.target.value)}
                          />
                          <button type="submit">Submit</button>
                          <button
                            type="button"
                            className="call-email-close"
                            aria-label="Close email box"
                            onClick={() => setEmailBox('hidden')}
                          >
                            ×
                          </button>
                        </div>
                        {emailError && <p className="call-email-error">{emailError}</p>}
                      </>
                    )}
                  </form>
                )}

                <div className="call-controls">
                  {mode === 'voice' && (
                    <button type="button" className="call-mute" aria-pressed={muted} onClick={toggleMute}>
                      {muted ? 'Unmute' : 'Mute'}
                    </button>
                  )}
                  {mode === 'text' && (
                    <div className="call-text-row">
                      <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') sendText();
                        }}
                        placeholder="Type a message…"
                        aria-label="Message"
                      />
                      <button type="button" onClick={sendText}>
                        Send
                      </button>
                    </div>
                  )}
                  <button type="button" className="call-end" onClick={endCall}>
                    End
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
