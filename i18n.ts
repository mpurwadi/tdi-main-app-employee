import Cookies from 'universal-cookie';

import en from '@/public/locales/en.json';
import ae from '@/public/locales/ae.json';
import da from '@/public/locales/da.json';
import de from '@/public/locales/de.json';
import el from '@/public/locales/el.json';
import es from '@/public/locales/es.json';
import fr from '@/public/locales/fr.json';
import hu from '@/public/locales/hu.json';
import it from '@/public/locales/it.json';
import ja from '@/public/locales/ja.json';
import pl from '@/public/locales/pl.json';
import pt from '@/public/locales/pt.json';
import ru from '@/public/locales/ru.json';
import sv from '@/public/locales/sv.json';
import tr from '@/public/locales/tr.json';
import zh from '@/public/locales/zh.json';

const langObj: any = { en, ae, da, de, el, es, fr, hu, it, ja, pl, pt, ru, sv, tr, zh };

const getLang = (localeFromServer?: string) => {
    let lang = 'en'; // Default to 'en' to prevent undefined
    
    // Guard against undefined or invalid localeFromServer
    if (!localeFromServer || typeof localeFromServer !== 'string') {
        localeFromServer = 'en';
    }
    
    if (typeof window !== 'undefined') {
        try {
            const cookies = new Cookies();
            lang = cookies.get('i18nextLng') || localeFromServer || 'en';
        } catch (e) {
            // If cookies fail, default to 'en'
            lang = localeFromServer || 'en';
        }
    } else {
        // For server-side, use the provided locale or default to 'en'
        lang = localeFromServer || 'en';
    }
    
    // Ensure we always return a valid language
    return lang && langObj[lang] ? lang : 'en';
};

/**
 * Safely get translation with proper error handling for SSR
 * @param locale - Locale string
 * @returns Translation object with t function, i18n object, and initLocale function
 */
export const getTranslation = (locale?: string) => {
    try {
        // Ensure we always have a valid locale
        if (!locale || typeof locale !== 'string') {
            // During SSR, we can't access cookies, so default to 'en'
            locale = 'en';
        }
        
        // Double-check that we have a valid locale
        if (!locale || typeof locale !== 'string') {
            locale = 'en';
        }
        
        const lang = getLang(locale);
        const data: any = (langObj[lang] || langObj['en']) ?? {};
        
        // Guard against missing translation data
        if (!data || typeof data !== 'object') {
            throw new Error('Translation data missing');
        }

        const t = (key: string) => {
            // Guard against undefined key
            if (!key || typeof key !== 'string') return '';
            
            // Return translation or key itself as fallback
            return data[key] !== undefined ? data[key] : key;
        };

        const initLocale = (themeLocale: string) => {
            // Validate themeLocale before using
            if (themeLocale && typeof themeLocale === 'string') {
                // We can't set cookies during SSR, only during client-side
                if (typeof window !== 'undefined') {
                    try {
                        const cookies = new Cookies();
                        cookies.set('i18nextLng', themeLocale, { path: '/' });
                    } catch (e) {
                        // Silently fail if cookies can't be set
                        console.warn('Could not set language cookie:', e);
                    }
                }
            }
        };

        const i18n = {
            language: lang || 'en',
            changeLanguage: (newLang: string) => {
                try {
                    // Validate language exists in our supported languages
                    if (newLang && typeof newLang === 'string' && langObj[newLang]) {
                        // We can't set cookies during SSR, only during client-side
                        if (typeof window !== 'undefined') {
                            const cookies = new Cookies();
                            cookies.set('i18nextLng', newLang, { path: '/' });
                        }
                    }
                } catch (e) {
                    // Silently fail if cookies can't be set
                    console.warn('Could not set language cookie:', e);
                }
            },
        };

        return { t, i18n, initLocale };
    } catch (e) {
        // Return a safe fallback if anything goes wrong
        const t = (key: string) => {
            // Guard against undefined key even in fallback
            return key && typeof key === 'string' ? key : '';
        };
        
        const i18n = {
            language: 'en',
            changeLanguage: () => {
                // No-op in error state
            },
        };
        
        const initLocale = () => {
            // No-op in error state
        };
        
        return { t, i18n, initLocale };
    }
};
