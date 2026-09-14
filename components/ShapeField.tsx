'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  shapeDefs,
  storyCategoryLabel,
  polygonSides,
  roundedPolygonPaths,
  polygonCornerFraction,
  shapeCentroidY,
  PolygonKind,
  StoryCategory,
} from '@/lib/portfolio-data';
import { originFromEvent } from '@/lib/dom';
import { useOverlay } from '@/lib/useOverlay';
import StoryModal from './StoryModal';

function sizeOf(kind: string, size: number): { w: number; h: number } {
  if (kind === 'halfcircle') return { w: size, h: size / 2 };
  return { w: size, h: size };
}

function isPolygonKind(kind: string): kind is PolygonKind {
  return kind in polygonSides;
}

// Fraction trimmed off each side of the field's width for the play boundary
// (walls + floor line) — just enough to keep the shapes off the panel's rounded edges.
const BOUNDARY_INSET = 0.025;

// How far outside a shape's edge (px) the cursor starts to draw it in, and how hard.
// The pull is a fraction of body mass per tick; it stays under Matter's gravity
// scale (0.001) so a shape leans and rolls toward the cursor but never lifts off
// the floor. The pull is zero once the cursor is over the shape, so it holds still to click.
const CURSOR_RANGE = 90;
const CURSOR_PULL = 0.0009;

// Scene geometry, px. The floor band under the wall is FLOOR_BAND tall, and shapes rest
// REST_OFFSET above the field's bottom edge: standing on the floor a little in front of the
// wall rather than pressed against the seam. The painted text keeps TEXT_CLEARANCE above
// the tallest resting shape — room for the "click a shape" pill and its arrow to sit in the
// gap instead of covering the links at the bottom of the text.
const FLOOR_BAND = 72;
const REST_OFFSET = 30;
const TEXT_CLEARANCE = 72;
const SHADOW_HEIGHT = 18;

// Shapes grow up to SHAPE_MAX_SCALE × their design size while the floor can still line all
// four up side by side (with ROW_SLACK to spare); on a narrower wall they shrink together
// instead of stacking up into the text. Each one also drops into its own slot (slotCenters),
// which is what lets a tight row still settle as a row.
const SHAPE_MAX_SCALE = 1.15;
const ROW_SLACK = 1.03;
const ROW_WIDTH = shapeDefs.reduce((sum, s) => sum + s.size, 0) * ROW_SLACK;
const TALLEST = Math.max(...shapeDefs.map((s) => sizeOf(s.kind, s.size).h));

function shapeScaleFor(fieldWidth: number): number {
  const floorWidth = fieldWidth * (1 - 2 * BOUNDARY_INSET);
  return Math.min(SHAPE_MAX_SCALE, Math.max(0.45, floorWidth / ROW_WIDTH));
}

/** Centre x of each shape when they share [left, right] evenly: equal gaps between and around them. */
function slotCenters(widths: number[], left: number, right: number): number[] {
  const gap = Math.max(0, (right - left - widths.reduce((a, b) => a + b, 0)) / (widths.length + 1));
  let x = left + gap;
  return widths.map((w) => {
    const center = x + w / 2;
    x += w + gap;
    return center;
  });
}

// The "click a shape" hint: which shape it points at, when it appears, and how long it stays.
// It shows once on every load, as soon as the shapes have landed, and leaves when a shape is
// clicked or its time is up. Hovering doesn't dismiss it: people pointing at the shapes are
// exactly who it's for, and a hover used to cancel it before it ever appeared.
const HINT_SHAPE_INDEX = 0;
const HINT_DELAY_MS = 2400;
const HINT_VISIBLE_MS = 10000;

// A hover can fire because a moving shape passed under a *resting* cursor: the browser
// synthesises the enter event but no pointermove follows. And for a real move the enter
// fires *before* its pointermove. So wait this long after an enter, then count it only
// if the pointer has moved since.
const HOVER_INTENT_MS = 60;

// Below this the scene is swapped for a plain panel and the chip row (globals.css). Tracked
// live so a window that starts narrow and is widened still gets its physics world.
const WIDE_QUERY = '(min-width: 901px)';

function subscribeWide(onChange: () => void) {
  const mq = window.matchMedia(WIDE_QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

/** Outline of a flat-bottom semicircle of radius r, arc first then the implicit closing edge. */
function semicircleVertices(r: number, segments = 14): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= segments; i++) {
    const theta = Math.PI + (i / segments) * Math.PI;
    pts.push({ x: r + r * Math.cos(theta), y: r + r * Math.sin(theta) });
  }
  return pts;
}

/** The hero scene: `children` is painted on the wall, the shapes stand on the floor in front. */
export default function ShapeField({ children }: { children: React.ReactNode }) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const shapeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const labelRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const shadowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const hintRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [highlightCategory, setHighlightCategory] = useState<StoryCategory | null>(null);
  const [hintVisible, setHintVisible] = useState(false);
  // The field's inner size. Its height follows the painted text, so any reflow moves the
  // floor — the physics world is rebuilt whenever this changes.
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const wide = useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE_QUERY).matches,
    () => false
  );
  const scale = size ? shapeScaleFor(size.w) : 1;

  // A click on any shape means the visitor has found them: skip the nudge and the hint, or take
  // the hint down if it's already up. hintShownRef keeps the hint to once per page load, even
  // when a resize rebuilds the scene.
  const clickedRef = useRef(false);
  const hintShownRef = useRef(false);

  const overlay = useOverlay();
  const overlayShownRef = useRef(false);
  overlayShownRef.current = overlay.shown;

  function openStory(category: StoryCategory, e: React.SyntheticEvent<HTMLElement>) {
    clickedRef.current = true;
    setHintVisible(false);
    setHighlightCategory(category);
    overlay.openAt(originFromEvent(e));
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && overlay.open) overlay.close();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [overlay]);

  // Its own effect, so a resize rebuilding the scene can't cancel the hint's exit.
  useEffect(() => {
    if (!hintVisible) return;
    const timer = setTimeout(() => setHintVisible(false), HINT_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [hintVisible]);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const w = field.clientWidth;
        const h = field.clientHeight;
        setSize((prev) => (prev && prev.w === w && prev.h === h ? prev : { w, h }));
      }, 150);
    });
    observer.observe(field);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field || !wide || !size) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const W = size.w;
    const H = size.h;
    const restY = H - REST_OFFSET;
    const defs = shapeDefs.map((s) => ({ ...s, size: s.size * scale }));

    const hintEl = hintRef.current;

    // Centre the hint above a shape's current top edge.
    function placeHint(cx: number, top: number) {
      if (!hintEl) return;
      const x = cx - hintEl.offsetWidth / 2;
      const y = Math.max(4, top - hintEl.offsetHeight - 10);
      hintEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }

    // Contact shadow on the floor under a shape: full and dark while it rests, smaller and
    // fainter the higher it hops.
    function placeShadow(id: string, cx: number, width: number, lift: number) {
      const el = shadowRefs.current[id];
      if (!el) return;
      const k = Math.max(0.25, 1 - lift / 260);
      el.style.transform = `translate3d(${cx - width / 2}px, ${restY - SHADOW_HEIGHT / 2 + 3}px, 0) scale(${k})`;
      el.style.opacity = String(k);
    }

    function showHint() {
      if (clickedRef.current || hintShownRef.current) return;
      hintShownRef.current = true;
      setHintVisible(true);
    }

    if (reduced) {
      const inset = W * BOUNDARY_INSET;
      const centers = slotCenters(
        defs.map((s) => s.size),
        inset,
        W - inset
      );
      defs.forEach((s, i) => {
        const el = shapeRefs.current[s.id];
        if (!el) return;
        const { w, h } = sizeOf(s.kind, s.size);
        const x = centers[i] - w / 2;
        const y = restY - h;
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        placeShadow(s.id, x + w / 2, s.size, 0);
        if (i === HINT_SHAPE_INDEX) placeHint(x + w / 2, y);
      });
      setReady(true);
      const hintTimer = setTimeout(showHint, HINT_DELAY_MS);
      return () => clearTimeout(hintTimer);
    }

    let cancelled = false;
    let raf = 0;
    let stop: (() => void) | null = null;

    // Cursor position in field coordinates, or null when it's outside (or a modal is up).
    let mouse: { x: number; y: number } | null = null;
    let lastMoveAt = 0;
    const onPointerMove = (e: PointerEvent) => {
      if (overlayShownRef.current) {
        mouse = null;
        return;
      }
      lastMoveAt = performance.now();
      const r = field.getBoundingClientRect();
      mouse = { x: e.clientX - r.left - field.clientLeft, y: e.clientY - r.top - field.clientTop };
    };
    const onPointerLeave = () => {
      mouse = null;
    };
    field.addEventListener('pointermove', onPointerMove);
    field.addEventListener('pointerleave', onPointerLeave);

    (async () => {
      const { Engine, World, Bodies, Body, Runner, Sleeping } = await import('matter-js');
      if (cancelled || !fieldRef.current) return;

      const engine = Engine.create();
      engine.gravity.y = 1;
      // Sleeping starts disabled: if it's on while bodies are still falling/colliding,
      // a body can freeze mid-overlap the instant its velocity dips low for a frame —
      // random per load, so it doesn't reproduce every time. Give the solver a full
      // settle window with sleeping off, then enable it once nothing should still be moving.
      engine.enableSleeping = false;
      engine.positionIterations = 12;
      engine.velocityIterations = 8;
      const world = engine.world;

      const inset = W * BOUNDARY_INSET;
      const boundaryLeft = inset;
      const boundaryRight = W - inset;

      const wallOpts = { isStatic: true, restitution: 0.3, friction: 0.6 };
      // The side boundaries are invisible, so they're frictionless: a shape that lands against
      // one slides down and settles on the floor instead of staying propped up at an angle.
      const sideOpts = { ...wallOpts, friction: 0 };
      // Top surface sits exactly at restY.
      const floor = Bodies.rectangle((boundaryLeft + boundaryRight) / 2, restY + 10, boundaryRight - boundaryLeft, 20, wallOpts);
      const left = Bodies.rectangle(boundaryLeft - 20, H / 2, 40, H * 4, sideOpts);
      const right = Bodies.rectangle(boundaryRight + 20, H / 2, 40, H * 4, sideOpts);
      World.add(world, [floor, left, right]);

      // Each shape drops into its own slot along the floor, jittered only within the spare gap,
      // so they land side by side in order instead of piling onto each other.
      const widths = defs.map((s) => s.size);
      const centers = slotCenters(widths, boundaryLeft, boundaryRight);
      const spare = boundaryRight - boundaryLeft - widths.reduce((a, b) => a + b, 0);
      const jitter = (Math.max(0, spare) / (defs.length + 1)) * 0.8;

      const bodies = defs.map((s, i) => {
        const r = s.size / 2;
        const x = centers[i] + (Math.random() - 0.5) * jitter;
        const y = -120 - i * 90 - Math.random() * 100;
        const matOpts = { restitution: 0.4, friction: 0.5, frictionAir: 0.012 };
        let body;
        switch (s.kind) {
          case 'circle':
            body = Bodies.circle(x, y, r, matOpts);
            break;
          case 'square':
            body = Bodies.rectangle(x, y, s.size, s.size, { ...matOpts, chamfer: { radius: 6 } });
            break;
          case 'halfcircle':
            body = Bodies.fromVertices(x, y, [semicircleVertices(r)], {
              ...matOpts,
              chamfer: { radius: r * 0.12 },
            });
            break;
          default: {
            const kind = s.kind as PolygonKind;
            body = Bodies.polygon(x, y, polygonSides[kind], r, {
              ...matOpts,
              chamfer: { radius: r * polygonCornerFraction[kind] },
            });
          }
        }
        // A little tilt and spin for life, but not so much that a shape's rotated footprint
        // spills over its slot and lands propped on a neighbour.
        Body.setAngle(body, (Math.random() - 0.5) * 0.8);
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.05);
        return body;
      });
      World.add(world, bodies);

      // Wake a body and give it a small upward kick plus a little spin — the
      // "I noticed you" reaction on hover, and the one-time nudge after settling.
      function kick(b: (typeof bodies)[number], lift: number, spin: number) {
        Sleeping.set(b, false);
        Body.setVelocity(b, { x: b.velocity.x, y: Math.min(b.velocity.y, 0) - lift });
        Body.setAngularVelocity(b, b.angularVelocity + spin);
      }

      // Hover hop, rate-limited per shape so a shape bouncing under a still cursor
      // can't re-trigger itself every frame.
      let disposed = false;
      const lastHop: Record<string, number> = {};
      const hoverCleanups = bodies.map((b, i) => {
        const id = defs[i].id;
        const el = shapeRefs.current[id];
        if (!el) return () => {};
        const onEnter = () => {
          const enteredAt = performance.now();
          setTimeout(() => {
            if (disposed || lastMoveAt < enteredAt - 1) return;
            const now = performance.now();
            if (now - (lastHop[id] ?? 0) < 600) return;
            lastHop[id] = now;
            kick(b, 2.2, (Math.random() - 0.5) * 0.06);
          }, HOVER_INTENT_MS);
        };
        el.addEventListener('pointerenter', onEnter);
        return () => el.removeEventListener('pointerenter', onEnter);
      });

      const runner = Runner.create();
      Runner.run(runner, engine);
      const sleepTimer = setTimeout(() => {
        engine.enableSleeping = true;
      }, 3000);
      // One nudge on the hinted shape as the hint appears — first build only, and not once a
      // shape has been clicked.
      const nudgeTimer = setTimeout(() => {
        if (!clickedRef.current && !hintShownRef.current) kick(bodies[HINT_SHAPE_INDEX], 3, 0.08);
        showHint();
      }, HINT_DELAY_MS);
      stop = () => {
        disposed = true;
        clearTimeout(sleepTimer);
        clearTimeout(nudgeTimer);
        hoverCleanups.forEach((fn) => fn());
        Runner.stop(runner);
        World.clear(world, false);
        Engine.clear(engine);
      };

      setReady(true);

      const tick = () => {
        bodies.forEach((b, i) => {
          const def = defs[i];
          const { w, h } = sizeOf(def.kind, def.size);

          if (mouse) {
            const dx = mouse.x - b.position.x;
            const dy = mouse.y - b.position.y;
            const d = Math.hypot(dx, dy);
            const edge = def.size / 2;
            if (d > edge && d < edge + CURSOR_RANGE) {
              const t = 1 - (d - edge) / CURSOR_RANGE;
              const f = b.mass * CURSOR_PULL * t;
              Sleeping.set(b, false);
              // Mostly sideways: the shape leans/rolls toward the cursor rather than climbing.
              Body.applyForce(b, b.position, { x: (dx / d) * f, y: (dy / d) * f * 0.35 });
            }
          }

          const el = shapeRefs.current[def.id];
          if (el) {
            const cy = h * shapeCentroidY[def.kind];
            el.style.transform = `translate3d(${b.position.x - w / 2}px, ${b.position.y - cy}px, 0) rotate(${b.angle}rad)`;
          }
          // Counter-rotate the label so it reads upright however the body has landed.
          const label = labelRefs.current[def.id];
          if (label) label.style.transform = `translate(-50%, -50%) rotate(${-b.angle}rad)`;
          placeShadow(def.id, b.position.x, def.size, Math.max(0, restY - b.bounds.max.y));
        });
        const hb = bodies[HINT_SHAPE_INDEX];
        placeHint(hb.position.x, hb.bounds.min.y);
        raf = requestAnimationFrame(tick);
      };
      tick();
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      field.removeEventListener('pointermove', onPointerMove);
      field.removeEventListener('pointerleave', onPointerLeave);
      stop?.();
    };
  }, [wide, size, scale]);

  return (
    <>
      <div
        className={`shape-field${ready ? ' ready' : ''}`}
        ref={fieldRef}
        style={
          {
            '--floor': `${FLOOR_BAND}px`,
            '--reserve': `${Math.round(REST_OFFSET + TALLEST * scale + TEXT_CLEARANCE)}px`,
            '--s': scale,
          } as React.CSSProperties
        }
      >
        <div className="wall-surface" aria-hidden="true" />
        <div className="wall-text">{children}</div>
        <div className="wall-grain" aria-hidden="true" />
        <div className="floor" aria-hidden="true" />
        {shapeDefs.map((s) => (
          <div
            key={`shadow-${s.id}`}
            className="shape-shadow"
            aria-hidden="true"
            style={{ width: s.size * scale }}
            ref={(el) => {
              shadowRefs.current[s.id] = el;
            }}
          />
        ))}
        {shapeDefs.map((s) => {
          const { w, h } = sizeOf(s.kind, s.size * scale);
          return (
            <button
              key={s.id}
              ref={(el) => {
                shapeRefs.current[s.id] = el;
              }}
              type="button"
              className={`shape shape-${s.kind}${s.accent ? ' shape-accent' : ''}`}
              style={{ width: w, height: h }}
              aria-label={`Open ${storyCategoryLabel[s.category].toLowerCase()} stories`}
              onClick={(e) => openStory(s.category, e)}
            >
              {isPolygonKind(s.kind) && (
                <svg className="shape-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d={roundedPolygonPaths[s.kind]} />
                </svg>
              )}
              <span
                className="shape-label"
                aria-hidden="true"
                ref={(el) => {
                  labelRefs.current[s.id] = el;
                }}
              >
                {s.label}
              </span>
            </button>
          );
        })}
        <div className={`shape-hint${hintVisible ? ' on' : ''}`} ref={hintRef} aria-hidden="true">
          <span className="shape-hint-text">click a shape</span>
          <span className="shape-hint-arrow">↓</span>
        </div>
        {/* Mobile stand-in for the shapes: same four doors, same modal. */}
        <div className="shape-chips" role="group" aria-label="Background">
          {shapeDefs.map((s) => (
            <button
              key={`chip-${s.id}`}
              type="button"
              className={`chip${s.accent ? ' chip-accent' : ''}`}
              onClick={(e) => openStory(s.category, e)}
            >
              {storyCategoryLabel[s.category]}
            </button>
          ))}
        </div>
      </div>
      {/* Outside the field: the field isolates its own stacking context for the scene layers. */}
      <StoryModal {...overlay} highlightCategory={highlightCategory} />
    </>
  );
}
