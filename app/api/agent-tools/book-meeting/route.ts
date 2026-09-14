import { NextRequest, NextResponse } from 'next/server';
import { createCalendarEvent } from '@/lib/google';
import { sendBookingEmails } from '@/lib/email';
import { sendTelegramMessage } from '@/lib/telegram';
import { verifyToolSecret } from '@/lib/toolAuth';

export async function POST(req: NextRequest) {
  if (!verifyToolSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const name = body?.name;
  const email = body?.email;
  const startTime = body?.startTime;
  const endTime = body?.endTime;
  const reason = typeof body?.reason === 'string' ? body.reason : undefined;

  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof startTime !== 'string' ||
    typeof endTime !== 'string'
  ) {
    return NextResponse.json(
      { error: 'name, email, startTime, and endTime are required. startTime/endTime must be ISO 8601 timestamps.' },
      { status: 400 }
    );
  }

  try {
    const event = await createCalendarEvent({ name, email, startTime, endTime, reason });
    const meetLink = event.hangoutLink ?? undefined;

    await sendBookingEmails({ name, email, startTime, meetLink, reason });
    await sendTelegramMessage(
      [
        '📅 *New meeting booked*',
        `${name} (${email})`,
        new Date(startTime).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }),
        reason ? `Reason: ${reason}` : null,
        meetLink ? meetLink : null,
      ]
        .filter(Boolean)
        .join('\n')
    );

    return NextResponse.json({ success: true, meetLink: meetLink ?? null, eventId: event.id });
  } catch (err) {
    console.error('book-meeting failed', err);
    return NextResponse.json({ error: 'Could not book the meeting.' }, { status: 500 });
  }
}
