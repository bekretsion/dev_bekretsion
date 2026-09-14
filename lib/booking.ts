import { getFreeBusy } from './google';

// Booking rules for the voice agent's calendar tools. All times are Addis Ababa time, which
// has no daylight saving, so a fixed +03:00 offset is exact all year.
export const BOOKING_TIMEZONE = 'Africa/Addis_Ababa';
const OFFSET = '+03:00';
const OFFSET_MINUTES = 180;

export const MEETING_MINUTES = 30;
const DAY_START_MINUTES = 9 * 60; // first slot starts 09:00
const DAY_END_MINUTES = 18 * 60; // last slot ends by 18:00
const WORK_DAYS = new Set([1, 2, 3, 4, 5]); // Monday–Friday
const MIN_NOTICE_MINUTES = 120; // nothing bookable in the next two hours
const MAX_RANGE_DAYS = 14;
const MAX_SLOTS = 12;
const MAX_SLOTS_PER_DAY = 4; // spread the offer over several days
const MAX_MEETING_MINUTES = 120;

const MINUTE = 60_000;

/** Thrown for anything the agent should read back to the caller; `status` becomes the HTTP code. */
export class BookingError extends Error {
  constructor(
    message: string,
    public status = 400
  ) {
    super(message);
  }
}

/** RFC 3339 with seconds, in Addis time: 2026-09-15T14:00:00+03:00. */
export function toAddisIso(ms: number): string {
  return new Date(ms + OFFSET_MINUTES * MINUTE).toISOString().slice(0, 19) + OFFSET;
}

function spoken(ms: number): string {
  return new Date(ms).toLocaleString('en-GB', {
    timeZone: BOOKING_TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** Addis wall-clock parts for an instant: day of week, minutes since midnight, and a date key. */
function addisWallClock(ms: number) {
  const shifted = new Date(ms + OFFSET_MINUTES * MINUTE);
  return {
    weekday: shifted.getUTCDay(),
    minutes: shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
    dateKey: shifted.toISOString().slice(0, 10),
  };
}

function withinWorkingHours(startMs: number, endMs: number): boolean {
  const start = addisWallClock(startMs);
  const end = addisWallClock(endMs);
  return (
    WORK_DAYS.has(start.weekday) &&
    start.dateKey === end.dateKey &&
    start.minutes >= DAY_START_MINUTES &&
    end.minutes <= DAY_END_MINUTES
  );
}

async function busyRanges(fromMs: number, toMs: number): Promise<[number, number][]> {
  const busy = await getFreeBusy(new Date(fromMs).toISOString(), new Date(toMs).toISOString());
  return busy
    .map((b): [number, number] => [Date.parse(b.start ?? ''), Date.parse(b.end ?? '')])
    .filter(([s, e]) => !Number.isNaN(s) && !Number.isNaN(e));
}

function parseInstant(value: unknown, field: string): number {
  const ms = typeof value === 'string' ? Date.parse(value) : NaN;
  if (Number.isNaN(ms)) {
    throw new BookingError(`${field} must be an ISO 8601 date-time with an offset, like 2026-09-15T14:00:00+03:00.`);
  }
  return ms;
}

/**
 * Free meeting slots between timeMin and timeMax, already filtered for working hours, notice
 * and existing events — so the agent offers slots instead of doing date arithmetic itself.
 */
export async function findFreeSlots(timeMin: unknown, timeMax: unknown) {
  const earliest = Date.now() + MIN_NOTICE_MINUTES * MINUTE;
  const from = Math.max(parseInstant(timeMin, 'timeMin'), earliest);
  const to = Math.min(parseInstant(timeMax, 'timeMax'), from + MAX_RANGE_DAYS * 24 * 60 * MINUTE);
  const step = MEETING_MINUTES * MINUTE;
  const slots: { start: string; end: string; spoken: string }[] = [];
  if (to - from < step) return { timezone: BOOKING_TIMEZONE, meetingMinutes: MEETING_MINUTES, slots };

  const busy = await busyRanges(from, to);
  const perDay = new Map<string, number>();
  // Addis is a whole-hour offset from UTC, so UTC half-hour boundaries are local :00 and :30.
  for (let t = Math.ceil(from / step) * step; t + step <= to && slots.length < MAX_SLOTS; t += step) {
    const end = t + step;
    if (!withinWorkingHours(t, end)) continue;
    if (busy.some(([s, e]) => t < e && end > s)) continue;
    const day = addisWallClock(t).dateKey;
    if ((perDay.get(day) ?? 0) >= MAX_SLOTS_PER_DAY) continue;
    perDay.set(day, (perDay.get(day) ?? 0) + 1);
    slots.push({ start: toAddisIso(t), end: toAddisIso(end), spoken: spoken(t) });
  }
  return { timezone: BOOKING_TIMEZONE, meetingMinutes: MEETING_MINUTES, slots };
}

/** Rejects a booking the calendar can't honour. Runs again at booking time, whatever was offered earlier. */
export async function assertBookable(startTime: unknown, endTime: unknown) {
  const start = parseInstant(startTime, 'startTime');
  const end = parseInstant(endTime, 'endTime');
  if (end <= start) throw new BookingError('endTime must be after startTime.');
  if (end - start > MAX_MEETING_MINUTES * MINUTE) throw new BookingError('Meetings can be at most two hours.');
  if (start < Date.now() + MIN_NOTICE_MINUTES * MINUTE) {
    throw new BookingError('That time has passed or is too soon. Check availability and offer another slot.');
  }
  if (!withinWorkingHours(start, end)) {
    throw new BookingError('That time is outside booking hours (Monday to Friday, 09:00–18:00 Addis Ababa time).');
  }
  const busy = await busyRanges(start, end);
  if (busy.some(([s, e]) => start < e && end > s)) {
    throw new BookingError('That time was just taken. Check availability again and offer another slot.', 409);
  }
  return { start, end };
}

export function isEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export { spoken as spokenTime };
