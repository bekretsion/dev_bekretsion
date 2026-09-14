// One page per project at /projects/<slug>. Every claim here comes from the project's own
// code, docs or the resume; don't add numbers that weren't measured.

export interface CaseStudy {
  slug: string;
  /** The matching card in `projects`, so the homepage panel can link here. */
  projectId: string;
  tag: string;
  title: string;
  metaTitle: string;
  description: string;
  /** Opens the page: what it is and the strongest proof, in the first few sentences. */
  summary: string;
  facts: { value: string; label: string }[];
  highlights: string[];
  stack: string[];
  links: { label: string; href: string }[];
  published: string;
  updated: string;
}

export const caseStudies: CaseStudy[] = [
  {
    slug: 'hello-ai',
    projectId: 'hello',
    tag: 'Voice AI',
    title: 'Hello AI',
    metaTitle: 'Hello AI — AI Voice Receptionist Platform | Bekretsion Seyoum',
    description:
      'How Bekretsion Seyoum built Hello, an AI voice receptionist platform in 95+ languages including Amharic. National finalist, ALX Ethiopia × Kuriftu Hackathon 2026.',
    summary:
      'Hello is an AI voice receptionist platform. A business gets an AI assistant and a phone number; the assistant answers calls in 95+ languages, including Amharic, Afaan Oromo and Tigrinya, and every call is captured with its transcript and billed by the minute. It reached the national final of the ALX Ethiopia × Kuriftu Hospitality Hackathon 2026.',
    facts: [
      { value: 'Finalist', label: 'ALX Ethiopia × Kuriftu Hospitality Hackathon 2026' },
      { value: '95+', label: 'languages, Amharic included' },
      { value: '2', label: 'voice providers behind one interface' },
      { value: '85+', label: 'database migrations, run on startup' },
    ],
    highlights: [
      'ElevenLabs and Vapi sit behind one shared interface, so switching voice provider is a single environment variable with no code changes.',
      'Incoming calls are matched to the right active assistant and its owner before the billable call record is written, whichever provider the webhook came from.',
      'Stripe webhooks keep the raw request body for signature verification, and handle automatic minute top-ups with retries.',
      'A post-call engine (extract → map → dispatch) sends results to Slack, Outlook and CRMs without touching the call pipeline.',
      'Around the calls: appointment scheduling synced to Google and Outlook calendars, document templates with e-signature, and invoicing.',
      'Idempotent scheduled jobs handle call dispatch, billing renewal and assistant activation.',
    ],
    stack: ['Node.js', 'Express', 'MySQL', 'ElevenLabs', 'Vapi', 'Stripe', 'Google Calendar', 'Microsoft Graph', 'Dropbox Sign', 'OAuth 2.0', 'Next.js'],
    links: [{ label: 'Live app', href: 'https://hello.bekretsion.com' }],
    published: '2026-09-14',
    updated: '2026-09-14',
  },
  {
    slug: 'collab-api',
    projectId: 'collab',
    tag: 'Real-time',
    title: 'Collab API',
    metaTitle: 'Collab API — Real-Time Collaboration Backend | Bekretsion Seyoum',
    description:
      'Collab API: a self-hostable WebSocket backend for real-time collaborative editing, with Yjs CRDTs, per-tenant PostgreSQL isolation and Redis scale-out.',
    summary:
      'Collab API is a self-hostable WebSocket backend that adds real-time collaborative editing to any app. Documents sync with Yjs CRDTs, so concurrent edits merge without conflicts in any arrival order, and each tenant is isolated at the database layer rather than only in application code.',
    facts: [
      { value: 'CRDT', label: 'merges concurrent edits in any order' },
      { value: 'RLS', label: 'a PostgreSQL schema per tenant' },
      { value: 'Redis', label: 'pub/sub to scale across instances' },
    ],
    highlights: [
      'CRDT sync over the Yjs binary protocol removes last-write-wins conflicts, regardless of the order operations arrive in.',
      'Schema-per-tenant PostgreSQL with row-level security makes cross-tenant leaks impossible at the database layer, not just in middleware.',
      'A WebSocket auth lifecycle (onAuthenticate → onLoadDocument → onStoreDocument) carries a scoped userId and tenantId through every step.',
      'A Redis pub/sub adapter scales horizontally across instances without sticky sessions.',
      'Structured as a monorepo of packages: the server, a client provider, React hooks, a ProseMirror/Tiptap transformer, and extensions for SQLite, Redis, S3 and webhooks.',
    ],
    stack: ['Node.js', 'TypeScript', 'Yjs', 'WebSockets', 'PostgreSQL', 'Prisma', 'Redis', 'JWT', 'Docker'],
    links: [
      { label: 'Live demo', href: 'https://collab.bekretsion.com' },
      { label: 'Source on GitHub', href: 'https://github.com/bekretsion/collab_api' },
    ],
    published: '2026-09-14',
    updated: '2026-09-14',
  },
  {
    slug: 'lead-qualification',
    projectId: 'leads',
    tag: 'Automation',
    title: 'Lead Qualification',
    metaTitle: 'n8n Lead Qualification Pipeline — Case Study | Bekretsion Seyoum',
    description:
      'An n8n lead-qualification pipeline: LLM classification, code-based scoring and routing to HubSpot, Slack and Gmail. Rep notified in 6.6 s, no leads lost.',
    summary:
      'An inbound-lead pipeline on self-hosted n8n. A web form posts to a webhook that responds in about 70 ms; the lead is validated, de-duplicated, classified by an LLM, scored in plain code and routed to HubSpot, Slack, Google Sheets and a personalised Gmail reply. In live testing the sales rep was notified in 6.6 seconds and the prospect got a reply in 8.1 seconds.',
    facts: [
      { value: '6.6 s', label: 'from form submit to rep notified' },
      { value: '8.1 s', label: 'to a personalised reply' },
      { value: '11/11', label: 'test leads routed correctly' },
      { value: '25 → 1', label: 'identical submissions become one contact' },
    ],
    highlights: [
      'The webhook acknowledges in about 70 ms, then validates and normalises the lead before anything else runs.',
      'An idempotency key with a UNIQUE constraint makes de-duplication atomic: 25 simultaneous identical submissions produce exactly one contact.',
      'Google Gemini classifies intent, urgency, pain and fit as strict JSON; the score itself is calculated in readable code, not by the model.',
      'Each lead is routed as HOT, WARM, COLD, REVIEW or DISCARD: a HubSpot contact and deal, a Slack alert, a Sheets digest and a personalised Gmail reply.',
      'A dead-letter queue with scheduled replay means a failing downstream service delays a lead instead of losing it: 0 leads lost in live testing.',
      'Workflows are kept as code (JavaScript builders and a deploy CLI) and covered by a 175-assertion offline test suite.',
    ],
    stack: ['n8n', 'Node.js 20', 'PostgreSQL', 'Google Gemini', 'HubSpot', 'Slack', 'Google Sheets', 'Gmail'],
    links: [],
    published: '2026-09-14',
    updated: '2026-09-14',
  },
  {
    slug: 'invoice-processing',
    projectId: 'invoices',
    tag: 'Document AI',
    title: 'Document Invoice Processing',
    metaTitle: 'OCR Invoice Processing with n8n — Case Study | Bekretsion Seyoum',
    description:
      'An invoice pipeline that reads invoices with OCR, extracts fields with an LLM and validates the money before posting, tested against 16 invoices built to break it.',
    summary:
      'An invoice-processing pipeline that reads invoices with OCR, extracts the fields with an LLM, and checks the numbers before anything is posted. It is tested against 16 fictional invoices designed to break it: scans, skewed phone photos, handwritten amendments, broken arithmetic, unknown vendors, changed bank details and a corrupt file.',
    facts: [
      { value: '16', label: 'test invoices, each with an expected outcome' },
      { value: '3', label: 'invoice layouts' },
      { value: 'Exact', label: 'money checks in integer minor units' },
    ],
    highlights: [
      'A fixture generator renders 16 fictional invoices across three layouts, with a machine-readable manifest of the expected result for each, such as AUTO_POST.',
      'The edge cases are deliberate: a clean native PDF, a scan, a skewed photo, a handwritten amendment, broken arithmetic, an unknown vendor, a bank-detail change, a corrupt file and a signature-image decoy.',
      'Money is validated in integer minor units, so totals are checked exactly instead of with floating-point rounding.',
      'An OCR benchmark (Tesseract.js) proves the invoice number and total can be recovered before the workflow is allowed to depend on them.',
      'Fields are extracted by an LLM inside an n8n workflow, and an invoice that fails validation is held back instead of posted.',
    ],
    stack: ['n8n', 'Node.js', 'Tesseract.js', 'LLM field extraction', 'Headless Chrome'],
    links: [],
    published: '2026-09-14',
    updated: '2026-09-14',
  },
];

export function caseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}

export function caseStudyForProject(projectId: string | null): CaseStudy | undefined {
  return projectId ? caseStudies.find((c) => c.projectId === projectId) : undefined;
}
