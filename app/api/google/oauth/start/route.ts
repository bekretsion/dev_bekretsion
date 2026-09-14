import { NextResponse } from 'next/server';
import { getGoogleAuthUrl } from '@/lib/google';

// Local-only helper for obtaining GOOGLE_REFRESH_TOKEN once. The callback prints a live
// token, so neither half of this flow is ever served in production.
export async function GET() {
  if (process.env.NODE_ENV === 'production') return new NextResponse(null, { status: 404 });
  return NextResponse.redirect(getGoogleAuthUrl());
}
