# bekretsion.com

Source for [www.bekretsion.com](https://www.bekretsion.com), the portfolio of Bekretsion Seyoum, a full stack developer in Addis Ababa, Ethiopia. It's a production Next.js site with an AI voice and chat assistant that talks to visitors and passes their details on by email.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4 and hand-written CSS
- ElevenLabs Agents for the voice and text assistant (`@elevenlabs/client`)
- Resend for email
- Matter.js for the physics in the hero
- Deployed on Vercel

## What's inside

- **Prerendered pages.** The home page, service pages and case studies (`app/projects/[slug]`) are rendered on the server or at build time. Each carries structured data (JSON-LD) and Open Graph tags, and `sitemap.xml`, `robots.txt` and `llms.txt` are generated from the same data in `lib/`.
- **The assistant** (`components/CallPanel.tsx`). Voice runs over WebRTC and text over a WebSocket. The agent calls two client-side tools: one shows an email field on screen, the other submits the lead.
- **One-time session passes with a per-device limit** (`app/api/talk/route.ts`). The agent only accepts sessions that start with a pass from this route. Each pass records its conversation in an httpOnly cookie, and before issuing another the route reads how long each past conversation really ran from ElevenLabs, so one device gets four minutes in total.
- **Lead handling** (`app/api/lead/route.ts`). Before sending anything, the route checks with ElevenLabs that the conversation is real, recent and belongs to this agent. It then sends two emails through Resend with idempotency keys, so a retried request can't send twice.
- **The agent as code** (`scripts/setup-agent.mjs`). Creates or updates the ElevenLabs agent and its tools from `scripts/agent/prompt.md`, then reads the agent back and checks that every setting was saved.

## Running it locally

```bash
npm install
npm run dev
```

The assistant and the lead emails need these in `.env.local` (never committed). Everything else runs without them.

| Variable | Used by |
|---|---|
| `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` | the assistant in the browser |
| `ELEVENLABS_API_KEY` | `/api/talk`, `/api/lead`, `scripts/setup-agent.mjs` |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NOTIFY_EMAIL` | `/api/lead` |
| `VERCEL_TOKEN` | `scripts/sync-vercel.mjs` only |

Other scripts:

- `npm run agent:setup` creates or updates the ElevenLabs agent. Add `-- --local` to also allow `localhost`.
- `npm run vercel:sync` copies the runtime variables to the Vercel project.
- `npm run build` clears the Next.js build cache first, so a deploy can't reuse a stale stylesheet.
