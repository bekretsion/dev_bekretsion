// Canonical host. Vercel makes www the canonical address and 308-redirects the apex to it,
// so every absolute URL search engines see must use www too.
export const SITE = 'https://www.bekretsion.com';

// Stable JSON-LD node ids, so every page points at the same person and site entities.
export const PERSON_ID = `${SITE}/#person`;
export const WEBSITE_ID = `${SITE}/#website`;

export const NAME = 'Bekretsion Seyoum';
export const SITE_TITLE = 'Bekretsion Seyoum (Bekre) — Software Engineer & Automation, Ethiopia';
export const SITE_DESCRIPTION =
  'Bekretsion Seyoum (Bekre): software engineer in Addis Ababa, Ethiopia. Real-time backends, voice AI receptionists and business automation. Open to remote work.';
export const EMAIL = 'bekretsionseyoum4@gmail.com';

export const PROFILES = {
  linkedin: 'https://www.linkedin.com/in/bekretsion-seyoum',
  github: 'https://github.com/bekretsion',
  youtube: 'https://www.youtube.com/@bekretsion',
};

/** "2026-09-14" → "14 September 2026". Pinned to UTC so the server's timezone can't shift the day. */
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
