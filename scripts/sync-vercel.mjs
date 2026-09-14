// Copies the site's runtime settings from .env.local into the Vercel project (production and
// preview). Prints variable names only, never values.
//
//   npm run vercel:sync               set the variables
//   npm run vercel:sync -- --redeploy set them, then rebuild the current production deployment
//
// NEXT_PUBLIC_* values are baked in at build time, so a change to one only shows after a deploy.
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.loadEnvFile(path.join(ROOT, '.env.local'));

const TOKEN = process.env.VERCEL_TOKEN;
const PROJECT = 'dev-bekretsion';
const REDEPLOY = process.argv.includes('--redeploy');

// What the deployed app reads. GOOGLE_REDIRECT_URI and the setup-only keys stay local.
const KEYS = [
  'NEXT_PUBLIC_ELEVENLABS_AGENT_ID',
  'AGENT_TOOL_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REFRESH_TOKEN',
  'GOOGLE_CALENDAR_ID',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'NOTIFY_EMAIL',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHAT_ID',
];

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}
if (!TOKEN) fail('VERCEL_TOKEN is empty in .env.local.');

let teamId;
async function vercel(method, route, body) {
  const url = new URL(`https://api.vercel.com${route}`);
  if (teamId) url.searchParams.set('teamId', teamId);
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} ${route} → HTTP ${res.status}: ${JSON.stringify(data.error ?? data).slice(0, 400)}`);
  return data;
}

async function findProject() {
  try {
    return await vercel('GET', `/v9/projects/${PROJECT}`);
  } catch (err) {
    if (!/HTTP 404/.test(String(err))) throw err;
  }
  const { teams = [] } = await vercel('GET', '/v2/teams');
  for (const team of teams) {
    teamId = team.id;
    try {
      return await vercel('GET', `/v9/projects/${PROJECT}`);
    } catch (err) {
      if (!/HTTP 404/.test(String(err))) throw err;
    }
  }
  teamId = undefined;
  fail(`No Vercel project named ${PROJECT} is visible to this token.`);
}

async function main() {
  const project = await findProject();
  console.log(`✓ project ${project.name}${teamId ? ' (team)' : ''}`);

  const missing = [];
  for (const key of KEYS) {
    const value = process.env[key];
    if (!value) {
      missing.push(key);
      continue;
    }
    await vercel('POST', `/v10/projects/${project.id}/env?upsert=true`, {
      key,
      value,
      type: key.startsWith('NEXT_PUBLIC_') ? 'plain' : 'encrypted',
      target: ['production', 'preview'],
    });
    console.log(`✓ set ${key}`);
  }
  if (missing.length) console.log(`- skipped (empty in .env.local): ${missing.join(', ')}`);

  if (!REDEPLOY) return;
  const { deployments = [] } = await vercel(
    'GET',
    `/v6/deployments?projectId=${project.id}&target=production&state=READY&limit=1`
  );
  if (!deployments.length) fail('No ready production deployment to rebuild.');
  const created = await vercel('POST', '/v13/deployments?forceNew=1', {
    name: project.name,
    deploymentId: deployments[0].uid,
    target: 'production',
  });
  console.log(`… rebuilding ${created.id}`);
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 10_000));
    const d = await vercel('GET', `/v13/deployments/${created.id}`);
    if (d.readyState === 'READY') return console.log('✓ deployed to production');
    if (d.readyState === 'ERROR' || d.readyState === 'CANCELED') fail(`deployment ${d.readyState}`);
  }
  fail('deployment still building after 10 minutes');
}

main().catch((err) => fail(err.message));
