import { NextRequest, NextResponse } from 'next/server';
import { BookingError, findFreeSlots } from '@/lib/booking';
import { verifyToolSecret } from '@/lib/toolAuth';

// Voice agent tool. Returns ready-to-offer free slots (Addis Ababa time), not raw busy blocks,
// so the model reads times out instead of computing them.
export async function POST(req: NextRequest) {
  if (!verifyToolSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);

  try {
    const result = await findFreeSlots(body?.timeMin, body?.timeMax);
    return NextResponse.json({
      ...result,
      message: result.slots.length
        ? 'Offer two or three of these slots using their spoken text. To book, pass the exact start and end values.'
        : 'No free slots in that range. Offer to check a later range, or suggest emailing bekretsionseyoum4@gmail.com.',
    });
  } catch (err) {
    if (err instanceof BookingError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('check-availability failed', err);
    return NextResponse.json({ error: 'Could not check the calendar right now.' }, { status: 500 });
  }
}
