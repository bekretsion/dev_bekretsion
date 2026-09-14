export const profile = {
  name: 'Bekretsion Seyoum',
  initials: 'BS',
  /** A square photo in /public; set to null to fall back to the initials. */
  photo: '/me.jpg' as string | null,
};

/** The hero intro: a YouTube upload, played inside the page. */
export const intro = {
  youtubeId: 'KLX1O9-Qvfk',
  title: 'I Build AI Systems That Automate Real Business Workflows',
  /** The upload's frame shape — YouTube reports this one as 16:9. */
  aspect: '16 / 9',
};

export interface Project {
  id: string;
  tag: string;
  title: string;
  short: string;
  /** Shown in the mock browser chrome. */
  url: string;
  /** Real destination for "Open live site"; the button hides when absent. */
  liveUrl?: string;
  toggleLabel: string;
  actionLabel: string;
  doneLabel: string;
  rows: [string, string][];
}

// First entry is the featured (double-width) card.
export const projects: Project[] = [
  {
    id: 'hello',
    tag: 'Voice AI',
    title: 'Hello AI',
    short:
      'AI voice receptionist platform: assistants, phone numbers, calls captured and billed by the minute. National finalist, ALX × Kuriftu 2026.',
    url: 'hello-frontend-three.vercel.app',
    liveUrl: 'https://hello-frontend-three.vercel.app',
    toggleLabel: 'Auto top-up minutes',
    actionLabel: 'Place test call',
    doneLabel: 'Ringing ✓',
    rows: [['Voice providers', 'ElevenLabs · Vapi'], ['Languages', '95+'], ['Billing', 'Stripe, per minute']],
  },
  {
    id: 'collab',
    tag: 'Real-time',
    title: 'Collab API',
    short: 'Self-hostable WebSocket backend for collaborative editing: Yjs CRDTs, tenant isolation at the database, Redis scale-out.',
    url: 'collab-api-jayn.onrender.com',
    liveUrl: 'https://collab-api-jayn.onrender.com',
    toggleLabel: 'Redis multi-server sync',
    actionLabel: 'Open a document',
    doneLabel: 'Synced ✓',
    rows: [['Conflicts', 'none — CRDT merge'], ['Tenancy', 'schema per tenant + RLS'], ['Auth', 'JWT, per socket']],
  },
  {
    id: 'leads',
    tag: 'Automation',
    title: 'Lead Qualification',
    short: 'Inbound-lead pipeline on n8n: LLM scoring, atomic dedupe, and routing to HubSpot, Slack and Gmail within seconds.',
    url: 'n8n · lead-qualification',
    toggleLabel: 'LLM scoring',
    actionLabel: 'Submit test lead',
    doneLabel: 'Routed HOT ✓',
    rows: [['Rep notified', '6.6 s'], ['Prospect reply', '8.1 s'], ['25 duplicate submits', '1 contact']],
  },
  {
    id: 'invoices',
    tag: 'Document AI',
    title: 'Document Invoice Processing',
    short: 'OCR and LLM extraction for invoices — clean, scanned, skewed, handwritten — validated before anything posts.',
    url: 'n8n · invoice-processing',
    toggleLabel: 'Auto-post when valid',
    actionLabel: 'Run 16 fixtures',
    doneLabel: 'Processed ✓',
    rows: [['Layouts', 'native · scanned · photo'], ['Money math', 'integer minor units'], ['Fixtures', '16, expected outcomes']],
  },
  {
    id: 'channel',
    tag: 'Media pipeline',
    title: 'Channel Builder',
    short: 'Scripts in, narrated and cut videos out: TTS, Whisper alignment, ffmpeg assembly, and a clip-finder that trims the dead air.',
    url: 'channel-builder · local',
    toggleLabel: 'Auto-cut silences',
    actionLabel: 'Render episode',
    doneLabel: 'Rendered ✓',
    rows: [['Narration', 'TTS + Whisper'], ['Assembly', 'ffmpeg'], ['Clips', 'subtractive finder']],
  },
];

// The four doors on the hero: each shape opens the story board with one category lit up.
export type StoryCategory = 'work' | 'internship' | 'education' | 'hackathon';

export const storyCategoryLabel: Record<StoryCategory, string> = {
  work: 'Work',
  internship: 'Internship',
  education: 'Education',
  hackathon: 'Hackathon',
};

export interface Story {
  id: string;
  category: StoryCategory;
  stat?: string;
  title: string;
  body: string;
  rotation: number;
  span?: 'lg';
  /** Doesn't straighten or lift on hover — stays pinned at its tilt. */
  pinned?: boolean;
  /** Optional outbound link under the body, e.g. the institution's site. */
  link?: { href: string; label: string };
}

export const stories: Story[] = [
  {
    id: 'innoscribe',
    category: 'work',
    stat: '6+',
    title: 'Features shipped at Innoscribe',
    body: 'Backend engineer on an AI phone-call platform built on ElevenLabs. Shipped the calendar booking core, the Planday and Fiken connectors, voice cloning, assistant scheduling and the product-tour engine.',
    rotation: -2,
    span: 'lg',
  },
  {
    id: 'booking-zero',
    category: 'work',
    stat: '0',
    title: 'Double-bookings',
    body: 'A buffer guard and a shared conflict check sit in front of every booking path, so two requests for the same slot can never both win.',
    rotation: 2,
  },
  {
    id: 'integrations-pattern',
    category: 'work',
    stat: '6',
    title: 'Platforms, one connector shape',
    body: 'Planday, Fiken, Stripe, Vipps — different APIs, same connector pattern underneath, so the sixth integration took a fraction of the first.',
    rotation: -1,
  },
  {
    id: 'voiceclone-minutes',
    category: 'work',
    stat: '2 tiers',
    title: 'Cloned voice, shipped',
    body: 'Two-tier voice cloning went from idea to a metered, resellable feature — credits tracked per minute, catalog leak-filtered per account.',
    rotation: -3,
  },
  {
    id: 'hello-finalist',
    category: 'hackathon',
    stat: 'Finalist',
    title: 'ALX Ethiopia × Kuriftu Hospitality Hackathon, 2026',
    body: 'Hello, an AI voice receptionist for hotels, made the national final: ElevenLabs or Vapi behind one interface, Stripe minute top-ups, and a post-call engine that fires Slack, Outlook and CRM actions.',
    rotation: 3,
    span: 'lg',
  },
  {
    id: 'languages',
    category: 'hackathon',
    stat: '95+',
    title: 'Languages, Amharic included',
    body: 'Hello answers in 95+ languages through ElevenLabs multilingual models — including Amharic, Afaan Oromo and Tigrinya, which most voice products still skip.',
    rotation: -4,
  },
  {
    id: 'ssgi-dst-forecast',
    category: 'internship',
    stat: 'SSGI',
    title: 'Forecasting geomagnetic storms',
    body: 'Internship at Ethiopia’s Space Science and Geospatial Institute: a CNN-LSTM that predicts the Dst index from solar-wind data. The second version beat the persistence baseline at every horizon — after finding that the first only looked like it never learned because of an early-stopping bug.',
    rotation: 4,
    link: { href: 'https://ssgi.gov.et/', label: 'ssgi.gov.et' },
  },
  {
    id: 'heuc',
    category: 'education',
    stat: 'HEUC',
    title: 'BSc Computer Science, Hope Enterprise University College',
    body: 'In progress in Addis Ababa, Ethiopia, alongside the work. Open to remote roles.',
    rotation: -2,
    link: { href: 'https://www.heuc.edu.et/', label: 'heuc.edu.et' },
  },
];

export type ShapeKind = 'circle' | 'square' | 'octagon' | 'halfcircle';

export interface ShapeDef {
  id: string;
  kind: ShapeKind;
  size: number;
  accent?: boolean;
  category: StoryCategory;
  /** Short mono tag printed on the shape — the static "this is content" signifier. */
  label: string;
}

// Ordered by hiring signal, strongest first: shipped work, a competitive final (team work
// under a deadline), the internship, then the degree in progress. Gold goes on the top two.
// Array order is also left-to-right spawn order, so the numbers read in sequence.
export const shapeDefs: ShapeDef[] = [
  { id: 's1', kind: 'octagon', size: 196, accent: true, category: 'work', label: '01 · work' },
  { id: 's2', kind: 'halfcircle', size: 229, accent: true, category: 'hackathon', label: '02 · hackathon' },
  { id: 's3', kind: 'circle', size: 172, category: 'internship', label: '03 · internship' },
  { id: 's4', kind: 'square', size: 168, category: 'education', label: '04 · education' },
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

export function arrangeStories(category: StoryCategory): Story[] {
  const orderRng = mulberry32(hashString(category));
  const tiltRng = mulberry32(hashString(`${category}:tilt`));

  const shuffled = [...stories];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(orderRng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const tilted = shuffled.map((s) => ({ ...s, rotation: Math.round((tiltRng() * 10 - 5) * 10) / 10 }));
  // The opened category leads the board, so what you land on is what you clicked.
  return [...tilted.filter((s) => s.category === category), ...tilted.filter((s) => s.category !== category)];
}
