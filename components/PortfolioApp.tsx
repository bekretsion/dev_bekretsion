'use client';

import { useEffect, useRef, useState } from 'react';
import { projects, milestones, markerIconPaths, markerIconFor } from '@/lib/portfolio-data';
import { originFromEvent } from '@/lib/dom';
import { useOverlay } from '@/lib/useOverlay';
import ShapeField from './ShapeField';
import CallPanel from './CallPanel';

const MUTED_PATHS = ['M5 9v6h4l5 5V4l-5 5H5z', 'M17 9l4 6M21 9l-4 6'];
const UNMUTED_PATHS = ['M5 9v6h4l5 5V4l-5 5H5z', 'M16 8a5 5 0 0 1 0 8M18.5 5.5a9 9 0 0 1 0 13'];

export default function PortfolioApp() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [focusPane, setFocusPane] = useState<'live' | 'video' | null>(null);
  const [videoUnmuted, setVideoUnmuted] = useState(false);
  const [toggleOn, setToggleOn] = useState(true);
  const [actionDone, setActionDone] = useState(false);

  const [expandedMarker, setExpandedMarker] = useState<number | null>(null);
  const [markerPositions, setMarkerPositions] = useState<{ left: number; top: number }[] | null>(null);

  const {
    shown: projectShown,
    open: projectOpen,
    origin: projectOrigin,
    closeRef: projectCloseRef,
    openAt: openProjectAt,
    close: closeProject,
  } = useOverlay();
  const {
    shown: routeShown,
    open: routeOpen,
    closeRef: routeCloseRef,
    openAt: openRouteAt,
    close: closeRoute,
  } = useOverlay();

  const fabRef = useRef<HTMLButtonElement>(null);
  const roadPathRef = useRef<SVGPathElement>(null);
  const actionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = projects.find((p) => p.id === openId);

  function openProject(id: string, e: React.SyntheticEvent<HTMLElement>) {
    setOpenId(id);
    setToggleOn(true);
    setActionDone(false);
    setVideoUnmuted(false);
    setFocusPane(null);
    openProjectAt(originFromEvent(e));
  }

  function openRoute(e: React.SyntheticEvent<HTMLElement>) {
    openRouteAt(originFromEvent(e));
  }

  function handleAction() {
    if (actionDone) return;
    setActionDone(true);
    if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
    actionTimeoutRef.current = setTimeout(() => setActionDone(false), 1500);
  }

  useEffect(() => {
    if (!routeShown || markerPositions || !roadPathRef.current) return;
    const path = roadPathRef.current;
    const len = path.getTotalLength();
    setMarkerPositions(
      milestones.map((m) => {
        const pt = path.getPointAtLength(m.t * len);
        return { left: (pt.x / 400) * 100, top: (pt.y / 1000) * 100 };
      })
    );
  }, [routeShown, markerPositions]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      if (projectOpen) closeProject();
      else if (routeOpen) closeRoute();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [projectOpen, routeOpen, closeProject, closeRoute]);

  useEffect(() => () => {
    if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
  }, []);

  return (
    <>
      <header className="topbar">
        <div className="wordmark">
          Bekretison<span> · </span>Route
        </div>
        <div className="topbar-right">
          <div className="social-links">
            <a className="social-link" href="#" target="_blank" rel="noopener" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              <span>LinkedIn</span>
            </a>
            <a className="social-link" href="#" aria-label="Email">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3.5 7l8.5 6 8.5-6" />
              </svg>
              <span>Email</span>
            </a>
            <a className="social-link" href="#" target="_blank" rel="noopener" aria-label="GitHub">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              <span>GitHub</span>
            </a>
          </div>
          <div className="tag">work in progress</div>
        </div>
      </header>

      <main>
        <section className="hero-zone">
          <div className="hero-text-col">
            <div className="hero">
              <span className="eyebrow">Before we build the real site</span>
              <h1>Two interactions, working, so you can drive them before we commit.</h1>
              <p>
                Everything below is live. Tap a card to open it — the live build and its walkthrough video side by
                side. Then take the route in the corner. And the shapes on the right aren’t decoration.
              </p>
              <div className="legend">
                <a href="#grid">↓ Project cards</a>
                <button type="button" onClick={openRoute}>
                  ↓ The route
                </button>
              </div>
            </div>
          </div>
          <ShapeField />
        </section>

        <div className="wrap">
          <section className="grid-section" id="grid">
            <div className="section-head">
              <span className="eyebrow">Preview on the card</span>
              <h2>Projects, playing quietly</h2>
              <p>
                Each card loops a muted clip. Tap the card to open the project: the live build and its video, equal
                width, video muted. Hover either half and it takes the room; move away and they settle back to even.
              </p>
            </div>
            <div className="grid">
              {projects.map((p) => (
                <article
                  key={p.id}
                  className="card"
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
        </div>
      </main>

      <CallPanel />

      <button
        ref={fabRef}
        type="button"
        className="route-fab"
        aria-haspopup="dialog"
        aria-expanded={routeOpen}
        onClick={openRoute}
      >
        <svg viewBox="0 0 24 24">
          <path d="M4 20 L10 4 L14 4 L20 20 M8 13 L16 13" />
        </svg>
        Route
      </button>

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
              <a className="pp-link" href="#" target="_blank" rel="noopener">
                Open live site ↗
              </a>
            </div>
          </header>

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
        </div>
      </div>

      <div className={`route-overlay${routeOpen ? ' open' : ''}`} hidden={!routeShown} aria-hidden={!routeShown}>
        <div className="route-backdrop" onClick={closeRoute} />
        <div className="route-panel" role="dialog" aria-modal="true" aria-label="Milestone route">
          <div className="route-head">
            <div>
              <span className="eyebrow">The route</span>
              <h2>Every mile that got the work here.</h2>
            </div>
            <button ref={routeCloseRef} type="button" className="route-close" aria-label="Close route" onClick={closeRoute}>
              ×
            </button>
          </div>

          <div className="road-wrap">
            <svg className="road-svg" viewBox="0 0 400 1000" preserveAspectRatio="xMidYMid meet">
              <path
                className="road-bed"
                d="M200 980 C 20 900, 380 820, 200 740 C 20 660, 380 580, 200 500 C 20 420, 380 340, 200 260 C 40 190, 360 120, 200 40"
              />
              <path
                ref={roadPathRef}
                className="road-line"
                d="M200 980 C 20 900, 380 820, 200 740 C 20 660, 380 580, 200 500 C 20 420, 380 340, 200 260 C 40 190, 360 120, 200 40"
              />
            </svg>
            <div>
              {markerPositions &&
                milestones.map((m, i) => {
                  const pos = markerPositions[i];
                  const expanded = expandedMarker === i;
                  const iconKey = markerIconFor(m);
                  return (
                    <div
                      key={m.title}
                      className={`marker${expanded ? ' expanded' : ''}${i < 2 ? ' flip' : ''}`}
                      data-cat={m.cat}
                      style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
                    >
                      <button
                        type="button"
                        className="marker-btn"
                        aria-expanded={expanded}
                        aria-label={m.title}
                        onClick={() => setExpandedMarker((prev) => (prev === i ? null : i))}
                      >
                        <svg viewBox="0 0 24 24">
                          {markerIconPaths[iconKey].map((d) => (
                            <path key={d} d={d} />
                          ))}
                        </svg>
                      </button>
                      <div className="marker-card">
                        <span className="tag">{m.label}</span>
                        <h4>{m.title}</h4>
                        <p>{m.desc}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
          <p className="road-note">solid pins are shipped work · dashed pins are yours to fill in</p>
        </div>
      </div>
    </>
  );
}
