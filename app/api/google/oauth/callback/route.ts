import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { exchangeCodeForTokens } from '@/lib/google';

function page(body: string) {
  return new NextResponse(`<pre style="font:14px monospace;white-space:pre-wrap;padding:2rem;">${body}</pre>`, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

/** Writes the token into .env.local, so it never has to be copied off the screen. */
async function saveRefreshToken(token: string): Promise<boolean> {
  const envPath = path.join(process.cwd(), '.env.local');
  try {
    const current = await fs.readFile(envPath, 'utf8');
    const line = `GOOGLE_REFRESH_TOKEN=${token}`;
    const next = /^GOOGLE_REFRESH_TOKEN=.*$/m.test(current)
      ? current.replace(/^GOOGLE_REFRESH_TOKEN=.*$/m, () => line)
      : `${current.trimEnd()}\n${line}\n`;
    await fs.writeFile(envPath, next);
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  // See start/route.ts — this handles a live refresh token and must never run in production.
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
    if (await saveRefreshToken(tokens.refresh_token)) {
      return page('Calendar access saved to .env.local (GOOGLE_REFRESH_TOKEN). You can close this tab.');
    }
    return page(
      `Couldn't write .env.local. Add this line to it yourself, then restart the dev server:\n\n` +
        `GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`
    );
  } catch (err) {
    console.error('Google OAuth callback failed', err);
    return page(`Token exchange failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}
