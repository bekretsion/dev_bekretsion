import { NextRequest, NextResponse } from 'next/server';
import { getFreeBusy } from '@/lib/google';
import { verifyToolSecret } from '@/lib/toolAuth';

export async function POST(req: NextRequest) {
  if (!verifyToolSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const timeMin = body?.timeMin;
  const timeMax = body?.timeMax;

  if (typeof timeMin !== 'string' || typeof timeMax !== 'string') {
    return NextResponse.json(
      { error: 'timeMin and timeMax are required, as ISO 8601 timestamps.' },
      { status: 400 }
    );
  }

  try {
    const busy = await getFreeBusy(timeMin, timeMax);
    return NextResponse.json({ busy });
  } catch (err) {
    console.error('check-availability failed', err);
    return NextResponse.json({ error: 'Could not check calendar availability.' }, { status: 500 });
  }
}
