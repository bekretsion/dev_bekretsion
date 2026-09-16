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

/** One line of a replay. `at` is printed only where a real run was timed. */
export interface ReplayStep {
  /** A measured timestamp, e.g. '6.6 s'. Omitted when the step was never timed — see the rule in case-studies.ts. */
  at?: string;
  text: string;
  detail?: string;
}

export interface Replay {
  /** Printed on the pane. It has to say what this is, because it isn't live. */
  label: string;
  steps: ReplayStep[];
  /** Closing line under the steps: the outcome of the run, where one was measured. */
  outcome?: string;
}

export interface Project {
  id: string;
  tag: string;
  title: string;
  short: string;
  /** Shown in the mock browser chrome. */
  url: string;
  /** Real destination for "Open live site"; the button hides when absent. */
  liveUrl?: string;
  /**
   * The page to load in the panel's frame. Separate from liveUrl because a live root
   * isn't automatically a demo: hello's redirects to a sign-in page, so it has none
   * until a public demo route exists. No embedUrl means the frame is never mounted.
   */
  embedUrl?: string;
  /**
   * A still of the real thing. Stands in for the frame on phones, where embedding cost
   * the visitor the site's whole bundle to show a thumbnail, and whenever a load fails.
   */
  poster?: { src: string; width: number; height: number; alt: string };
  /** Shown where there is no hostable UI. Labelled, so it can't be mistaken for a live run. */
  replay?: Replay;
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
    url: 'hello.bekretsion.com',
    liveUrl: 'https://hello.bekretsion.com',
    // No embedUrl on purpose: the live root 307s to a sign-in page, and framing a login
    // form demonstrates nothing. Set it when a public demo route exists.
    replay: {
      label: 'How a call flows · not a live call',
      steps: [
        { text: 'Call arrives on the assistant’s number' },
        { text: 'Matched to the active assistant and its owner', detail: 'Resolved before the billable record is written' },
        { text: 'Answered by ElevenLabs or Vapi', detail: 'One interface behind both, so switching provider is one environment variable' },
        { text: 'Transcript captured, minutes billed', detail: 'Stripe, per minute, with automatic top-ups' },
        { text: 'Post-call engine dispatches the result', detail: 'extract → map → dispatch, to Slack, Outlook and CRMs' },
      ],
    },
    rows: [['Voice providers', 'ElevenLabs · Vapi'], ['Languages', '95+'], ['Billing', 'Stripe, per minute']],
  },
  {
    id: 'leads',
    tag: 'Automation',
    title: 'Lead Qualification',
    short: 'Inbound-lead pipeline on n8n: LLM scoring, atomic dedupe, and routing to HubSpot, Slack and Gmail within seconds.',
    url: 'n8n · lead-qualification',
    // Timings are the ones measured in live testing and written up in the case study.
    replay: {
      label: 'Replay · a run measured in live testing',
      steps: [
        { at: '~70 ms', text: 'Webhook acknowledges the form post', detail: 'Then validates and normalises the lead' },
        { text: 'Idempotency key checked against a UNIQUE constraint', detail: '25 simultaneous identical submissions produced exactly one contact' },
        { text: 'Gemini classifies intent, urgency, pain and fit', detail: 'Strict JSON from the model; the score itself is computed in readable code' },
        { at: '6.6 s', text: 'Routed HOT — rep notified in Slack', detail: 'HubSpot contact and deal created, Sheets digest appended' },
        { at: '8.1 s', text: 'Prospect receives a personalised Gmail reply' },
      ],
      outcome: '11/11 test leads routed correctly · 0 lost, a dead-letter queue replays failed downstreams',
    },
    rows: [['Rep notified', '6.6 s'], ['Prospect reply', '8.1 s'], ['25 duplicate submits', '1 contact']],
  },
  {
    id: 'invoices',
    tag: 'Document AI',
    title: 'Document Invoice Processing',
    short: 'OCR and LLM extraction for invoices — clean, scanned, skewed, handwritten — validated before anything posts.',
    url: 'n8n · invoice-processing',
    // The fixture set has a manifest of expected outcomes; these are four of them.
    // No timings here — that run was never timed.
    replay: {
      label: 'Replay · the 16-fixture test run',
      steps: [
        { text: 'Fixtures rendered', detail: '16 fictional invoices across 3 layouts, each with an expected outcome' },
        { text: 'OCR pass with Tesseract.js', detail: 'Benchmarked first, to prove the invoice number and total can be recovered' },
        { text: 'Fields extracted by the LLM, money re-checked in integer minor units', detail: 'Totals compared exactly, not with floating-point rounding' },
        { text: 'Clean native PDF → AUTO_POST' },
        { text: 'Broken arithmetic, unknown vendor, changed bank details → held back', detail: 'An invoice that fails validation is never posted' },
      ],
    },
    rows: [['Layouts', 'native · scanned · photo'], ['Money math', 'integer minor units'], ['Fixtures', '16, expected outcomes']],
  },
  {
    id: 'channel',
    tag: 'Media pipeline',
    title: 'Channel Builder',
    short: 'Scripts in, narrated and cut videos out: TTS, Whisper alignment, ffmpeg assembly, and a clip-finder that trims the dead air.',
    url: 'channel-builder · local',
    // Runs locally and has no case study, so there is nothing measured to quote:
    // stages only, no timings, no counts.
    replay: {
      label: 'The pipeline · stages, not a timed run',
      steps: [
        { text: 'Script in' },
        { text: 'Narration rendered with TTS' },
        { text: 'Audio aligned to the script with Whisper', detail: 'Word timings drive everything downstream' },
        { text: 'Dead air removed by the clip finder', detail: 'Subtractive: it cuts from the full take rather than assembling wanted parts' },
        { text: 'Cut and assembled with ffmpeg' },
      ],
    },
    rows: [['Narration', 'TTS + Whisper'], ['Assembly', 'ffmpeg'], ['Clips', 'subtractive finder']],
  },
];

// The four doors on the hero: each shape opens a board with only its own category's cards.
export type StoryCategory = 'work' | 'internship' | 'education' | 'hackathon';

export const storyCategoryLabel: Record<StoryCategory, string> = {
  work: 'Work',
  internship: 'Internship',
  education: 'Education',
  hackathon: 'Hackathon',
};
/** A photo or clip on a story card. The natural size keeps its frame from jumping as it loads. */
export interface StoryMedia {
  type: 'image' | 'video';
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Video only: the still shown before it plays. */
  poster?: string;
}

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
  /** Photos and clips under the body. */
  media?: StoryMedia[];
  /** Optional link under the body: another site (opens in a new tab) or a page here, like a case study. */
  link?: { href: string; label: string };
}

export const stories: Story[] = [
  {
    id: 'pyronix',
    category: 'work',
    stat: 'Pyronix AI',
    title: 'Software Engineer, full-time',
    body: 'Full-stack engineering with Node.js at a custom AI and software development company that builds for US clients. Remote since March 2025.',
    rotation: -2,
    span: 'lg',
    link: { href: 'https://www.pyronix.tech/', label: 'pyronix.tech' },
  },
  {
    id: 'lead-qualification',
    category: 'work',
    stat: '6.6 s',
    title: 'Lead Qualification Automation',
    body: 'An n8n pipeline that scores inbound leads with an LLM and routes them to HubSpot, Slack, Google Sheets and Gmail. In live testing the sales rep was notified in 6.6 seconds, and 25 identical submissions became one contact.',
    rotation: 2,
    link: { href: '/projects/lead-qualification', label: 'Read the case study' },
  },
  {
    id: 'hello-finalist',
    category: 'hackathon',
    stat: 'Finalist',
    title: 'ALX Ethiopia × Kuriftu Hospitality Hackathon, 2026',
    body: 'Hello, an AI voice receptionist for hotels, made the national final: ElevenLabs or Vapi behind one interface, Stripe minute top-ups, and a post-call engine that fires Slack, Outlook and CRM actions.',
    rotation: 3,
    span: 'lg',
    media: [
      {
        type: 'image',
        src: '/media/hackathon-final.jpg',
        width: 1280,
        height: 1024,
        alt: 'Three photos from the hackathon final: Bekretsion pitching with a microphone, the hosts at the podium, and a judge asking a question.',
      },
      {
        type: 'video',
        src: '/media/hackathon-interview.mp4',
        poster: '/media/hackathon-interview.jpg',
        width: 720,
        height: 1280,
        alt: 'Bekretsion interviewed on camera, captioned “Bekretsion Seyoum, Computer Science Student”.',
      },
    ],
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
    span: 'lg',
    media: [
      {
        type: 'image',
        src: '/media/ssgi-building.jpg',
        width: 1600,
        height: 2134,
        alt: 'Bekretsion outside the Space Science and Geospatial Institute in Addis Ababa.',
      },
      {
        type: 'image',
        src: '/media/ssgi-solar-wind.jpg',
        width: 1600,
        height: 1602,
        alt: 'Bekretsion at SSGI, in front of a display of the solar wind and Earth’s magnetic field.',
      },
    ],
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

// Deterministic tilt for the story board: a category's cards always land at the same angles.
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

/** One category's cards, in the order they're written above, each with its board tilt. */
export function storiesFor(category: StoryCategory): Story[] {
  const tiltRng = mulberry32(hashString(`${category}:tilt`));
  return stories
    .filter((s) => s.category === category)
    // Cards carrying photos sit straight: a tilted photo reads as crooked, not as pinned.
    .map((s) => ({ ...s, rotation: s.media?.length ? 0 : Math.round((tiltRng() * 10 - 5) * 10) / 10 }));
}
