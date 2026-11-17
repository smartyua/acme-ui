/**
 * Embed mode for kylypko.com, mirroring `shacdn`'s `src/embed.ts`.
 *
 * kylypko.com serves this SPA at `/:lang/acme-ui/*` (assets at `/acme-ui-assets/`,
 * set via `ACME_BASE` at build time). Standalone (localhost / own domain) the
 * router keeps its root basename.
 */
export const EMBED_LANGS = ['en', 'ua', 'de', 'pl', 'ru'] as const;

export type EmbedLang = (typeof EMBED_LANGS)[number];

/** URL segment the host site mounts the app under. */
export const EMBED_SEGMENT = 'acme-ui';

const EMBED_PATH_RE = new RegExp(`^/(${EMBED_LANGS.join('|')})/${EMBED_SEGMENT}(?=/|$)`);

export type EmbedContext = {
  /** React Router basename, e.g. `/en/acme-ui` */
  basename: string;
  /** Language segment from the URL */
  lang: EmbedLang;
};

/** Returns the embed routing context when hosted under `/:lang/acme-ui/*`, otherwise null. */
export const getEmbedContext = (
  pathname: string = typeof window !== 'undefined' ? window.location.pathname : '',
): EmbedContext | null => {
  const match = pathname.match(EMBED_PATH_RE);
  if (!match) return null;
  const lang = match[1] as EmbedLang;
  return { basename: `/${lang}/${EMBED_SEGMENT}`, lang };
};

/**
 * Document-title suffix: `Overview · Acme` standalone, `Overview · Acme UI ·
 * KYLYPKO.COM` on kylypko.com so the rendered title Google indexes still names
 * the host site (the server-injected SEO title is replaced once React mounts).
 */
export const getTitleSuffix = (
  pathname: string = typeof window !== 'undefined' ? window.location.pathname : '',
): string => (getEmbedContext(pathname) ? 'Acme UI · KYLYPKO.COM' : 'Acme');

/** Host site home when embedded, e.g. `/en/` — null in standalone mode. */
export const getHostHomeUrl = (
  pathname: string = typeof window !== 'undefined' ? window.location.pathname : '',
): string | null => {
  const embed = getEmbedContext(pathname);
  return embed ? `/${embed.lang}/` : null;
};
