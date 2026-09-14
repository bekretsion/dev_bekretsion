import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/google';

function page(body: string) {
  return new NextResponse(`<pre style="font:14px monospace;white-space:pre-wrap;padding:2rem;">${body}</pre>`, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export async function GET(req: NextRequest) {
  // See start/route.ts — this prints a live refresh token and must never run in production.
  if (process.env.NODE_ENV === 'production') return new NextResponse(null, { status: 404 });

  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');

  if (error) {
    return page(`Google returned an error: ${error}`);
  }
  if (!code) {
    return page('Missing "code" query param.');
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    if (!tokens.refresh_token) {
      return page(
        `No refresh_token was returned — this usually means this app already has a grant for your account.\n\n` +
          `Go to https://myaccount.google.com/permissions, remove access for this app, then visit /api/google/oauth/start again.`
      );
    }
    return page(
      `Success. Copy this into your .env.local as GOOGLE_REFRESH_TOKEN, then restart the dev server:\n\n` +
        `${tokens.refresh_token}\n\n` +
        `This route exposes a live refresh token — do not deploy it to production without removing or locking it down afterward.`
    );
  } catch (err) {
    console.error('Google OAuth callback failed', err);
    return page(`Token exchange failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}
