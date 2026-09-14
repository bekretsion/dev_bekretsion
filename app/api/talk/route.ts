import { NextRequest, NextResponse } from 'next/server';
import { TALK_LIMIT_SECONDS } from '@/lib/call';

// Hands the browser a one-time pass to talk to the assistant, but only while this device has talk
// time left. A device is a cookie listing the conversations it was given passes for; how long each
// one actually ran comes from ElevenLabs, so the page can't under-report it. Clearing cookies does
// start over as a new device, which is why the agent itself also stops every conversation at the limit.
const COOKIE = 'bk_talk';
const MAX_TRACKED = 60;
const CONVERSATION_ID = /^[\w-]{6,128}$/;
const CONVAI = 'https://api.elevenlabs.io/v1/convai';
const UNAVAILABLE = 'The assistant is unavailable right now. Please try again in a moment.';

interface Settings {
  apiKey: string;
  agentId: string;
}

function settings(): Settings | null {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
  return apiKey && agentId ? { apiKey, agentId } : null;
}

function trackedConversations(req: NextRequest): string[] {
  const value = req.cookies.get(COOKIE)?.value ?? '';
  return value.split('.').filter((id) => CONVERSATION_ID.test(id));
}

/** Seconds of talk left for a device that was given passes for these conversations. */
async function remainingSeconds(ids: string[], { apiKey, agentId }: Settings): Promise<number> {
  if (ids.length >= MAX_TRACKED) return 0;
  const now = Date.now() / 1000;
  const lengths = await Promise.all(
    ids.map(async (id) => {
      const res = await fetch(`${CONVAI}/conversations/${id}`, { headers: { 'xi-api-key': apiKey }, cache: 'no-store' });
      if (res.status === 404) return 0; // the pass was never used
      if (!res.ok) throw new Error(`conversation lookup failed: HTTP ${res.status}`);
      const conversation = await res.json();
      if (conversation.agent_id !== agentId) return 0;
      const { start_time_unix_secs: started, call_duration_secs: duration } = conversation.metadata ?? {};
      if (conversation.status === 'initiated' || conversation.status === 'in-progress') {
        return typeof started === 'number' ? Math.min(Math.max(now - started, 0), TALK_LIMIT_SECONDS) : 0;
      }
      return typeof duration === 'number' ? duration : 0;
    })
  );
  const used = lengths.reduce((sum, seconds) => sum + seconds, 0);
  return Math.max(0, Math.floor(TALK_LIMIT_SECONDS - used));
}

/** A one-time pass for a new conversation, and that conversation's id. */
async function newPass(mode: 'voice' | 'text', { apiKey, agentId }: Settings) {
  const agent = encodeURIComponent(agentId);
  // Voice runs over WebRTC, which takes a token; text runs over a websocket, which takes a signed URL.
  const url =
    mode === 'voice'
      ? `${CONVAI}/conversation/token?agent_id=${agent}`
      : `${CONVAI}/conversation/get-signed-url?agent_id=${agent}&include_conversation_id=true`;
  const res = await fetch(url, { headers: { 'xi-api-key': apiKey }, cache: 'no-store' });
  if (!res.ok) throw new Error(`pass request failed: HTTP ${res.status}`);
  const data = await res.json();
  if (mode === 'voice') {
    return { pass: { conversationToken: String(data.token) }, conversationId: String(data.conversation_id ?? '') };
  }
  const signedUrl = String(data.signed_url);
  return { pass: { signedUrl }, conversationId: new URL(signedUrl).searchParams.get('conversation_id') ?? '' };
}

export async function GET(req: NextRequest) {
  const config = settings();
  if (!config) return NextResponse.json({ error: 'The assistant isn’t set up yet.' }, { status: 503 });
  try {
    return NextResponse.json({ remainingSeconds: await remainingSeconds(trackedConversations(req), config) });
  } catch (err) {
    console.error('talk time lookup failed', err);
    return NextResponse.json({ error: UNAVAILABLE }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const config = settings();
  if (!config) return NextResponse.json({ error: 'The assistant isn’t set up yet.' }, { status: 503 });
  const body = await req.json().catch(() => null);
  const mode = body?.mode === 'text' ? 'text' : 'voice';
  const tracked = trackedConversations(req);

  try {
    const left = await remainingSeconds(tracked, config);
    if (left <= 0) {
      return NextResponse.json({ error: 'This device has used its talk time.', remainingSeconds: 0 }, { status: 429 });
    }

    const { pass, conversationId } = await newPass(mode, config);
    // Without the id the conversation couldn't be counted, so no pass goes out.
    if (!CONVERSATION_ID.test(conversationId)) throw new Error('pass came without a conversation id');

    const response = NextResponse.json({ ...pass, remainingSeconds: left });
    response.cookies.set(COOKIE, [...tracked, conversationId].join('.'), {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/api/talk',
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  } catch (err) {
    console.error('talk pass failed', err);
    return NextResponse.json({ error: UNAVAILABLE }, { status: 502 });
  }
}
