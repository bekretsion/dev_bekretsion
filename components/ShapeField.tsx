'use client';

import { useEffect, useRef, useState } from 'react';
import {
  shapeDefs,
  polygonSides,
  roundedPolygonPaths,
  polygonCornerFraction,
  shapeCentroidY,
  PolygonKind,
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
// (walls + floor line) — keeps the shapes off the very edges of the field.
const BOUNDARY_INSET = 0.09;

/** Outline of a flat-bottom semicircle of radius r, arc first then the implicit closing edge. */
function semicircleVertices(r: number, segments = 14): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= segments; i++) {
    const theta = Math.PI + (i / segments) * Math.PI;
    pts.push({ x: r + r * Math.cos(theta), y: r + r * Math.sin(theta) });
  }
  return pts;
}

export default function ShapeField() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const shapeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [ready, setReady] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const overlay = useOverlay();

  function openStory(storyId: string, e: React.SyntheticEvent<HTMLElement>) {
    setHighlightId(storyId);
    overlay.openAt(originFromEvent(e));
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && overlay.open) overlay.close();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [overlay]);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rect = field.getBoundingClientRect();
    const W = Math.max(rect.width, 1);
    const H = Math.max(rect.height, 1);

    if (reduced) {
      const n = shapeDefs.length;
      const inset = W * BOUNDARY_INSET;
      const usableW = W - inset * 2;
      shapeDefs.forEach((s, i) => {
        const el = shapeRefs.current[s.id];
        if (!el) return;
        const { w, h } = sizeOf(s.kind, s.size);
        const x = inset + (usableW / (n + 1)) * (i + 1) - w / 2;
        const y = H - 32 - h;
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
      setReady(true);
      return;
    }

    let cancelled = false;
    let raf = 0;
    let stop: (() => void) | null = null;

    (async () => {
      const { Engine, World, Bodies, Body, Runner } = await import('matter-js');
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
      const floor = Bodies.rectangle((boundaryLeft + boundaryRight) / 2, H - 22, boundaryRight - boundaryLeft, 20, wallOpts);
      const left = Bodies.rectangle(boundaryLeft - 20, H / 2, 40, H * 4, wallOpts);
      const right = Bodies.rectangle(boundaryRight + 20, H / 2, 40, H * 4, wallOpts);
      World.add(world, [floor, left, right]);

      // Spread spawn x into even bands (jittered) instead of pure random,
      // so shapes don't stack right on top of each other before gravity sorts them out.
      const usableW = Math.max(1, boundaryRight - boundaryLeft - 40);
      const band = usableW / shapeDefs.length;

      const bodies = shapeDefs.map((s, i) => {
        const r = s.size / 2;
        const x = boundaryLeft + 20 + band * i + Math.random() * band;
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
        Body.setAngle(body, Math.random() * Math.PI * 2);
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.2);
        return body;
      });
      World.add(world, bodies);

      const runner = Runner.create();
      Runner.run(runner, engine);
      const sleepTimer = setTimeout(() => {
        engine.enableSleeping = true;
      }, 3000);
      stop = () => {
        clearTimeout(sleepTimer);
        Runner.stop(runner);
        World.clear(world, false);
        Engine.clear(engine);
      };

      setReady(true);

      const tick = () => {
        bodies.forEach((b, i) => {
          const def = shapeDefs[i];
          const { w, h } = sizeOf(def.kind, def.size);
          const el = shapeRefs.current[def.id];
          if (el) {
            const cy = h * shapeCentroidY[def.kind];
            el.style.transform = `translate3d(${b.position.x - w / 2}px, ${b.position.y - cy}px, 0) rotate(${b.angle}rad)`;
          }
        });
        raf = requestAnimationFrame(tick);
      };
      tick();
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stop?.();
    };
  }, []);

  return (
    <div className={`shape-field${ready ? ' ready' : ''}`} ref={fieldRef}>
      <div className="shape-floor" />
      {shapeDefs.map((s) => {
        const { w, h } = sizeOf(s.kind, s.size);
        return (
          <button
            key={s.id}
            ref={(el) => {
              shapeRefs.current[s.id] = el;
            }}
            type="button"
            className={`shape shape-${s.kind}${s.accent ? ' shape-accent' : ''}`}
            style={{ width: w, height: h }}
            aria-label="Open a story from the work"
            onClick={(e) => openStory(s.storyId, e)}
          >
            {isPolygonKind(s.kind) && (
              <svg className="shape-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d={roundedPolygonPaths[s.kind]} />
              </svg>
            )}
          </button>
        );
      })}
      <StoryModal {...overlay} highlightId={highlightId} />
    </div>
  );
}
