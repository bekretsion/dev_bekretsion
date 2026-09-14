// Creates, or when NEXT_PUBLIC_ELEVENLABS_AGENT_ID is already set updates, the ElevenLabs agent
// behind the site's "Talk to me" button, with its two client tools. Safe to re-run after
// editing scripts/agent/prompt.md.
//
//   npm run agent:setup             production domains only
//   npm run agent:setup -- --local  also allow localhost, for testing on this machine
//
// Reads ELEVENLABS_API_KEY from .env.local and writes the agent id back into it.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ENV_FILE = path.join(ROOT, '.env.local');
process.loadEnvFile(ENV_FILE);

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) fail('ELEVENLABS_API_KEY is empty in .env.local.');

const AGENT_NAME = 'Bekretsion’s assistant';
const PROMPT = readFileSync(path.join(ROOT, 'scripts', 'agent', 'prompt.md'), 'utf8');
const FIRST_MESSAGE =
  'Hey, thanks for stopping by! I’m Bekre’s assistant. He builds backends, full-stack web products, AI voice receptionists and business automation. What brings you here today?';

// Choices carried over from agents already proven in production:
// - timezone must be set, or the agent has no date anchor and guesses the year;
// - gemini-2.5-flash is the model measured to call tools without inventing completed actions;
// - end_call has to be added explicitly for agents created through the API.
// The voice: eleven_v3_conversational sounds far more human than the flash models, and an English
// agent accepts it (ElevenLabs switches expressive mode on with it). It has to be a premade voice:
// free plans can't use Voice Library voices through the API.
const TIMEZONE = 'Africa/Addis_Ababa';
const LLM = 'gemini-2.5-flash';
const VOICE_ID = 'iP95p4xoKVk53GoZ742B'; // Chris - Charming, Down-to-Earth
const TTS = { model_id: 'eleven_v3_conversational', voice_id: VOICE_ID, stability: 0.5, similarity_boost: 0.8, speed: 1.0 };
const ALLOWED_HOSTS = ['www.bekretsion.com', 'bekretsion.com', 'dev-bekretsion.vercel.app'];
if (process.argv.includes('--local')) ALLOWED_HOSTS.push('localhost');

// Client tools run in the visitor's browser (components/CallPanel.tsx); names must match exactly.
const TOOLS = [
  {
    type: 'client',
    name: 'show_email_box',
    description:
      'Show an email field on the visitor’s screen so they can type their email instead of saying it. Call it right after asking for their email.',
    expects_response: false,
    parameters: { type: 'object', properties: {}, required: [] },
  },
  {
    type: 'client',
    name: 'submit_lead',
    description:
      'Save the visitor’s details so Bekre can get in touch. Call it as soon as their email has been confirmed. Returns whether it was saved.',
    expects_response: true,
    response_timeout_secs: 20,
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'The visitor’s name, as they gave it.' },
        email: { type: 'string', description: 'The visitor’s email address, exactly as confirmed.' },
        company: { type: 'string', description: 'Their company or organisation, only if they said it.' },
        role: { type: 'string', description: 'Their role or job title, only if they said it.' },
        topic: {
          type: 'string',
          enum: ['backend', 'full_stack', 'ai_receptionist', 'automation', 'hiring', 'other'],
          description: 'What they want to talk to Bekre about.',
        },
        summary: {
          type: 'string',
          description: 'Three to five sentences for Bekre only: what they need, their situation, and anything that helps him prepare. Only what they said.',
        },
        timeline: { type: 'string', description: 'When they need it, only if they mentioned it.' },
        budget: { type: 'string', description: 'Their budget, only if they mentioned it.' },
      },
      required: ['name', 'email', 'topic', 'summary'],
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
        first_message: FIRST_MESSAGE,
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
      // No single conversation runs past 4 minutes (TALK_LIMIT_SECONDS in lib/call.ts); /api/talk
      // also refuses new ones once a device has used that much in total.
      conversation: { max_duration_seconds: 240 },
    },
    platform_settings: {
      // Every session needs a one-time pass from /api/talk, which enforces the per-device limit, so
      // the agent id alone can't start one. The allowlist keeps passes to these sites.
      auth: { enable_auth: true, allowlist: ALLOWED_HOSTS.map((hostname) => ({ hostname })) },
      // "Start a text chat" asks for a text-only session; the agent must allow that override.
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

  // An accepted PATCH doesn't guarantee every field persisted, so read the agent back.
  const saved = await api('GET', `/convai/agents/${agentId}`);
  const prompt = saved.conversation_config?.agent?.prompt ?? {};
  const checks = {
    timezone: prompt.timezone === TIMEZONE,
    llm: prompt.llm === LLM,
    tools: toolIds.every((id) => (prompt.tool_ids ?? []).includes(id)),
    firstMessage: saved.conversation_config?.agent?.first_message === FIRST_MESSAGE,
    voice: saved.conversation_config?.tts?.voice_id === TTS.voice_id,
    voiceModel: saved.conversation_config?.tts?.model_id === TTS.model_id,
    maxDuration: saved.conversation_config?.conversation?.max_duration_seconds === 240,
    passRequired: saved.platform_settings?.auth?.enable_auth === true,
    allowlist: ALLOWED_HOSTS.every((h) => (saved.platform_settings?.auth?.allowlist ?? []).some((a) => a.hostname === h)),
    textChat: saved.platform_settings?.overrides?.conversation_config_override?.conversation?.text_only === true,
  };
  for (const [name, ok] of Object.entries(checks)) console.log(`${ok ? '✓' : '✗'} ${name}`);
  if (!Object.values(checks).every(Boolean)) fail('Some settings did not persist on the agent (see ✗ above).');
  console.log(`\nAgent ready: ${agentId}`);
}

main().catch((err) => fail(err.message));
