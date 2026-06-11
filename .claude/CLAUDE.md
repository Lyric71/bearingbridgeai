# BearingBridge AI — project rules

Site: https://bearingbridge.ai — Astro 6 static site, Tailwind CSS 4, deployed
on Vercel. TypeScript strict.

## 1. Languages

The site is multilingual: **English and French only** for now. English ships
first and lives at the URL root (`/`). French lives under `/fr/` with native
French slugs. Add locales to `astro.config.mjs` `i18n.locales`,
`src/i18n/ui.ts`, and `src/i18n/slugs.mjs` as they ship.

## 2. Testing

- Run `npm run build` before committing to catch build errors.
- Run `npx astro check` for TypeScript validation.
- Verify responsive at 375px, 768px, 1280px (use `.shot.mjs` for screenshots).

## 3. Git conventions

- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `style:`.
- Branch naming: `feature/description`, `fix/description`.
- Always run build before pushing.
- Run `npm run hooks:install` once per clone to install the pre-commit hook.

## 4. Performance / deployment

- Self-host everything. No external CDN dependencies.
- Self-host fonts as woff2 in `/public/fonts`.
- Canonical host is the apex: `https://bearingbridge.ai` (no www).
- `trailingSlash: 'never'` — never link with trailing slashes.

## 5. Image optimization (enforced by pre-commit hook)

Every raster image (`.jpg`, `.jpeg`, `.png`, `.webp`) added under
`public/Images/` must be optimized before it ships. SVG and AVIF are exempt.

- `npm run img:batch` — in-place batch optimizer.
- Targets: heroes max 2000px wide / under ~600 KB, inline 1600px / under
  ~250 KB, thumbnails under ~80 KB.

## 6. Translation rules (MANDATORY)

The single source of truth for any non-English work. Output must read like a
native journalist in the target language wrote it originally, not like a
translated English page.

**When the rule fires:** any time you edit, draft, translate, or fix content in
`src/pages/fr/`, any non-English string in `src/i18n/`, or any non-English alt
text, meta description, OpenGraph copy, slug label, button label, form label,
error message, microcopy, blog post, email, or caption. It does NOT fire for
code, identifiers, file paths, console logs, code comments, commit messages,
or PR descriptions.

### Core principles

1. **Native translation, not literal translation.** Write as a native speaker
   would naturally express the idea. Adapt idioms and cultural references.
   Prioritize natural flow over word-for-word fidelity. Match register to the
   audience. Use locale-specific conventions for dates, currency, units,
   punctuation, quotation marks, number formatting.
2. **Improve the existing locale page, do NOT retranslate from English.**
   Start from the current target-language page. Treat the existing translation
   as the baseline; preserve what works. Only modify sections that are
   awkward, outdated, inaccurate, or missing. Never regenerate the full page
   from English: that destroys prior editorial work. If the English source has
   new content missing in the target page, add ONLY the missing parts and
   translate them natively, keeping the rest untouched. The existing locale
   page is editorial state, not draft state.
3. **Native journalistic register.** For French, target the register of
   Le Monde / Les Echos, not literal Anglo-translation.

### Workflow per edit (mandatory order)

1. Open the existing target-language page first. Read it in full.
2. Compare against the English source ONLY to identify gaps or outdated parts.
3. Per section: reads naturally and accurate — leave it. Reads awkward or
   machine-translated — rewrite natively. Missing — translate natively.
4. Preserve existing terminology unless clearly wrong. Consistency beats
   personal preference.
5. Keep page structure intact (headings, anchors, IDs, frontmatter, metadata,
   slugs, ARIA labels, schema markup) unless explicitly asked to change it.
6. Do not change SEO-sensitive elements (title, meta description, H1, slugs)
   without flagging it first.

### Two-step rewrite for any new or rewritten section

- *Step 1 — Humanized translation.* Translate from English, hit the native
  journalistic register, apply locale conventions. Apply `HUMANIZER.md`.
- *Step 2 — Native rewrite (mandatory, even when Step 1 looks fine).* Treat
  Step 1's output as a draft that is not native enough. Do NOT look back at
  the English source. Work only from the target-language draft. Restructure
  sentences, switch idioms to native equivalents, swap weak verbs for strong
  native ones, drop English-shaped clauses and noun chains, replace nominal
  constructions with verbal ones where French prefers verbs, use the
  language's natural rhythm and connectors, vary sentence length the way a
  native journalist would.

### Diacritics (never optional)

Never ship unaccented copy. FR: `é è ê à â ç ù û ü ô î ï ÿ`; capitals keep
accents.

### Punctuation

FR uses guillemets `« »` with non-breaking spaces, and a non-breaking space
before `: ; ! ?`. French is metropolitan French.

### Brand and product names

Names conventionally kept in English in the target market stay in their
canonical English form. Do not translate them, do not invent localized
versions, do not retitle-case them.

### Single-locale default — no auto-translate

When the user requests a content change, edit ONLY the file(s) they
referenced. Do not propagate the same change to other locales until the user
explicitly says so (e.g. "translate this", "do all locales", "propagate").
When editing the English version, end with a one-line offer to propagate.
Shared infrastructure changes (CSS, shared components, route helpers, layout
files, `astro.config.mjs`) are global by nature and exempt from this.

### Slug localisation (permanent)

Every page slug under `/fr/` must be in French. No English slugs under `/fr/`.
Form: lowercase, hyphen-separated, no spaces or underscores. Strip diacritics
for URL safety (`réalisations` → `realisations`); the page CONTENT keeps
accents, only the slug strips them. `localizePath` and any hreflang
`<link rel="alternate">` must map between native slugs via
`src/i18n/slugs.mjs`, never blindly prefix `/fr/` onto the English path. When
editing a French page already shipped with an English slug, do NOT silently
rename it: flag the mismatch and propose a redirect from old slug to new.

## 7. i18n architecture

- `src/i18n/ui.ts` — shared chrome strings (header, footer, meta) per locale.
  English is the source of truth for key names; every locale defines the same
  keys. Page-level content stays inside each locale's `.astro` file.
- `src/i18n/slugs.mjs` — EN↔FR slug map, shared by `utils.ts` and
  `astro.config.mjs` (sitemap hreflang hook). Update it whenever an FR page
  ships.
- `src/i18n/utils.ts` — `getLocaleFromUrl`, `stripLocale`, `localizePath`,
  `useTranslations`. Do not fork this logic per page.

## 8. SEO

- Sitemap emits locale-pair `xhtml:link` hreflang alternates plus `x-default`
  via the serialize hook in `astro.config.mjs`.
- Non-indexable routes (thank-you pages, API routes) are excluded via the
  sitemap `filter`.
- `public/llms-full.txt` is regenerated on every build (`prebuild`) from
  `src/content/insights` once that collection exists.
- After a deploy with new/changed pages: `npm run indexnow`.
- Redirects: 301 for permanent moves, never chain, never remove after
  recrawl. Build maps programmatically in `astro.config.mjs`.
