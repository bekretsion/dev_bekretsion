import type { NextRequest } from 'next/server';

/**
 * Server tools configured in the ElevenLabs agent must send this secret back
 * as an `x-tool-secret` header (set as a custom header on the tool in the
 * ElevenLabs dashboard). Fails closed: an unset AGENT_TOOL_SECRET denies
 * every request rather than silently allowing unauthenticated bookings.
 */
export function verifyToolSecret(req: NextRequest): boolean {
  const secret = process.env.AGENT_TOOL_SECRET;
  if (!secret) return false;
  return req.headers.get('x-tool-secret') === secret;
}
