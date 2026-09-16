'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { Project } from '@/lib/portfolio-data';

// A frame that never fires onLoad used to leave "Loading…" up with nothing able to end it.
// Measured against the real sites, a warm load lands in 1.4–2.5s and a cold Vercel edge in
// 6–10s, so this sits just past the cold case: long enough not to cut off a slow-but-fine
// load, short enough that nobody is left staring.
const LOAD_TIMEOUT_MS = 9000;

// Below this the frame is never mounted at all. A phone was downloading the remote app's
// entire bundle to render a 240px non-interactive strip; CSS can hide a frame but it cannot
// stop it loading, so the poster stands in instead.
const NARROW = '(max-width: 760px)';

const STEP_INTERVAL_MS = 620;

type EmbedStatus = 'loading' | 'ready' | 'failed';

const matches = (query: string) => typeof window !== 'undefined' && window.matchMedia(query).matches;

function BrowserChrome({ url }: { url: string }) {
  return (
    <div className="browser-chrome">
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
      <span className="chrome-url">{url}</span>
    </div>
  );
}

/** Stands in for the frame: on phones, and whenever a load fails or runs out of time. */
function DemoFallback({ project, reason }: { project: Project; reason: 'narrow' | 'failed' }) {
  return (
    <div className="demo-fallback">
      {project.poster && (
        <Image
          className="demo-poster"
          src={project.poster.src}
          alt={project.poster.alt}
          width={project.poster.width}
          height={project.poster.height}
          sizes="(max-width: 760px) 100vw, 60vw"
        />
      )}
      <div className="demo-fallback-note">
        <p>
          {reason === 'narrow'
            ? 'A still of the live site — it needs a wider screen to be worth using inside this window.'
            : 'The live site didn’t load in this frame.'}
        </p>
        {project.liveUrl && (
          <a className="demo-open" href={project.liveUrl} target="_blank" rel="noopener">
            Open {project.url} ↗
          </a>
        )}
      </div>
    </div>
  );
}

function EmbedPane({ project }: { project: Project }) {
  const [status, setStatus] = useState<EmbedStatus>('loading');
  const [narrow, setNarrow] = useState(() => matches(NARROW));

  useEffect(() => {
    const mq = window.matchMedia(NARROW);
    const sync = () => setNarrow(mq.matches);
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (status !== 'loading' || narrow) return;
    const timer = setTimeout(() => setStatus('failed'), LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [status, narrow]);

  return (
    <div className="pane pane-site">
      <BrowserChrome url={project.url} />
      {narrow || status === 'failed' ? (
        <DemoFallback project={project} reason={narrow ? 'narrow' : 'failed'} />
      ) : (
        <div className="site-frame">
          {status === 'loading' && (
            <p className="site-loading" role="status">
              Loading {project.url}…
            </p>
          )}
          <iframe
            src={project.embedUrl}
            title={`${project.title}, live site`}
            allow="microphone; clipboard-write"
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => setStatus('ready')}
            onError={() => setStatus('failed')}
          />
        </div>
      )}
    </div>
  );
}

/**
 * A recorded run, read back a line at a time. The label is not decoration: this pane used to
 * hold a toggle and an action button that changed nothing, next to a "video" that was a CSS
 * gradient. Anything standing in for a live system has to say that it is standing in.
 */
function ReplayPane({ project }: { project: Project }) {
  const replay = project.replay!;
  const total = replay.steps.length;
  const [revealed, setRevealed] = useState(0);
  const [run, setRun] = useState(0);

  // Every state change below happens in a timer callback rather than in the effect body,
  // so re-running the replay can't cascade renders.
  useEffect(() => {
    // Stepping through is the point, but it must not be the only way to read it.
    if (matches('(prefers-reduced-motion: reduce)')) {
      const id = setTimeout(() => setRevealed(total), 0);
      return () => clearTimeout(id);
    }
    const id = setInterval(() => {
      setRevealed((n) => {
        if (n >= total) return n;
        return n + 1;
      });
    }, STEP_INTERVAL_MS);
    return () => clearInterval(id);
  }, [total, run]);

  const finished = revealed >= total;

  return (
    <div className="pane pane-replay">
      <BrowserChrome url={project.url} />
      <div className="replay-content">
        <div className="replay-head">
          <span className="replay-label">{replay.label}</span>
          <button
            type="button"
            className="replay-again"
            disabled={!finished}
            onClick={() => {
              setRevealed(0);
              setRun((n) => n + 1);
            }}
          >
            ↻ Replay
          </button>
        </div>

        <ol className="replay-steps">
          {replay.steps.map((step, i) => (
            <li key={step.text} data-shown={i < revealed} className="replay-step">
              <span className="replay-at">{step.at ?? ''}</span>
              <span className="replay-body">
                <span className="replay-text">{step.text}</span>
                {step.detail && <span className="replay-detail">{step.detail}</span>}
              </span>
            </li>
          ))}
        </ol>

        {replay.outcome && (
          <p className="replay-outcome" data-shown={finished}>
            {replay.outcome}
          </p>
        )}

        <div className="status-rows">
          {project.rows.map(([label, value]) => (
            <div className="status-row" key={label}>
              <span>{label}</span>
              <b>{value}</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * `active` is the panel being open. Nothing here should load or animate behind a closed
 * panel, and remounting on open is what restarts a replay and re-arms the load timeout.
 */
export default function ProjectDemo({ project, active }: { project: Project | undefined; active: boolean }) {
  if (!project || !active) return null;

  return (
    <div className="panel-body">
      {project.embedUrl ? (
        <EmbedPane key={project.id} project={project} />
      ) : project.replay ? (
        <ReplayPane key={project.id} project={project} />
      ) : (
        <div className="pane pane-site">
          <BrowserChrome url={project.url} />
          <DemoFallback project={project} reason="failed" />
        </div>
      )}
    </div>
  );
}
