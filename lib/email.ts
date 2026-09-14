// Sends through Resend's REST API. Every send carries an idempotency key, so a repeated request
// for the same conversation never delivers the same email twice (Resend keeps keys for 24 hours).

export class EmailNotConfiguredError extends Error {}

export async function sendEmail(message: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  idempotencyKey: string;
}): Promise<{ duplicate: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new EmailNotConfiguredError('RESEND_API_KEY or RESEND_FROM_EMAIL is not set.');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': message.idempotencyKey,
    },
    body: JSON.stringify({
      from,
      to: [message.to],
      subject: message.subject,
      text: message.text,
      ...(message.html ? { html: message.html } : {}),
      ...(message.replyTo ? { reply_to: message.replyTo } : {}),
    }),
  });

  // Same key with a different payload: this conversation already sent its email.
  if (res.status === 409) return { duplicate: true };
  if (!res.ok) throw new Error(`Resend responded ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return { duplicate: false };
}
