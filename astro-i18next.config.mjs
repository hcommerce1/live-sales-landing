/** @type {import('astro-i18next').AstroI18nextConfig} */
export default {
  defaultLocale: 'pl',
  locales: ['pl', 'en'],
  i18nextServer: {
    debug: false,
  },
  i18nextServerPlugins: {
    '{initReactI18next}': 'react-i18next',
  },
};
