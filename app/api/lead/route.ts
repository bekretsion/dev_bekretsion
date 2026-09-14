import { NextRequest, NextResponse } from 'next/server';
import { EMAIL_PATTERN, isLeadTopic, type Lead } from '@/lib/lead';
import { EmailNotConfiguredError, sendEmail } from '@/lib/email';
import { leadEmail, visitorEmail } from '@/lib/email-templates';
import { EMAIL } from '@/lib/site';

// Called from the browser when the voice agent's submit_lead tool fires. Because anyone can call
// it, it only acts for a real, recent conversation with Bekretsion's own agent, and each
// conversation can send its emails once.
const MAX_CONVERSATION_AGE_SECONDS = 2 * 60 * 60;

/** Plain text only: no links, collapsed whitespace, capped length. */
function clean(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/https?:\/\/\S+|www\.\S+/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

async function conversationProblem(conversationId: string): Promise<string | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
  if (!apiKey || !agentId) return 'The assistant is not fully configured.';

  const res = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${encodeURIComponent(conversationId)}`, {
    headers: { 'xi-api-key': apiKey },
    cache: 'no-store',
  });
  if (!res.ok) return 'Unknown conversation.';
  const conversation = await res.json();
  if (conversation.agent_id !== agentId) return 'Unknown conversation.';
  const started = conversation.metadata?.start_time_unix_secs;
  if (typeof started === 'number' && Date.now() / 1000 - started > MAX_CONVERSATION_AGE_SECONDS) {
    return 'This conversation has expired.';
  }
  return null;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const conversationId =
    typeof body?.conversationId === 'string' && /^[\w-]{6,128}$/.test(body.conversationId) ? body.conversationId : '';

  const lead: Lead = {
    conversationId,
    name: clean(body?.name, 80),
    email: typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '',
    company: clean(body?.company, 120) || undefined,
    role: clean(body?.role, 120) || undefined,
    topic: isLeadTopic(body?.topic) ? body.topic : 'other',
    summary: clean(body?.summary, 1500),
    timeline: clean(body?.timeline, 200) || undefined,
    budget: clean(body?.budget, 200) || undefined,
  };

  if (!conversationId) return NextResponse.json({ error: 'Missing conversation.' }, { status: 400 });
  if (!lead.name) return NextResponse.json({ error: 'Ask for their name first.' }, { status: 400 });
  if (!EMAIL_PATTERN.test(lead.email)) {
    return NextResponse.json(
      { error: 'That email address does not look valid. Ask them to spell it, or to type it in the box on their screen.' },
      { status: 400 }
    );
  }

  const problem = await conversationProblem(conversationId);
  if (problem) return NextResponse.json({ error: problem }, { status: 403 });

  const notify = process.env.NOTIFY_EMAIL || EMAIL;
  try {
    await sendEmail({
      to: lead.email,
      ...visitorEmail(lead),
      replyTo: notify,
      idempotencyKey: `visitor-${conversationId}`,
    });
    await sendEmail({
      to: notify,
      ...leadEmail(lead, new Date()),
      replyTo: lead.email,
      idempotencyKey: `lead-${conversationId}`,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('lead email failed', err);
    const message =
      err instanceof EmailNotConfiguredError
        ? 'Saving details is not set up yet.'
        : 'Could not save their details right now.';
    return NextResponse.json({ error: `${message} Suggest they email ${EMAIL}.` }, { status: 502 });
  }
}
