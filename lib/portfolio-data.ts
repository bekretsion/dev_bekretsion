export interface Project {
  id: string;
  tag: string;
  title: string;
  short: string;
  url: string;
  toggleLabel: string;
  actionLabel: string;
  doneLabel: string;
  rows: [string, string][];
}

export const projects: Project[] = [
  {
    id: 'planday',
    tag: 'Integration',
    title: 'Planday connector',
    short: 'Automation actions synced against Planday’s live scheduling API.',
    url: 'app.innoscribe.ai/planday',
    toggleLabel: 'Auto-sync shifts',
    actionLabel: 'Run sync now',
    doneLabel: 'Synced ✓',
    rows: [['Last sync', '2 min ago'], ['Shifts updated', '14'], ['Conflicts', '0']],
  },
  {
    id: 'fiken',
    tag: 'Integration',
    title: 'Fiken accounting sync',
    short: 'Panel and sweep that reconcile bookings against Fiken invoices.',
    url: 'app.innoscribe.ai/fiken',
    toggleLabel: 'Nightly sweep',
    actionLabel: 'Reconcile now',
    doneLabel: 'Reconciled ✓',
    rows: [['Invoices matched', '128'], ['Open mismatches', '2'], ['Last sweep', '03:00']],
  },
  {
    id: 'voiceclone',
    tag: 'Product',
    title: 'AI Voice Clone',
    short: 'Two-tier resellable voice cloning, metered by the credit.',
    url: 'app.innoscribe.ai/voices',
    toggleLabel: 'Studio tier',
    actionLabel: 'Clone voice',
    doneLabel: 'Queued ✓',
    rows: [['Voices', '6'], ['Credits left', '420 min'], ['Catalog filter', 'on']],
  },
  {
    id: 'tour',
    tag: 'Platform',
    title: 'Product Tour engine',
    short: 'Scope-based spotlight tours generated per tab, per wizard.',
    url: 'app.innoscribe.ai/tours',
    toggleLabel: 'Show on first visit',
    actionLabel: 'Preview tour',
    doneLabel: 'Playing ✓',
    rows: [['Scopes', '9'], ['Completion rate', '71%'], ['Steps', '5']],
  },
  {
    id: 'booking',
    tag: 'Platform',
    title: 'Calendar Booking core',
    short: 'Buffer-guarded, idempotent booking shared across every call path.',
    url: 'app.innoscribe.ai/booking',
    toggleLabel: 'Buffer guard',
    actionLabel: 'Test booking',
    doneLabel: 'Booked ✓',
    rows: [['Slot', 'Thu 14:00'], ['Conflict check', 'passed'], ['Idempotency', 'ok']],
  },
  {
    id: 'stripevipps',
    tag: 'Payments',
    title: 'Stripe × Vipps checkout',
    short: 'Preview-gated Vipps enablement on top of connected Stripe accounts.',
    url: 'app.innoscribe.ai/checkout',
    toggleLabel: 'Vipps enabled',
    actionLabel: 'Test charge',
    doneLabel: 'Charged ✓',
    rows: [['Provider', 'Stripe'], ['Method', 'Vipps'], ['Mode', 'sandbox']],
  },
];

export type MilestoneCategory = 'placeholder' | 'project' | 'job';

export interface Milestone {
  t: number;
  cat: MilestoneCategory;
  label: string;
  title: string;
  desc: string;
}

export const milestones: Milestone[] = [
  { t: 0.05, cat: 'placeholder', label: 'Education', title: '[ Your degree or bootcamp start ]', desc: 'Swap this pin for the real date.' },
  { t: 0.20, cat: 'placeholder', label: 'Skill', title: '[ First language you shipped in ]', desc: 'Swap this pin for the real one.' },
  { t: 0.34, cat: 'placeholder', label: 'Job', title: '[ First internship or role ]', desc: 'Swap this pin for the real one.' },
  { t: 0.47, cat: 'project', label: 'Project', title: 'Shipped Calendar Booking core', desc: 'The shared booking path every call now routes through.' },
  { t: 0.58, cat: 'placeholder', label: 'Skill', title: '[ Picked up voice-AI tooling ]', desc: 'Swap this pin for the real date.' },
  { t: 0.71, cat: 'project', label: 'Project', title: 'Shipped Planday connector', desc: 'First live automation connector, deployed end to end.' },
  { t: 0.84, cat: 'project', label: 'Project', title: 'Shipped AI Voice Clone', desc: 'Resellable two-tier cloning, metered by credit.' },
  { t: 0.96, cat: 'project', label: 'Project · latest', title: 'Shipped Product Tour engine', desc: 'Scope-based tours, rebuilt end to end.' },
];

export const markerIconPaths: Record<'project' | 'job' | 'placeholder', string[]> = {
  project: ['M5 3v18M5 4h13l-3 4 3 4H5'],
  job: ['M4 8h16v11H4z', 'M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2'],
  placeholder: ['M12 5v14M5 12h14'],
};

export function markerIconFor(m: Milestone): 'project' | 'job' | 'placeholder' {
  if (m.cat === 'placeholder') return 'placeholder';
  return m.label.toLowerCase().includes('job') ? 'job' : 'project';
}

export interface Story {
  id: string;
  tag: string;
  stat?: string;
  title: string;
  body: string;
  rotation: number;
  span?: 'lg';
  /** Doesn't straighten or lift on hover — stays pinned at its tilt. */
  pinned?: boolean;
}

export const stories: Story[] = [
  {
    id: 'voiceclone-minutes',
    tag: 'Achievement',
    stat: '420 min',
    title: 'Cloned voice, shipped',
    body: 'Two-tier voice cloning went from idea to a metered, resellable feature — credits tracked per minute, catalog leak-filtered per account.',
    rotation: -3,
  },
  {
    id: 'booking-zero',
    tag: 'Achievement',
    stat: '0',
    title: 'Double-bookings',
    body: 'A buffer guard and a shared conflict check sit in front of every booking path, so two requests for the same slot can never both win.',
    rotation: 2,
  },
  {
    id: 'integrations-pattern',
    tag: 'Pattern',
    stat: '6',
    title: 'Platforms, one connector shape',
    body: 'Planday, Fiken, Stripe, Vipps — different APIs, same connector pattern underneath, so the sixth integration took a fraction of the first.',
    rotation: -1,
    span: 'lg',
  },
  {
    id: 'first-bug',
    tag: 'Story',
    title: '[ The first bug that actually taught you something ]',
    body: 'Placeholder — swap in the real one.',
    rotation: 4,
    pinned: true,
  },
  {
    id: 'tour-completion',
    tag: 'Achievement',
    stat: '71%',
    title: 'Tour completion rate',
    body: 'Spotlight tours scoped per tab and per wizard step, so the walkthrough only ever shows what’s actually relevant to where you are.',
    rotation: -2,
  },
  {
    id: 'why-build',
    tag: 'Story',
    title: '[ Why you build instead of just using the software ]',
    body: 'Placeholder — swap in the real one.',
    rotation: 3,
    pinned: true,
  },
  {
    id: 'fiken-reconciled',
    tag: 'Achievement',
    stat: '128',
    title: 'Invoices reconciled automatically',
    body: 'A nightly sweep matches bookings against Fiken invoices and only ever surfaces the two or three that actually need a human.',
    rotation: -4,
  },
];

export type ShapeKind = 'circle' | 'square' | 'octagon' | 'halfcircle';

export interface ShapeDef {
  id: string;
  kind: ShapeKind;
  size: number;
  accent?: boolean;
  storyId: string;
}

export const shapeDefs: ShapeDef[] = [
  { id: 's1', kind: 'octagon', size: 196, accent: true, storyId: 'voiceclone-minutes' },
  { id: 's2', kind: 'circle', size: 172, storyId: 'booking-zero' },
  { id: 's3', kind: 'square', size: 168, storyId: 'fiken-reconciled' },
  { id: 's4', kind: 'halfcircle', size: 229, accent: true, storyId: 'integrations-pattern' },
];

export type PolygonKind = 'octagon';

export const polygonSides: Record<PolygonKind, number> = {
  octagon: 8,
};

// Fraction of the polygon's circumradius used to round each corner —
// shared between the SVG render path and the Matter.js physics chamfer
// so the visible edge and the collision hull line up.
export const polygonCornerFraction: Record<PolygonKind, number> = {
  octagon: 0.2,
};

// Fraction of each shape's bounding-box height, measured from the top,
// where its true physics centroid sits. 0.5 for anything symmetric
// top-to-bottom; a half-circle's mass sits closer to its flat edge, so
// its rotation pivot and render offset both need the real value or it
// visibly wobbles off-position as it tumbles.
export const shapeCentroidY: Record<ShapeKind, number> = {
  circle: 0.5,
  square: 0.5,
  octagon: 0.5,
  halfcircle: 1 - 4 / (3 * Math.PI),
};

function normalize(v: [number, number]): [number, number] {
  const len = Math.hypot(v[0], v[1]) || 1;
  return [v[0] / len, v[1] / len];
}

function roundedPolygonPath(sides: number, cornerRadius: number): string {
  const cx = 50;
  const cy = 50;
  const R = 45;
  const pts: [number, number][] = [];
  for (let i = 0; i < sides; i++) {
    const angle = ((-90 + (i * 360) / sides) * Math.PI) / 180;
    pts.push([cx + R * Math.cos(angle), cy + R * Math.sin(angle)]);
  }
  let d = '';
  for (let i = 0; i < sides; i++) {
    const curr = pts[i];
    const prev = pts[(i - 1 + sides) % sides];
    const next = pts[(i + 1) % sides];
    const toPrev = normalize([prev[0] - curr[0], prev[1] - curr[1]]);
    const toNext = normalize([next[0] - curr[0], next[1] - curr[1]]);
    const p1: [number, number] = [curr[0] + toPrev[0] * cornerRadius, curr[1] + toPrev[1] * cornerRadius];
    const p2: [number, number] = [curr[0] + toNext[0] * cornerRadius, curr[1] + toNext[1] * cornerRadius];
    d += i === 0 ? `M ${p1[0].toFixed(2)} ${p1[1].toFixed(2)} ` : `L ${p1[0].toFixed(2)} ${p1[1].toFixed(2)} `;
    d += `Q ${curr[0].toFixed(2)} ${curr[1].toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)} `;
  }
  return d + 'Z';
}

export const roundedPolygonPaths: Record<PolygonKind, string> = {
  octagon: roundedPolygonPath(8, 45 * polygonCornerFraction.octagon),
};

// Deterministic per-shape "scatter" for the story board: same shape always
// produces the same shuffle + tilt, but each shape's arrangement is its own.
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}

function mulberry32(seed: number) {
  let a = seed;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function arrangeStories(seedKey: string): Story[] {
  const orderRng = mulberry32(hashString(seedKey));
  const tiltRng = mulberry32(hashString(`${seedKey}:tilt`));

  const shuffled = [...stories];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(orderRng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.map((s) => ({ ...s, rotation: Math.round((tiltRng() * 10 - 5) * 10) / 10 }));
}
