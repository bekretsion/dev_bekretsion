import { Resend } from 'resend';

export interface BookingEmailDetails {
  name: string;
  email: string;
  startTime: string;
  meetLink?: string;
  reason?: string;
}

export async function sendBookingEmails(details: BookingEmailDetails): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('Resend not configured — skipping email.');
    return;
  }
  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  const notifyEmail = process.env.NOTIFY_EMAIL;

  const when = new Date(details.startTime).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  await resend.emails.send({
    from,
    to: details.email,
    subject: 'Your meeting is booked',
    text: [
      `Hi ${details.name},`,
      '',
      `Your meeting is confirmed for ${when}.`,
      details.meetLink ? `Join link: ${details.meetLink}` : null,
      '',
      'See you then!',
    ]
      .filter(Boolean)
      .join('\n'),
  });

  if (notifyEmail) {
    await resend.emails.send({
      from,
      to: notifyEmail,
      subject: `New meeting booked: ${details.name}`,
      text: [
        `${details.name} (${details.email}) booked a meeting for ${when}.`,
        details.reason ? `Reason: ${details.reason}` : null,
        details.meetLink ? `Meet link: ${details.meetLink}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
    });
  }
}
