import { caseStudies } from '@/lib/case-studies';
import { services } from '@/lib/services';
import { EMAIL, NAME, PROFILES, SITE } from '@/lib/site';

// /llms.txt: a plain-Markdown map of the site for AI assistants and coding agents. It doesn't
// affect Google rankings; it's built from the same data as the pages so it can't drift.
export const dynamic = 'force-static';

export function GET() {
  const lines = [
    `# ${NAME}`,
    '',
    '> Software engineer in Addis Ababa, Ethiopia, also known as Bekre. Builds real-time backends, AI voice receptionists that speak Amharic, Afaan Oromo, Tigrinya and 90+ other languages, and business automation with n8n. Open to remote work.',
    '',
    `- Website: ${SITE}`,
    `- Email: ${EMAIL}`,
    `- GitHub: ${PROFILES.github}`,
    `- LinkedIn: ${PROFILES.linkedin}`,
    `- YouTube: ${PROFILES.youtube}`,
    '',
    '## Services',
    ...services.map((s) => `- [${s.name}](${SITE}/${s.slug}): ${s.description}`),
    '',
    '## Case studies',
    ...caseStudies.map((c) => `- [${c.title}](${SITE}/projects/${c.slug}): ${c.description}`),
    '',
    '## Background',
    '- National finalist, ALX Ethiopia × Kuriftu Hospitality Hackathon 2026',
    '- Internship at the Space Science and Geospatial Institute (SSGI), Ethiopia: forecasting geomagnetic storms with a CNN-LSTM',
    '- BSc Computer Science (in progress), Hope Enterprise University College',
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
