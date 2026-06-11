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
    'site.title': 'BearingBridge AI — AI adoption that survives contact with reality',
    'site.description':
      'Senior AI consulting across both ecosystems — East and West. Honest assessment, pilots with kill criteria, production builds, and training your team to run it without us.',
    'skipLink': 'Skip to content',

    // Header / nav
    'nav.aria.primary': 'Primary',
    'nav.home': 'Home',
    'nav.method': 'Method',
    'nav.services': 'Services',
    'nav.expertise': 'Expertise',
    'nav.insights': 'Insights',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.bookCall': 'Book a call',
    'nav.menu': 'Menu',
    'nav.close': 'Close menu',

    // Language switcher
    'lang.switch': 'Change language',

    // Footer
    'footer.rights': 'All rights reserved.',
    'footer.entities': 'Hong Kong · Shanghai',
    'footer.dataNote':
      'Your data never transits to China unless you explicitly choose a China-hosted deployment.',
    'footer.regions': 'North Asia · Southeast Asia · Middle East · Europe',
    'footer.newsletter.title': 'The East-West Briefing',
    'footer.newsletter.sub': 'Monthly. What moved in AI on both sides of the world — and what it means for you.',
    'footer.newsletter.placeholder': 'Work email',
    'footer.newsletter.cta': 'Subscribe',
    'footer.nav': 'Navigate',
    'footer.connect': 'Connect',
  },
  fr: {
    // Layout / meta
    'site.title': 'BearingBridge AI — Une adoption de l’IA qui résiste à l’épreuve du réel',
    'site.description':
      'Conseil senior en IA couvrant les deux écosystèmes, oriental et occidental. Diagnostic sans complaisance, pilotes avec critères d’arrêt, déploiements en production et formation de vos équipes.',
    'skipLink': 'Aller au contenu',

    // Header / nav
    'nav.aria.primary': 'Navigation principale',
    'nav.home': 'Accueil',
    'nav.method': 'Méthode',
    'nav.services': 'Services',
    'nav.expertise': 'Expertises',
    'nav.insights': 'Analyses',
    'nav.about': 'À propos',
    'nav.contact': 'Contact',
    'nav.bookCall': 'Réserver un appel',
    'nav.menu': 'Menu',
    'nav.close': 'Fermer le menu',

    // Language switcher
    'lang.switch': 'Changer de langue',

    // Footer
    'footer.rights': 'Tous droits réservés.',
    'footer.entities': 'Hong Kong · Shanghai',
    'footer.dataNote':
      'Vos données ne transitent jamais par la Chine, sauf si vous optez explicitement pour un hébergement en Chine.',
    'footer.regions': 'Asie du Nord · Asie du Sud-Est · Moyen-Orient · Europe',
    'footer.newsletter.title': 'The East-West Briefing',
    'footer.newsletter.sub': 'Chaque mois, ce qui a bougé dans l’IA des deux côtés du monde — et ce que cela change pour vous.',
    'footer.newsletter.placeholder': 'E-mail professionnel',
    'footer.newsletter.cta': 'S’abonner',
    'footer.nav': 'Navigation',
    'footer.connect': 'Suivez-nous',
  },
} as const;

export type TranslationKey = keyof (typeof ui)[typeof defaultLocale];
