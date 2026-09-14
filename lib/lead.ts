// A lead captured by the voice agent. The agent fills these in during the conversation;
// the site sends them to /api/lead the moment the visitor's email is confirmed.

export const LEAD_TOPICS = ['backend', 'full_stack', 'ai_receptionist', 'automation', 'hiring', 'other'] as const;
export type LeadTopic = (typeof LEAD_TOPICS)[number];

export const TOPIC_LABEL: Record<LeadTopic, string> = {
  backend: 'Backend development',
  full_stack: 'Full-stack development',
  ai_receptionist: 'AI voice receptionist',
  automation: 'Business automation',
  hiring: 'Hiring',
  other: 'Other',
};

export function isLeadTopic(value: unknown): value is LeadTopic {
  return typeof value === 'string' && (LEAD_TOPICS as readonly string[]).includes(value);
}

export interface Lead {
  conversationId: string;
  name: string;
  email: string;
  company?: string;
  role?: string;
  topic: LeadTopic;
  /** For Bekretsion only; never shown to the visitor. */
  summary: string;
  timeline?: string;
  budget?: string;
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
