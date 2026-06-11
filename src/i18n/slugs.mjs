/**
 * EN -> FR slug map. Single source of truth for locale slug pairs, shared by
 * `src/i18n/utils.ts` (language switcher, hreflang) and `astro.config.mjs`
 * (sitemap serialize hook). Kept as .mjs so the Astro config can import it.
 *
 * Keys are canonical English paths (no locale prefix). Values are the native
 * French slug WITHOUT the /fr prefix. Every FR page must read in French:
 * no English slugs under /fr/ (CLAUDE.md translation rules).
 *
 * Slug form: lowercase, hyphen-separated, diacritics stripped for URL safety
 * (page content keeps accents, only the slug strips them).
 */
export const frSlugMap = /** @type {Record<string, string>} */ ({
  // Add pairs as FR pages ship, e.g.:
  // '/about': '/qui-nous-sommes',
  // '/contact': '/nous-contacter',
  // '/thank-you': '/merci',
  // '/privacy-policy': '/politique-de-confidentialite',
});

/** Reverse map: native FR slug -> canonical EN path. */
export const frReverseSlugMap = Object.fromEntries(
  Object.entries(frSlugMap).map(([en, fr]) => [fr, en])
);
