'use client';

import { useEffect, useRef, useState } from 'react';
import { Conversation } from '@elevenlabs/client';
import type { Mode, Status } from '@elevenlabs/client';
import { useOverlay } from '@/lib/useOverlay';

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

interface TranscriptEntry {
  id: number;
  role: 'user' | 'agent';
  text: string;
}

export default function CallPanel() {
  const overlay = useOverlay();
  const fabRef = useRef<HTMLButtonElement>(null);

  const [mode, setMode] = useState<'idle' | 'voice' | 'text'>('idle');
  const [status, setStatus] = useState<Status>('disconnected');
  const [agentMode, setAgentMode] = useState<Mode>('listening');
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [textInput, setTextInput] = useState('');

  const conversationRef = useRef<Conversation | null>(null);
  const nextIdRef = useRef(0);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ block: 'end' });
  }, [transcript]);

  function open(e: React.SyntheticEvent<HTMLElement>) {
    overlay.openAt({ x: '50%', y: '50%' });
    void e;
  }

  async function endCall() {
    await conversationRef.current?.endSession();
    conversationRef.current = null;
    setMode('idle');
    setStatus('disconnected');
    setTranscript([]);
  }

  function close() {
    void endCall();
    overlay.close();
  }

  async function start(textOnly: boolean) {
    setError(null);
    setTranscript([]);

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
        connectionType: 'webrtc',
        textOnly,
        onConnect: () => setStatus('connected'),
        onDisconnect: () => {
          setStatus('disconnected');
          conversationRef.current = null;
          setMode('idle');
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

  function sendText() {
    const text = textInput.trim();
    if (!text || !conversationRef.current) return;
    conversationRef.current.sendUserMessage(text);
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
      <button ref={fabRef} type="button" className="call-fab" onClick={open}>
        <svg viewBox="0 0 24 24">
          <path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v4a2 2 0 0 1-2 2C9.5 21 3 14.5 3 6a2 2 0 0 1 1-2z" />
        </svg>
        <span className="call-fab-label">Talk to me</span>
      </button>

      <div className={`call-backdrop${overlay.open ? ' open' : ''}`} hidden={!overlay.shown} onClick={close} />

      <div className={`call-modal-wrap${overlay.open ? ' open' : ''}`} hidden={!overlay.shown}>
        <div
          className="call-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Talk to an AI assistant"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="call-modal-header">
            <div>
              <span className="pp-tag">Book time with me</span>
              <h2>Talk it through with my assistant.</h2>
              <p>It can check my calendar and book a slot directly — you’ll get an email, I’ll get a ping.</p>
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
                  {status === 'connected' && (agentMode === 'speaking' ? 'Speaking…' : 'Listening…')}
                  {status === 'disconnecting' && 'Ending…'}
                  {status === 'disconnected' && 'Disconnected'}
                </div>

                <div className="call-transcript">
                  {transcript.length === 0 && <p className="call-transcript-empty">Say hello, or ask about booking a time.</p>}
                  {transcript.map((t) => (
                    <p key={t.id} className={`call-line call-line-${t.role}`}>
                      {t.text}
                    </p>
                  ))}
                  <div ref={transcriptEndRef} />
                </div>

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
