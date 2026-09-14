import { NextRequest, NextResponse } from 'next/server';
import { createCalendarEvent, findBookingForAttendee } from '@/lib/google';
import { assertBookable, BookingError, isEmail, spokenTime } from '@/lib/booking';
import { sendBookingEmails } from '@/lib/email';
import { sendTelegramMessage } from '@/lib/telegram';
import { verifyToolSecret } from '@/lib/toolAuth';

// Voice agent tool. Safe to call twice: a retry for the same person and start time returns the
// booking that already exists. The slot is re-checked here, whatever was offered earlier.
export async function POST(req: NextRequest) {
  if (!verifyToolSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const reason = typeof body?.reason === 'string' ? body.reason.trim() : undefined;
  const { startTime, endTime } = body ?? {};

  if (!name) return NextResponse.json({ error: 'Ask for the caller’s name before booking.' }, { status: 400 });
  if (!isEmail(email)) {
    return NextResponse.json({ error: 'That email address doesn’t look valid. Ask the caller to spell it.' }, { status: 400 });
  }

  try {
    const existing =
      typeof startTime === 'string' && typeof endTime === 'string'
        ? await findBookingForAttendee(startTime, endTime, email)
        : undefined;
    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyBooked: true,
        when: spokenTime(Date.parse(startTime)),
        meetLink: existing.hangoutLink ?? null,
        eventId: existing.id,
      });
    }

    const { start } = await assertBookable(startTime, endTime);
    const event = await createCalendarEvent({ name, email, startTime, endTime, reason });
    const meetLink = event.hangoutLink ?? undefined;

    // The event exists now. Notifications are best-effort: a failed email or Telegram ping
    // must not turn a successful booking into an error the caller hears.
    const notices = await Promise.allSettled([
      sendBookingEmails({ name, email, startTime, meetLink, reason }),
      sendTelegramMessage(
        ['New meeting booked', `${name} (${email})`, spokenTime(start), reason ? `Reason: ${reason}` : null, meetLink ?? null]
          .filter(Boolean)
          .join('\n')
      ),
    ]);
    for (const n of notices) if (n.status === 'rejected') console.error('booking notification failed', n.reason);

    return NextResponse.json({
      success: true,
      when: spokenTime(start),
      meetLink: meetLink ?? null,
      eventId: event.id,
      message: 'Booked. Google Calendar has emailed the invite with the meeting link.',
    });
  } catch (err) {
    if (err instanceof BookingError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('book-meeting failed', err);
    return NextResponse.json(
      { error: 'Could not book right now. Suggest emailing bekretsionseyoum4@gmail.com instead.' },
      { status: 500 }
    );
  }
}
