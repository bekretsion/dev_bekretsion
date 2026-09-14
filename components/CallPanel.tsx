'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Conversation } from '@elevenlabs/client';
import type { Mode, Status } from '@elevenlabs/client';
import { useOverlay } from '@/lib/useOverlay';
import { profile } from '@/lib/portfolio-data';
import { OPEN_CALL_EVENT, TALK_LIMIT_SECONDS } from '@/lib/call';
import { EMAIL_PATTERN } from '@/lib/lead';
import { EMAIL } from '@/lib/site';

// The greeting bubble: shown once per visit, a few seconds in, until opened or dismissed.
const BUBBLE_DELAY_MS = 7000;
const BUBBLE_DISMISSED_KEY = 'bk-call-bubble-dismissed';

// With this much talk time left, the agent is told to get the visitor's details or wrap up.
const WRAP_UP_SECONDS = 60;

// Tabs of the site tell each other when a call starts, so one browser never has two calls going.
const CALL_CHANNEL = 'bk-call';

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

/** 192 → "3:12" */
function formatClock(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/** What to tell the visitor when a call can't start. */
function startErrorMessage(err: unknown): string {
  if (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'SecurityError')) {
    return 'Allow microphone access to start a voice call, or start a text chat instead.';
  }
  if (err instanceof DOMException && err.name === 'NotFoundError') {
    return 'No microphone was found. You can start a text chat instead.';
  }
  return err instanceof Error ? err.message : 'Could not start the assistant. Please try again.';
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

  // Talk time this device has left, in seconds. /api/talk keeps the real count; null until asked.
  const [remaining, setRemaining] = useState<number | null>(null);
  const deadlineRef = useRef<number | null>(null);
  const wrapUpSentRef = useRef(false);

  // The call on screen, from the click until it ends; null when there is none. Every start gets a
  // new number, and anything belonging to an older call (a connection that finishes after End was
  // pressed, a late disconnect event) sees its number is no longer current and is dropped or shut down.
  const callRef = useRef<number | null>(null);
  const callCountRef = useRef(0);
  const conversationRef = useRef<Conversation | null>(null);
  const mutedRef = useRef(false);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const nextIdRef = useRef(0);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ block: 'end' });
  }, [transcript]);

  function openPanel() {
    setBubble(false);
    setSessionFlag(BUBBLE_DISMISSED_KEY);
    overlay.openAt({ x: '50%', y: '50%' });
    if (callRef.current === null) void refreshRemaining();
  }

  async function refreshRemaining() {
    try {
      const res = await fetch('/api/talk', { cache: 'no-store' });
      const data = await res.json();
      if (typeof data.remainingSeconds === 'number') setRemaining(data.remainingSeconds);
    } catch {
      // Not knowing is fine: starting a session checks again.
    }
  }

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

  /** Takes the panel back to the start screen and hands back the open session, if there was one. */
  function resetCall(): Conversation | null {
    const conversation = conversationRef.current;
    callRef.current = null;
    conversationRef.current = null;
    deadlineRef.current = null;
    setMode('idle');
    setStatus('disconnected');
    setTranscript([]);
    resetEmailBox();
    return conversation;
  }

  /** Ends the call at once, including one that is still connecting. */
  function endCall() {
    void resetCall()?.endSession();
  }

  function close() {
    endCall();
    overlay.close();
  }

  // Window events and other tabs reach the panel through refs, so they always call this render's code.
  const openRef = useRef(openPanel);
  openRef.current = openPanel;
  const endCallRef = useRef(endCall);
  endCallRef.current = endCall;

  useEffect(() => {
    const onOpen = () => openRef.current();
    window.addEventListener(OPEN_CALL_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CALL_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel(CALL_CHANNEL);
    channelRef.current = channel;
    channel.onmessage = () => {
      if (callRef.current === null) return;
      endCallRef.current();
      setError('You started a call in another tab, so this one ended.');
    };
    return () => {
      channel.close();
      channelRef.current = null;
    };
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

  async function start(textOnly: boolean) {
    if (callRef.current !== null) return; // one call at a time
    const call = ++callCountRef.current;
    callRef.current = call;
    const isCurrent = () => callRef.current === call;

    // The call screen, with Mute and End, shows straight away; connecting happens behind it.
    setError(null);
    setTranscript([]);
    resetEmailBox();
    setMuted(false);
    mutedRef.current = false;
    setAgentMode('listening');
    setStatus('connecting');
    setMode(textOnly ? 'text' : 'voice');
    channelRef.current?.postMessage('call-started');

    try {
      if (!textOnly) {
        // Ask for the microphone before taking a pass. The SDK opens its own stream, so this one closes.
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        if (!isCurrent()) return;
      }

      // The server hands out a one-time pass only while this device has talk time left.
      const res = await fetch('/api/talk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: textOnly ? 'text' : 'voice' }),
      });
      const pass = await res.json().catch(() => ({}));
      if (!isCurrent()) return;
      if (typeof pass.remainingSeconds === 'number') setRemaining(pass.remainingSeconds);
      if (!res.ok) {
        resetCall();
        // 429 means the time is used up, which the start screen explains.
        if (res.status !== 429) setError(pass.error ?? 'Could not start the assistant. Please try again.');
        return;
      }
      wrapUpSentRef.current = false;

      const conversation = await Conversation.startSession({
        // Text chats go over a websocket: WebRTC is built for audio, and a text-only session over
        // it closed right after the first message.
        ...(textOnly
          ? { signedUrl: String(pass.signedUrl), connectionType: 'websocket' as const, textOnly: true }
          : { conversationToken: String(pass.conversationToken), connectionType: 'webrtc' as const }),
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
                return 'Saved. Tell them Bekre will be in touch soon.';
              }
              return `Not saved: ${data.error ?? 'unknown error'}`;
            } catch {
              return 'Not saved: network error. Ask them to try again in a moment.';
            }
          },
        },
        onConnect: () => {
          if (!isCurrent()) return;
          setStatus('connected');
          deadlineRef.current = Date.now() + pass.remainingSeconds * 1000;
        },
        onDisconnect: (details) => {
          if (!isCurrent()) return;
          resetCall();
          if (details.reason === 'error') {
            setError(('message' in details && details.message) || 'The connection dropped. Please try again.');
          }
        },
        onError: (message) => {
          if (isCurrent()) setError(message);
        },
        onMessage: ({ message, role }) => {
          if (!isCurrent()) return;
          // The expressive voice model lets the agent add audio tags like [warmly]; they're for the
          // voice, so keep them out of the chat.
          const text = role === 'agent' ? message.replace(/\[[^\]\n]{1,40}\]\s*/g, '').trim() : message;
          if (!text) return;
          setTranscript((prev) => [...prev, { id: nextIdRef.current++, role, text }]);
        },
        onModeChange: ({ mode }) => {
          if (isCurrent()) setAgentMode(mode);
        },
        onStatusChange: ({ status }) => {
          if (isCurrent()) setStatus(status);
        },
      });

      if (!isCurrent()) {
        // Ended while it was still connecting (End, closing the panel, a call in another tab).
        void conversation.endSession();
        return;
      }
      conversationRef.current = conversation;
      if (mutedRef.current) conversation.setMicMuted(true);
    } catch (err) {
      if (!isCurrent()) return;
      resetCall();
      setError(startErrorMessage(err));
    }
  }

  // Counts down this device's talk time during a session: near the end the agent is told to get the
  // visitor's details or wrap up, and at zero the session ends.
  const live = mode !== 'idle' && status === 'connected';
  useEffect(() => {
    if (!live) return;
    function tick() {
      if (deadlineRef.current === null) return;
      const left = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= WRAP_UP_SECONDS && !wrapUpSentRef.current) {
        wrapUpSentRef.current = true;
        conversationRef.current?.sendContextualUpdate(
          'Less than a minute is left in this conversation. If you don’t have their name and email yet, ask for them now; otherwise wrap up warmly.'
        );
      }
      if (left === 0) endCall();
    }
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live]);

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
    if (!text || !conversationRef.current) return;
    sendAsUser(text);
    setTextInput('');
  }

  function toggleMute() {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    // While still connecting there's no session yet; start() applies the choice once it connects.
    conversationRef.current?.setMicMuted(next);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && overlay.open) close();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlay.open]);

  useEffect(
    () => () => {
      callRef.current = null;
      void conversationRef.current?.endSession();
    },
    []
  );

  const connected = status === 'connected';

  return (
    <>
      {bubble && !overlay.shown && (
        <div className="call-bubble">
          <button type="button" className="call-bubble-body" onClick={openPanel}>
            <strong>Hi, I’m Bekre’s assistant.</strong>
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
                {remaining === 0 ? (
                  <div className="call-limit">
                    <strong>You’ve used your {TALK_LIMIT_SECONDS / 60} minutes with my assistant on this device.</strong>
                    <p>
                      Want to keep talking? Email me at <a href={`mailto:${EMAIL}`}>{EMAIL}</a> and I’ll get back to you.
                    </p>
                  </div>
                ) : (
                  <>
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
                    {remaining !== null && remaining < TALK_LIMIT_SECONDS && (
                      <p className="call-time-note">{formatClock(remaining)} of talk time left</p>
                    )}
                  </>
                )}
              </div>
            )}

            {mode !== 'idle' && (
              <div className="call-active">
                <div className="call-status">
                  <span className={`call-status-dot call-status-${status}`} />
                  {status === 'connecting' && 'Connecting…'}
                  {connected &&
                    (mode === 'text'
                      ? agentMode === 'speaking' ? 'Typing…' : 'Online'
                      : agentMode === 'speaking' ? 'Speaking…' : 'Listening…')}
                  {status === 'disconnecting' && 'Ending…'}
                  {status === 'disconnected' && 'Disconnected'}
                  {connected && remaining !== null && (
                    <span className={`call-timer${remaining <= WRAP_UP_SECONDS ? ' call-timer-low' : ''}`}>
                      {formatClock(remaining)} left
                    </span>
                  )}
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
                        id="call-text-input"
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') sendText();
                        }}
                        placeholder={connected ? 'Type a message…' : 'Connecting…'}
                        aria-label="Message"
                        disabled={!connected}
                      />
                      <button type="button" onClick={sendText} disabled={!connected}>
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
