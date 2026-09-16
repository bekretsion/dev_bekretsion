import type { Rich } from './rich';
import { EMAIL } from './site';

// The service pages. Each opens with a direct answer (what, for whom, the strongest proof) —
// search engines and AI answers quote the top of a page far more than the rest.

export interface ServiceDoc {
  slug: string;
  /** Short name: breadcrumbs, footer, the Service entity. */
  name: string;
  serviceType: string;
  eyebrow: string;
  title: string;
  metaTitle: string;
  description: string;
  lede: string;
  facts: { value: string; label: string }[];
  sections: { heading: string; paragraphs?: Rich[]; items?: Rich[] }[];
  faq: { q: string; a: Rich }[];
  availableLanguage?: string[];
  updated: string;
}

// Order is the order everywhere: footer, nav, sitemap and llms.txt.
export const services: ServiceDoc[] = [
  {
    slug: 'backend-development',
    name: 'Backend development',
    serviceType: 'Backend software development',
    eyebrow: 'Service · Backend development',
    title: 'Backend development: real-time systems, multi-tenant APIs and integrations',
    metaTitle: 'Backend Developer in Ethiopia — APIs & Real-Time Systems | Bekretsion Seyoum',
    description:
      'Backend development by Bekretsion Seyoum in Addis Ababa: real-time WebSocket systems, multi-tenant APIs with database-level isolation, auth, payments and integrations. Open to remote work.',
    lede: 'I build backends for products that have to stay correct under real use: real-time WebSocket systems, multi-tenant APIs that isolate each customer at the database layer, and the auth, payment and third-party integrations around them. I’m Bekretsion Seyoum, a backend software engineer in Addis Ababa, Ethiopia, open to remote work.',
    facts: [
      { value: '6.6 s', label: 'from web form to a sales rep alert' },
      { value: 'RLS', label: 'tenant isolation enforced in PostgreSQL' },
      { value: '85+', label: 'ordered migrations run on startup in Hello' },
    ],
    sections: [
      {
        heading: 'What I build',
        items: [
          ['Real-time systems: WebSocket servers that keep many clients in sync, scaled across instances with Redis.'],
          ['Multi-tenant APIs: a PostgreSQL schema per tenant with row-level security, scoped JWT auth and role-based access.'],
          [
            { text: 'Payments and billing', href: '/projects/hello-ai' },
            ': Stripe webhooks with signature verification, usage metered by the minute, and automatic top-ups.',
          ],
          ['Integrations: ElevenLabs, Vapi, Google Calendar, Microsoft Graph, Dropbox Sign, HubSpot, Slack and OAuth 2.0 sign-in.'],
        ],
      },
      {
        heading: 'How I work',
        items: [
          ['Rules that must hold are enforced in the database — schemas, constraints, idempotency keys — not only in application code.'],
          ['Webhooks are verified, retried, and safe to receive twice.'],
          ['Scheduled jobs are idempotent, and migrations run in order on every start.'],
          ['Failures are queued and replayed instead of dropped.'],
        ],
      },
      {
        heading: 'Stack',
        paragraphs: [
          [
            'TypeScript, JavaScript and SQL on Node.js and Express, with Prisma. PostgreSQL, MySQL and Redis. Docker and GitHub Actions, deployed on Render, Vercel, Neon and Upstash.',
          ],
        ],
      },
    ],
    faq: [
      {
        q: 'What backend work do you take on?',
        a: ['APIs, real-time features, multi-tenant SaaS backends, payment and billing flows, and integrations with third-party services.'],
      },
      {
        q: 'Which languages and databases do you use?',
        a: ['TypeScript and JavaScript on Node.js, with PostgreSQL, MySQL and Redis.'],
      },
      {
        q: 'Do you work remotely?',
        a: ['Yes. I’m based in Addis Ababa, Ethiopia, and work remotely with teams anywhere.'],
      },
      {
        q: 'How do we start?',
        a: [`Email me at ${EMAIL} with what you’re building and where it’s stuck.`],
      },
    ],
    updated: '2026-09-14',
  },
  {
    slug: 'full-stack-development',
    name: 'Full-stack development',
    serviceType: 'Full-stack web development',
    eyebrow: 'Service · Full-stack development',
    title: 'Full-stack web development with Next.js and Node.js',
    metaTitle: 'Full-Stack Developer in Ethiopia — Next.js & Node.js | Bekretsion Seyoum',
    description:
      'Full-stack web development by Bekretsion Seyoum: Next.js and React frontends on Node.js backends, for dashboards, SaaS products and fast, search-friendly websites. Addis Ababa, open to remote work.',
    lede: 'I build complete web products, from the database to the interface: Next.js and React frontends on Node.js backends, with the auth, payments and integrations in between. This website is one of them. I’m Bekretsion Seyoum, a software engineer in Addis Ababa, Ethiopia, open to remote work.',
    facts: [
      { value: 'Next.js', label: 'React interfaces, rendered on the server' },
      { value: 'Node.js', label: 'the APIs behind them' },
      { value: 'Live', label: 'Hello’s dashboard is in production' },
    ],
    sections: [
      {
        heading: 'What I build',
        items: [
          [
            { text: 'SaaS dashboards', href: '/projects/hello-ai' },
            ': Hello’s dashboard lets a business manage its AI assistants, calls, appointments, documents and billing, on a Node.js API.',
          ],
          ['Fast, search-friendly websites: server-rendered pages, structured data, and layouts checked on real phone profiles, like this one.'],
        ],
      },
      {
        heading: 'Stack',
        paragraphs: [
          [
            'Next.js, React and TypeScript with Tailwind CSS on the front end. Node.js, Express and Prisma with PostgreSQL, MySQL and Redis on the back end. Deployed on Vercel and Render.',
          ],
        ],
      },
    ],
    faq: [
      {
        q: 'Can you build both the frontend and the backend?',
        a: ['Yes. I build both, so the API and the interface are designed together instead of meeting in the middle.'],
      },
      {
        q: 'Which frontend framework do you use?',
        a: ['Next.js with React and TypeScript, which gives fast server-rendered pages that search engines can read.'],
      },
      {
        q: 'Do you work remotely?',
        a: ['Yes. I’m based in Addis Ababa, Ethiopia, and work remotely with teams anywhere.'],
      },
      {
        q: 'How do we start?',
        a: [`Email me at ${EMAIL} with what you want to build.`],
      },
    ],
    updated: '2026-09-14',
  },
  {
    slug: 'ai-voice-receptionist',
    name: 'AI voice receptionist',
    serviceType: 'AI voice receptionist development',
    eyebrow: 'Service · AI voice receptionist',
    title: 'AI voice receptionists that speak Amharic, Afaan Oromo and Tigrinya',
    metaTitle: 'AI Voice Receptionist in Amharic, Afaan Oromo & Tigrinya | Bekretsion Seyoum',
    description:
      'AI voice receptionists for businesses in Ethiopia: answers calls in Amharic, Afaan Oromo, Tigrinya, English and 90+ languages, books appointments and sends every call to your team.',
    lede: 'I build AI voice receptionists for businesses in Ethiopia and beyond: an assistant that answers your phone in Amharic, Afaan Oromo, Tigrinya, English or any of 90+ other languages, books appointments into your calendar, and passes every call to your team as a transcript. I’m Bekretsion Seyoum, a software engineer in Addis Ababa. My voice platform, Hello, was a national finalist at the ALX Ethiopia × Kuriftu Hospitality Hackathon 2026.',
    facts: [
      { value: '95+', label: 'languages, Amharic, Afaan Oromo and Tigrinya included' },
      { value: 'Finalist', label: 'ALX Ethiopia × Kuriftu Hospitality Hackathon 2026' },
      { value: '24/7', label: 'answers calls, including after hours' },
    ],
    sections: [
      {
        heading: 'What the receptionist does',
        items: [
          ['Answers calls in Amharic, Afaan Oromo, Tigrinya, English or any of 90+ other languages.'],
          ['Checks availability and books appointments into Google or Outlook calendars during the call.'],
          ['Saves every call with its transcript, so nothing depends on someone taking notes.'],
          ['Sends the outcome where your team already works: a Slack message, a calendar event or a CRM record.'],
        ],
      },
      {
        heading: 'How it’s built',
        paragraphs: [
          [
            'It runs on the architecture I built for ',
            { text: 'Hello', href: '/projects/hello-ai' },
            '. ',
            { text: 'ElevenLabs', href: 'https://elevenlabs.io' },
            ' and ',
            { text: 'Vapi', href: 'https://vapi.ai' },
            ' sit behind one interface, so the voice provider can change without rewriting the product. Calls arrive by webhook and are matched to the right assistant before anything is billed, then a post-call engine extracts what was said and dispatches it to your tools. Billing runs through Stripe, by the minute, with automatic top-ups.',
          ],
        ],
      },
      {
        heading: 'Who it’s for',
        paragraphs: [
          [
            'Businesses that lose customers when nobody picks up: hotels, clinics, service businesses and support lines, especially where callers expect to be answered in Amharic or another local language.',
          ],
        ],
      },
    ],
    faq: [
      {
        q: 'Can an AI receptionist really speak Amharic?',
        a: ['Yes. It uses ElevenLabs multilingual voice models, which cover 95+ languages including Amharic, Afaan Oromo and Tigrinya.'],
      },
      {
        q: 'Can it book appointments?',
        a: ['Yes. It checks availability and books into Google or Outlook calendars while the caller is still on the line.'],
      },
      {
        q: 'What happens after each call?',
        a: ['The call is saved with its transcript, and a post-call step turns it into actions: a Slack alert, a calendar event or a record in your CRM.'],
      },
      {
        q: 'How do I get one for my business?',
        a: [`Email me at ${EMAIL} with what your callers usually need, and I’ll reply with how the receptionist would work for you.`],
      },
    ],
    availableLanguage: ['Amharic', 'Afaan Oromo', 'Tigrinya', 'English'],
    updated: '2026-09-14',
  },
  {
    slug: 'business-automation',
    name: 'Business automation with n8n',
    serviceType: 'Business process automation',
    eyebrow: 'Service · Business automation',
    title: 'Business automation with n8n',
    metaTitle: 'Business Automation with n8n in Ethiopia | Bekretsion Seyoum',
    description:
      'n8n business automation for companies in Ethiopia and remote clients: lead qualification, invoice processing and CRM, email and chat hand-offs, built with tests and no lost data.',
    lede: 'I build n8n automations for businesses in Ethiopia and remote clients: lead qualification, invoice processing, and the hand-offs between your forms, CRM, email and chat. One lead pipeline I built notifies a sales rep 6.6 seconds after a form is submitted, replies to the prospect in 8.1 seconds, and lost no leads in live testing. I’m Bekretsion Seyoum, a software engineer in Addis Ababa.',
    facts: [
      { value: '6.6 s', label: 'from form submit to sales rep notified' },
      { value: '25 → 1', label: 'identical submissions become one contact' },
      { value: '175', label: 'test assertions on one pipeline' },
      { value: '16', label: 'invoices built to break the OCR pipeline' },
    ],
    sections: [
      {
        heading: 'What I automate',
        items: [
          [
            { text: 'Lead qualification', href: '/projects/lead-qualification' },
            ': capture a form, score the lead, and route it to HubSpot, Slack, Google Sheets and a personalised email reply.',
          ],
          [
            { text: 'Invoice processing', href: '/projects/invoice-processing' },
            ': read invoices with OCR, extract the fields with an LLM, and post only what passes validation.',
          ],
          [
            { text: 'After-call work', href: '/ai-voice-receptionist' },
            ': turn a phone call into a CRM record, a calendar event or a team alert.',
          ],
        ],
      },
      {
        heading: 'How I build them',
        items: [
          ['Workflows are kept as code, versioned and covered by tests, not only clicked together in an editor.'],
          ['Duplicates are stopped at the database with idempotency keys, so a double-submitted form never creates two customers.'],
          ['Failures go to a dead-letter queue and are replayed, so an outage delays work instead of losing it.'],
          ['LLMs classify and extract; decisions such as lead scores and money checks are made in plain code you can read.'],
        ],
      },
    ],
    faq: [
      {
        q: 'What is n8n?',
        a: [
          { text: 'n8n', href: 'https://n8n.io' },
          ' is a workflow automation tool that connects apps and APIs. It can be self-hosted, so your data stays on a server you control.',
        ],
      },
      {
        q: 'Which tools can you connect?',
        a: ['Anything with an API. Pipelines I’ve built connect HubSpot, Slack, Gmail, Google Sheets, Outlook, Stripe and Google Gemini.'],
      },
      {
        q: 'Do you work with businesses outside Ethiopia?',
        a: ['Yes. I’m based in Addis Ababa and work remotely with clients anywhere.'],
      },
      {
        q: 'How do we start?',
        a: [`Email me at ${EMAIL} with the process that takes your team the most time, and I’ll reply with what could be automated and how.`],
      },
    ],
    updated: '2026-09-14',
  },
];

export function serviceBySlug(slug: string): ServiceDoc {
  const doc = services.find((s) => s.slug === slug);
  if (!doc) throw new Error(`Unknown service: ${slug}`);
  return doc;
}
