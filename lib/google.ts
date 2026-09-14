import { google } from 'googleapis';

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function getGoogleAuthUrl(): string {
  return getOAuthClient().generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/calendar'],
  });
}

export async function exchangeCodeForTokens(code: string) {
  const { tokens } = await getOAuthClient().getToken(code);
  return tokens;
}

function getCalendarClient() {
  const client = getOAuthClient();
  client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return google.calendar({ version: 'v3', auth: client });
}

function calendarId(): string {
  return process.env.GOOGLE_CALENDAR_ID || 'primary';
}

export interface BusyPeriod {
  start?: string | null;
  end?: string | null;
}

export async function getFreeBusy(timeMin: string, timeMax: string): Promise<BusyPeriod[]> {
  const calendar = getCalendarClient();
  const id = calendarId();
  const res = await calendar.freebusy.query({
    requestBody: { timeMin, timeMax, items: [{ id }] },
  });
  return res.data.calendars?.[id]?.busy ?? [];
}

export interface BookingDetails {
  name: string;
  email: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

export async function createCalendarEvent(details: BookingDetails) {
  const calendar = getCalendarClient();
  const res = await calendar.events.insert({
    calendarId: calendarId(),
    conferenceDataVersion: 1,
    sendUpdates: 'all',
    requestBody: {
      summary: `Meeting with ${details.name}`,
      description: details.reason || 'Booked via the portfolio site AI assistant.',
      start: { dateTime: details.startTime },
      end: { dateTime: details.endTime },
      attendees: [{ email: details.email }],
      conferenceData: {
        createRequest: {
          requestId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    },
  });
  return res.data;
}

/**
 * The event this attendee already has at exactly this start time, if any. Lets book_meeting
 * return the existing booking when the agent retries a call, instead of creating a duplicate.
 */
export async function findBookingForAttendee(startTime: string, endTime: string, email: string) {
  const calendar = getCalendarClient();
  const start = Date.parse(startTime);
  const res = await calendar.events.list({
    calendarId: calendarId(),
    timeMin: new Date(start).toISOString(),
    timeMax: new Date(Date.parse(endTime)).toISOString(),
    singleEvents: true,
    maxResults: 25,
  });
  const target = email.trim().toLowerCase();
  return (res.data.items ?? []).find(
    (ev) =>
      ev.status !== 'cancelled' &&
      Date.parse(ev.start?.dateTime ?? '') === start &&
      (ev.attendees ?? []).some((a) => a.email?.toLowerCase() === target)
  );
}
