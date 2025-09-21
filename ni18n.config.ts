import path from 'path';

const supportedLngs = ['da', 'de', 'el', 'en', 'es', 'fr', 'hu', 'it', 'ja', 'pl', 'pt', 'ru', 'sv', 'tr', 'zh', 'ae'];

const ni18nConfig = {
    fallbackLng: 'en',
    supportedLngs,
    ns: ['translation'],
    react: { useSuspense: false },
    backend: {
        // Use a relative path that works for both SSR and client-side
        loadPath: '/public/locales/{{lng}}.json',
    },
    detection: {
        // Ensure proper SSR detection
        order: ['cookie', 'header'],
        caches: ['cookie'],
        lookupCookie: 'i18nextLng',
        lookupHeader: 'accept-language'
    }
};

export default ni18nConfig;