/** Copy with inline links, kept as data: plain strings plus { text, href } link segments. */
export type Rich = (string | { text: string; href: string })[];

/** The same copy without markup, for structured data and llms.txt. */
export function plainText(value: Rich): string {
  return value.map((part) => (typeof part === 'string' ? part : part.text)).join('');
}
