/**
 * Translation dictionary for shared UI (Header, Footer, Layout defaults).
 *
 * Page-level content (hero copy, section bodies, etc.) lives inside each
 * locale's `src/pages/<locale>/*.astro` file so editorial work stays
 * page-adjacent instead of being scattered across one giant JSON.
 *
 * Rules when extending:
 *  - English is the source of truth for the key names.
 *  - Every other locale must define the same keys.
 *  - Run the project translation rules for any non-English value.
 */

export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeLabels: Record<Locale, string> = {
  en: 'EN',
  fr: 'FR',
};

export const localeNamesNative: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
};

export const ui = {
  en: {
    // Layout / meta
    'site.title': 'BearingBridge AI',
    'site.description': 'BearingBridge AI.',
    'skipLink': 'Skip to content',

    // Header / nav
    'nav.aria.primary': 'Primary',
    'nav.home': 'Home',
    'nav.contact': 'Contact',
    'nav.menu': 'Menu',

    // Language switcher
    'lang.switch': 'Change language',

    // Footer
    'footer.rights': 'All rights reserved.',
  },
  fr: {
    // Layout / meta
    'site.title': 'BearingBridge AI',
    'site.description': 'BearingBridge AI.',
    'skipLink': 'Aller au contenu',

    // Header / nav
    'nav.aria.primary': 'Navigation principale',
    'nav.home': 'Accueil',
    'nav.contact': 'Contact',
    'nav.menu': 'Menu',

    // Language switcher
    'lang.switch': 'Changer de langue',

    // Footer
    'footer.rights': 'Tous droits réservés.',
  },
} as const;

export type TranslationKey = keyof (typeof ui)[typeof defaultLocale];
