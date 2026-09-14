import { TOPIC_LABEL, type Lead, type LeadTopic } from './lead';
import { NAME } from './site';

// The two emails a lead produces. The visitor's reads as a personal note from Bekretsion and
// uses only fixed, reviewed wording; the AI's summary goes to Bekretsion alone.

/** What the visitor reached out about, in Bekretsion's voice. Hiring has its own opening. */
const TOPIC_PHRASE: Record<Exclude<LeadTopic, 'hiring'>, string> = {
  backend: 'the backend work for your product',
  full_stack: 'building your web product',
  ai_receptionist: 'an AI receptionist for your business',
  automation: 'automating your business workflows',
  other: 'your project',
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

function toHtml(paragraphs: string[], signature: string[]): string {
  const p = (text: string) => `<p style="margin:0 0 16px">${escapeHtml(text)}</p>`;
  return [
    '<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1f1d1a;max-width:560px">',
    ...paragraphs.map(p),
    `<p style="margin:24px 0 0">${signature.map(escapeHtml).join('<br>')}</p>`,
    '</div>',
  ].join('');
}

export function visitorEmail(lead: Lead) {
  const first = firstName(lead.name);
  const opening =
    lead.topic === 'hiring'
      ? `Thank you for reaching out through my website about ${
          lead.company ? `the opportunity at ${lead.company}` : 'the opportunity on your team'
        }. I appreciate you thinking of me, and I’d be glad to learn more.`
      : `Thank you for reaching out through my website about ${TOPIC_PHRASE[lead.topic]}. It’s the kind of work I enjoy most, and I’d be glad to talk it through with you.`;

  const paragraphs = [
    `Hi ${first},`,
    opening,
    'Could you reply with two or three times that suit you over the next few days? I’m based in Addis Ababa (UTC+3) and happy to work around your time zone. A 20–30 minute call is usually enough to understand what you need and how I can help.',
    'Looking forward to speaking with you.',
  ];
  const signature = ['Warm regards,', NAME, 'Software Engineer · Addis Ababa, Ethiopia', 'bekretsion.com · linkedin.com/in/bekretsion-seyoum'];

  return {
    subject: `Great to hear from you, ${first}`,
    text: [...paragraphs, signature.join('\n')].join('\n\n'),
    html: toHtml(paragraphs, signature),
  };
}

export function leadEmail(lead: Lead, sentAt: Date) {
  const when = sentAt.toLocaleString('en-GB', {
    timeZone: 'Africa/Addis_Ababa',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  const who = [lead.name, lead.email, lead.company, lead.role].filter(Boolean).join(' · ');
  const lines = [
    who,
    `Topic: ${TOPIC_LABEL[lead.topic]}`,
    `Timeline: ${lead.timeline || 'not mentioned'}`,
    `Budget: ${lead.budget || 'not mentioned'}`,
    '',
    'What they want:',
    lead.summary || '(no summary)',
    '',
    `They were sent “Great to hear from you” asking for times, at ${when} Addis Ababa time.`,
    'Reply to this email to answer them directly.',
    '',
    `Conversation ID: ${lead.conversationId} (full transcript in your ElevenLabs conversation history)`,
  ];
  return {
    subject: `New lead: ${lead.name}${lead.company ? ` (${lead.company})` : ''} about ${TOPIC_LABEL[lead.topic].toLowerCase()}`,
    text: lines.join('\n'),
  };
}
