'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { projects, profile } from '@/lib/portfolio-data';
import { caseStudyForProject } from '@/lib/case-studies';
import { originFromEvent } from '@/lib/dom';
import { useOverlay } from '@/lib/useOverlay';
import ShapeField from './ShapeField';
import CallPanel from './CallPanel';
import IntroVideo from './IntroVideo';
import SiteFooter from './SiteFooter';
import TalkButton from './TalkButton';

const MUTED_PATHS = ['M5 9v6h4l5 5V4l-5 5H5z', 'M17 9l4 6M21 9l-4 6'];
const UNMUTED_PATHS = ['M5 9v6h4l5 5V4l-5 5H5z', 'M16 8a5 5 0 0 1 0 8M18.5 5.5a9 9 0 0 1 0 13'];

export default function PortfolioApp() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [focusPane, setFocusPane] = useState<'live' | 'video' | null>(null);
  const [videoUnmuted, setVideoUnmuted] = useState(false);
  const [toggleOn, setToggleOn] = useState(true);
  const [actionDone, setActionDone] = useState(false);
  const [siteLoaded, setSiteLoaded] = useState(false);

  const {
    shown: projectShown,
    open: projectOpen,
    origin: projectOrigin,
    closeRef: projectCloseRef,
    openAt: openProjectAt,
    close: closeProject,
  } = useOverlay();

  const actionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = projects.find((p) => p.id === openId);
  const currentStudy = caseStudyForProject(openId);

  function openProject(id: string, e: React.SyntheticEvent<HTMLElement>) {
    setOpenId(id);
    setToggleOn(true);
    setActionDone(false);
    setVideoUnmuted(false);
    setFocusPane(null);
    setSiteLoaded(false);
    openProjectAt(originFromEvent(e));
  }

  function handleAction() {
    if (actionDone) return;
    setActionDone(true);
    if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
    actionTimeoutRef.current = setTimeout(() => setActionDone(false), 1500);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && projectOpen) closeProject();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [projectOpen, closeProject]);

  useEffect(() => () => {
    if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
  }, []);

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <span className={`avatar${profile.photo ? '' : ' avatar-empty'}`}>
            {profile.photo ? (
              <Image src={profile.photo} alt={profile.name} width={96} height={96} />
            ) : (
              <span aria-hidden="true">{profile.initials}</span>
            )}
          </span>
          <div className="wordmark">
            Bekretsion
            <span className="wordmark-last">
              <span className="wordmark-dot"> · </span>Seyoum
            </span>
          </div>
        </div>
        <div className="topbar-right">
          <div className="social-links">
            <a
              className="social-link"
              href="https://www.linkedin.com/in/bekretsion-seyoum"
              target="_blank"
              rel="noopener"
              aria-label="LinkedIn"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              <span>LinkedIn</span>
            </a>
            <a className="social-link" href="mailto:bekretsionseyoum4@gmail.com" aria-label="Email">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3.5 7l8.5 6 8.5-6" />
              </svg>
              <span>Email</span>
            </a>
            <a className="social-link" href="https://github.com/bekretsion" target="_blank" rel="noopener" aria-label="GitHub">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.930 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              <span>GitHub</span>
            </a>
          </div>
          <div className="tag">open to remote</div>
        </div>
      </header>

      <main>
        <section className="hero-zone">
          <div className="hero-intro-col">
            <IntroVideo />
          </div>
          <ShapeField>
            <div className="hero">
              {/* The name line is the page's h1: it's what people search for. The tagline keeps the big type. */}
              <h1 className="eyebrow">Bekretsion Seyoum · backend software engineer · Addis Ababa, Ethiopia</h1>
              <p className="tagline">
                Real-time backends, <span className="nowrap">multi-tenant</span> APIs, and voice AI that picks up the
                phone.
              </p>
              <p>
                Five things I built, below — open a card to see the build and its walkthrough side by side.
                <span className="hide-mobile">
                  {' '}
                  The shapes standing in front of this wall hold the rest: work, a hackathon final, an internship,
                  and education.
                </span>
              </p>
              <div className="legend">
                <TalkButton />
                <a href="#grid">↓ Projects</a>
              </div>
            </div>
          </ShapeField>
        </section>

        <div className="wrap">
          <section className="grid-section" id="grid">
            <div className="section-head">
              <span className="eyebrow">Projects</span>
              <h2>Things I&rsquo;ve built</h2>
              <p>
                A voice AI receptionist, a real-time collaboration backend, and automations for leads, invoices and
                video. Open a card to see how each one works.
              </p>
            </div>
            <div className="grid">
              {projects.map((p, i) => (
                <article
                  key={p.id}
                  className={`card${i === 0 ? ' featured' : ''}`}
                  tabIndex={0}
                  role="button"
                  aria-label={`Open ${p.title}`}
                  onClick={(e) => openProject(p.id, e)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter' && e.key !== ' ') return;
                    e.preventDefault();
                    openProject(p.id, e);
                  }}
                >
                  <div className="preview" aria-hidden="true">
                    <div className="preview-motion" />
                    <span className="mute-btn">
                      <svg viewBox="0 0 24 24">
                        {MUTED_PATHS.map((d) => (
                          <path key={d} d={d} />
                        ))}
                      </svg>
                    </span>
                  </div>
                  <div className="card-body">
                    <span className="tag">{p.tag}</span>
                    <span className="card-title">{p.title}</span>
                    <p className="card-desc">{p.short}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="talk-band" aria-labelledby="talk-band-title">
            <div>
              <h2 id="talk-band-title">Have something in mind?</h2>
              <p>Tell my assistant what you&rsquo;re working on. It takes about two minutes, and I&rsquo;ll follow up personally.</p>
            </div>
            <TalkButton />
          </section>
        </div>
      </main>

      <SiteFooter />

      <CallPanel />

      <div
        className={`project-panel${projectOpen ? ' open' : ''}`}
        hidden={!projectShown}
        style={{ '--ox': projectOrigin.x, '--oy': projectOrigin.y } as React.CSSProperties}
      >
        <div className="pp-inner" role="dialog" aria-modal="true" aria-label="Project detail">
          <header className="pp-header">
            <div>
              <button ref={projectCloseRef} type="button" className="pp-back" onClick={closeProject}>
                ← Back to projects
              </button>
              <div>
                <span className="pp-tag">{current?.tag}</span>
                <h2>{current?.title}</h2>
                <p>{current?.short}</p>
              </div>
            </div>
            <div className="pp-actions">
              {currentStudy && (
                <Link className="pp-link" href={`/projects/${currentStudy.slug}`}>
                  Read the case study →
                </Link>
              )}
              {current?.liveUrl && (
                <a className="pp-link" href={current.liveUrl} target="_blank" rel="noopener">
                  Open live site ↗
                </a>
              )}
            </div>
          </header>

          {current?.embed && current.liveUrl ? (
            <div className="panel-body">
              <div className="pane pane-site">
                <div className="browser-chrome">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                  <span className="chrome-url">{current.url}</span>
                </div>
                <div className="site-frame">
                  {!siteLoaded && <p className="site-loading">Loading {current.url}…</p>}
                  {/* Only while the window is open, so the site isn't running behind a closed panel. */}
                  {projectShown && (
                    <iframe
                      key={current.id}
                      src={current.liveUrl}
                      title={`${current.title}, live site`}
                      allow="microphone; clipboard-write"
                      referrerPolicy="strict-origin-when-cross-origin"
                      onLoad={() => setSiteLoaded(true)}
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="panel-body" data-focus={focusPane ?? undefined} onMouseLeave={() => setFocusPane(null)}>
              <div className="pane pane-live" onMouseEnter={() => setFocusPane('live')}>
                <div className="browser-chrome">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                  <span className="chrome-url">{current?.url}</span>
                </div>
                <div className="live-content">
                  <div className="live-row">
                    <span className="toggle-label">{current?.toggleLabel}</span>
                    <button
                      type="button"
                      className="toggle"
                      aria-pressed={toggleOn}
                      aria-label={current?.toggleLabel}
                      onClick={() => setToggleOn((v) => !v)}
                    />
                  </div>
                  <button type="button" className="action-btn" data-done={actionDone} onClick={handleAction}>
                    {actionDone ? current?.doneLabel : current?.actionLabel}
                  </button>
                  <div className="status-rows">
                    {current?.rows.map(([label, value]) => (
                      <div className="status-row" key={label}>
                        <span>{label}</span>
                        <b>{value}</b>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="pane pane-video"
                aria-pressed={videoUnmuted}
                aria-label="Project video, tap to unmute"
                onClick={() => setVideoUnmuted((v) => !v)}
                onMouseEnter={() => setFocusPane('video')}
              >
                <div className="preview-motion" />
                <span className="mute-btn">
                  <svg viewBox="0 0 24 24">
                    {(videoUnmuted ? UNMUTED_PATHS : MUTED_PATHS).map((d) => (
                      <path key={d} d={d} />
                    ))}
                  </svg>
                </span>
                <span className="eq" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
