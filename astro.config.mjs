// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import { frSlugMap, frReverseSlugMap } from './src/i18n/slugs.mjs';

const SITE = 'https://bearingbridge.ai';

/**
 * Reduce a built page path to its canonical English equivalent.
 * Returns `null` for paths with no resolvable canonical (e.g. an orphan FR
 * page with no EN twin), so the sitemap hook can skip them.
 */
const canonicalize = (/** @type {string} */ path) => {
  if (!path || path === '/' || path === '') return '/';
  if (path.startsWith('/fr')) {
    if (path === '/fr') return '/';
    const stripped = path.slice('/fr'.length);
    return frReverseSlugMap[stripped] ?? null;
  }
  return path;
};

/** Forward map an EN path to its FR twin, or null if none exists. */
const enToFr = (/** @type {string | null} */ enPath) => {
  if (!enPath) return null;
  if (enPath === '/') return '/fr';
  const frSlug = frSlugMap[enPath];
  return frSlug ? `/fr${frSlug}` : null;
};

// https://astro.build/config
export default defineConfig({
  site: SITE,
  // 'never' makes Vercel strip trailing slashes from incoming requests before
  // applying redirect rules, so path-level 301s always match.
  trailingSlash: 'never',

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: vercel(),

  integrations: [
    sitemap({
      // Drop non-indexable routes so they cannot enter the index.
      filter: (page) =>
        !page.includes('/thank-you') &&
        !page.includes('/fr/merci') &&
        !page.includes('/api/'),
      changefreq: 'weekly',
      priority: 0.7,
      // Rewrite each URL into the locale pair the slug map actually dictates.
      // @astrojs/sitemap's built-in i18n option only handles simple prefix
      // routing (e.g. /about -> /fr/about), which is wrong here: /about pairs
      // with /fr/qui-nous-sommes, etc. The hook resolves both halves of the
      // pair via the shared slug map in src/i18n/slugs.mjs.
      serialize: (item) => {
        const url = new URL(item.url);
        const path = url.pathname === '/' ? '/' : url.pathname.replace(/\/$/, '');
        const enPath = canonicalize(path);
        if (!enPath) return item;
        const frPath = enToFr(enPath);
        // Match the canonical URL convention from the layout: no trailing
        // slash except root. The sitemap <loc> and xhtml:link href must agree
        // so Google does not see them as different URLs.
        const enHref = SITE + (enPath === '/' ? '' : enPath);
        const frHref = frPath ? SITE + frPath : null;
        const links = [{ lang: 'en', url: enHref }];
        if (frHref) links.push({ lang: 'fr', url: frHref });
        links.push({ lang: 'x-default', url: enHref });
        const currentLocaleHref = path.startsWith('/fr') ? (frHref ?? enHref) : enHref;
        return { ...item, url: currentLocaleHref, links };
      },
    }),
    // Runs AFTER @astrojs/sitemap on build:done and strips the trailing slash
    // that the sitemap library appends to xhtml:link hreflang hrefs for the
    // site root, so the alternates match the <loc> convention.
    {
      name: 'bba-sitemap-postprocess',
      hooks: {
        'astro:build:done': async ({ dir, logger }) => {
          const { readFile, writeFile, readdir } = await import('node:fs/promises');
          const { fileURLToPath } = await import('node:url');
          const path = await import('node:path');
          const root = fileURLToPath(dir);
          let files;
          try {
            files = (await readdir(root)).filter((f) => /^sitemap-\d+\.xml$/.test(f));
          } catch {
            return;
          }
          for (const f of files) {
            const filePath = path.join(root, f);
            const xml = await readFile(filePath, 'utf8');
            const fixed = xml.replace(
              /(<xhtml:link rel="alternate" hreflang="[^"]+" href="https:\/\/bearingbridge\.ai)\/(")/g,
              '$1$2',
            );
            if (fixed !== xml) {
              await writeFile(filePath, fixed);
              logger.info(`normalised root xhtml:link in ${f}`);
            }
          }
        },
      },
    },
  ],

  // Multilingual setup: English at the root (/), French under /fr/.
  // English ships first; FR pages are added with native French slugs as they
  // are written. Add new locales to the array as they ship. Keep
  // `prefixDefaultLocale: false` so English URLs stay at the root.
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
