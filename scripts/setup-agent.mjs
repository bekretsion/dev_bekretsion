// Creates — or, when NEXT_PUBLIC_ELEVENLABS_AGENT_ID is already set, updates — the ElevenLabs
// voice agent behind the site's "Talk to me" button, with its two booking tools.
// Safe to re-run after editing scripts/agent/prompt.md.
//
//   npm run agent:setup
//
// Reads ELEVENLABS_API_KEY and AGENT_TOOL_SECRET from .env.local and writes the agent id back.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ENV_FILE = path.join(ROOT, '.env.local');
process.loadEnvFile(ENV_FILE);

const API_KEY = process.env.ELEVENLABS_API_KEY;
const TOOL_SECRET = process.env.AGENT_TOOL_SECRET;
if (!API_KEY) fail('ELEVENLABS_API_KEY is empty in .env.local.');
if (!TOOL_SECRET) fail('AGENT_TOOL_SECRET is empty in .env.local.');

// The canonical host: the apex 308-redirects, and webhook POSTs don't reliably follow redirects.
const SITE = 'https://www.bekretsion.com';
const AGENT_NAME = 'Bekretsion’s assistant';
const PROMPT = readFileSync(path.join(ROOT, 'scripts', 'agent', 'prompt.md'), 'utf8');

// Choices carried over from agents already proven in production:
// - timezone must be set, or the agent has no date anchor and guesses the year;
// - English agents must use an English flash model (ElevenLabs rejects flash_v2_5 for `en`);
// - gemini-2.5-flash is the model measured to call tools without inventing completed actions;
// - end_call has to be added explicitly for agents created through the API;
// - the voice is always sent (Eric is a premade voice, present in every account).
const TIMEZONE = 'Africa/Addis_Ababa';
const LLM = 'gemini-2.5-flash';
const TTS = { model_id: 'eleven_flash_v2', voice_id: 'cjVigY5qzO86Huf0OWal', stability: 0.5, similarity_boost: 0.8, speed: 1.05 };
const ALLOWED_HOSTS = ['www.bekretsion.com', 'bekretsion.com', 'dev-bekretsion.vercel.app'];

const TOOLS = [
  {
    type: 'webhook',
    name: 'check_availability',
    description:
      'Get free 30-minute meeting slots with Bekretsion between two date-times. Returns each slot with exact start and end values and a spoken description in Addis Ababa time.',
    response_timeout_secs: 20,
    api_schema: {
      url: `${SITE}/api/agent-tools/check-availability`,
      method: 'POST',
      request_headers: { 'x-tool-secret': TOOL_SECRET },
      request_body_schema: {
        type: 'object',
        properties: {
          timeMin: {
            type: 'string',
            description: 'Start of the range to search, ISO 8601 with the +03:00 offset, e.g. 2026-09-15T00:00:00+03:00.',
          },
          timeMax: {
            type: 'string',
            description: 'End of the range to search, ISO 8601 with the +03:00 offset. At most 14 days after timeMin.',
          },
        },
        required: ['timeMin', 'timeMax'],
      },
    },
  },
  {
    type: 'webhook',
    name: 'book_meeting',
    description:
      'Book a 30-minute meeting with Bekretsion at a slot returned by check_availability. Only call after the caller confirmed the slot, their full name and their email address.',
    response_timeout_secs: 20,
    api_schema: {
      url: `${SITE}/api/agent-tools/book-meeting`,
      method: 'POST',
      request_headers: { 'x-tool-secret': TOOL_SECRET },
      request_body_schema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'The caller’s full name, as they gave it.' },
          email: { type: 'string', description: 'The caller’s email address, exactly as confirmed with them.' },
          startTime: { type: 'string', description: 'The chosen slot’s exact start value from check_availability.' },
          endTime: { type: 'string', description: 'The chosen slot’s exact end value from check_availability.' },
          reason: { type: 'string', description: 'A few words on what they want to discuss.' },
        },
        required: ['name', 'email', 'startTime', 'endTime'],
      },
    },
  },
];

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

async function api(method, route, body) {
  const res = await fetch(`https://api.elevenlabs.io/v1${route}`, {
    method,
    headers: { 'xi-api-key': API_KEY, 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  if (!res.ok) {
    const detail = typeof data === 'string' ? data : JSON.stringify(data);
    throw new Error(`${method} ${route} → HTTP ${res.status}: ${detail.slice(0, 800)}`);
  }
  return data;
}

async function upsertTool(config, existing) {
  const match = existing.find((t) => (t.tool_config?.name ?? t.name) === config.name);
  if (match) {
    const id = match.id ?? match.tool_id;
    await api('PATCH', `/convai/tools/${id}`, { tool_config: config });
    console.log(`✓ updated tool ${config.name} (${id})`);
    return id;
  }
  const created = await api('POST', '/convai/tools', { tool_config: config });
  const id = created.id ?? created.tool_id;
  console.log(`✓ created tool ${config.name} (${id})`);
  return id;
}

function saveAgentId(agentId) {
  const current = readFileSync(ENV_FILE, 'utf8');
  const line = `NEXT_PUBLIC_ELEVENLABS_AGENT_ID=${agentId}`;
  const next = /^NEXT_PUBLIC_ELEVENLABS_AGENT_ID=.*$/m.test(current)
    ? current.replace(/^NEXT_PUBLIC_ELEVENLABS_AGENT_ID=.*$/m, () => line)
    : `${current.trimEnd()}\n${line}\n`;
  writeFileSync(ENV_FILE, next);
}

async function main() {
  const listed = await api('GET', '/convai/tools');
  const existingTools = Array.isArray(listed) ? listed : (listed.tools ?? []);
  const toolIds = [];
  for (const tool of TOOLS) toolIds.push(await upsertTool(tool, existingTools));

  const agent = {
    name: AGENT_NAME,
    conversation_config: {
      agent: {
        first_message: 'Hi, I’m Bekretsion’s assistant. I can tell you about his work or book a call with him. What would you like to know?',
        language: 'en',
        prompt: {
          prompt: PROMPT,
          llm: LLM,
          temperature: 0.3,
          timezone: TIMEZONE,
          tool_ids: toolIds,
          built_in_tools: {
            end_call: { name: 'end_call', description: '', params: { system_tool_type: 'end_call' } },
          },
        },
      },
      tts: TTS,
      conversation: { max_duration_seconds: 600 },
    },
    platform_settings: {
      // The site starts sessions with the public agent id, so auth stays off; the allowlist
      // keeps the agent to these sites.
      auth: { enable_auth: false, allowlist: ALLOWED_HOSTS.map((hostname) => ({ hostname })) },
      // The "Start a text chat" button asks for a text-only session; the agent must allow that override.
      overrides: { conversation_config_override: { conversation: { text_only: true } } },
    },
  };

  let agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
  if (agentId) {
    try {
      await api('PATCH', `/convai/agents/${agentId}`, agent);
      console.log(`✓ updated agent ${agentId}`);
    } catch (err) {
      if (!/HTTP 404/.test(String(err))) throw err;
      console.log(`! agent ${agentId} no longer exists, creating a new one`);
      agentId = undefined;
    }
  }
  if (!agentId) {
    const created = await api('POST', '/convai/agents/create', agent);
    agentId = created.agent_id;
    saveAgentId(agentId);
    console.log(`✓ created agent ${agentId} and saved it to .env.local`);
  }

  // A PATCH can be accepted without every field persisting, so read the agent back and check.
  const saved = await api('GET', `/convai/agents/${agentId}`);
  const prompt = saved.conversation_config?.agent?.prompt ?? {};
  const checks = {
    timezone: prompt.timezone === TIMEZONE,
    llm: prompt.llm === LLM,
    tools: toolIds.every((id) => (prompt.tool_ids ?? []).includes(id)),
    voice: saved.conversation_config?.tts?.voice_id === TTS.voice_id,
    allowlist: ALLOWED_HOSTS.every((h) => (saved.platform_settings?.auth?.allowlist ?? []).some((a) => a.hostname === h)),
    textChat: saved.platform_settings?.overrides?.conversation_config_override?.conversation?.text_only === true,
  };
  for (const [name, ok] of Object.entries(checks)) console.log(`${ok ? '✓' : '✗'} ${name}`);
  if (!Object.values(checks).every(Boolean)) fail('Some settings did not persist on the agent (see ✗ above).');
  console.log(`\nAgent ready: ${agentId}`);
}

main().catch((err) => fail(err.message));
