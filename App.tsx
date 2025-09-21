'use client';
import { PropsWithChildren, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { toggleRTL, toggleTheme, toggleMenu, toggleLayout, toggleAnimation, toggleNavbar, toggleSemidark } from '@/store/themeConfigSlice';
import Loading from '@/components/layouts/loading';
import { getTranslation } from '@/i18n';

function App({ children }: PropsWithChildren) {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const dispatch = useDispatch();
    const { initLocale } = getTranslation('en'); // Default to 'en' to prevent undefined
    const [isLoading, setIsLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        
        try {
            // Initialize theme configuration with proper error handling
            const initializeTheme = () => {
                try {
                    // Only access localStorage on client-side
                    if (typeof window !== 'undefined') {
                        dispatch(toggleTheme(localStorage.getItem('theme') || (themeConfig?.theme || 'light')));
                        dispatch(toggleMenu(localStorage.getItem('menu') || (themeConfig?.menu || 'vertical')));
                        dispatch(toggleLayout(localStorage.getItem('layout') || (themeConfig?.layout || 'full')));
                        dispatch(toggleRTL(localStorage.getItem('rtlClass') || (themeConfig?.rtlClass || 'ltr')));
                        dispatch(toggleAnimation(localStorage.getItem('animation') || (themeConfig?.animation || '')));
                        dispatch(toggleNavbar(localStorage.getItem('navbar') || (themeConfig?.navbar || 'navbar-sticky')));
                        dispatch(toggleSemidark(localStorage.getItem('semidark') === 'true' || (themeConfig?.semidark || false)));
                        
                        // locale - ensure we have a valid locale
                        const storedLocale = localStorage.getItem('i18nextLng');
                        const validLocale = storedLocale && ['da', 'de', 'el', 'en', 'es', 'fr', 'hu', 'it', 'ja', 'pl', 'pt', 'ru', 'sv', 'tr', 'zh', 'ae'].includes(storedLocale) 
                            ? storedLocale 
                            : 'en';
                            
                        initLocale(validLocale);
                    } else {
                        // Server-side fallback
                        dispatch(toggleTheme(themeConfig?.theme || 'light'));
                        dispatch(toggleMenu(themeConfig?.menu || 'vertical'));
                        dispatch(toggleLayout(themeConfig?.layout || 'full'));
                        dispatch(toggleRTL(themeConfig?.rtlClass || 'ltr'));
                        dispatch(toggleAnimation(themeConfig?.animation || ''));
                        dispatch(toggleNavbar(themeConfig?.navbar || 'navbar-sticky'));
                        dispatch(toggleSemidark(themeConfig?.semidark || false));
                        initLocale('en');
                    }
                } catch (initError) {
                    // If there's an error during initialization, try with default values
                    console.warn('Error during theme initialization:', initError);
                    dispatch(toggleTheme('light'));
                    dispatch(toggleMenu('vertical'));
                    dispatch(toggleLayout('full'));
                    dispatch(toggleRTL('ltr'));
                    dispatch(toggleAnimation(''));
                    dispatch(toggleNavbar('navbar-sticky'));
                    dispatch(toggleSemidark(false));
                    initLocale('en');
                }
            };
            
            initializeTheme();
        } catch (e) {
            // Silently fail if there are any issues with initialization
            console.warn('Failed to initialize theme config:', e);
            
            // Ensure we still try to initialize with a default locale
            try {
                initLocale('en');
            } catch (fallbackError) {
                console.warn('Failed to initialize with fallback locale:', fallbackError);
            }
        }

        setIsLoading(false);
        // Remove themeConfig dependencies that might be undefined
    }, [dispatch, initLocale]);

    // Safe destructuring of themeConfig with fallbacks
    const safeThemeConfig = {
        sidebar: themeConfig?.sidebar || false,
        menu: themeConfig?.menu || 'vertical',
        layout: themeConfig?.layout || 'full',
        rtlClass: themeConfig?.rtlClass || 'ltr',
        theme: themeConfig?.theme || 'light',
        animation: themeConfig?.animation || '',
        navbar: themeConfig?.navbar || 'navbar-sticky',
        semidark: themeConfig?.semidark || false
    };

    if (!isClient) {
        // Render a minimal version on the server
        return (
            <div
                className={`main-section relative font-nunito text-sm font-normal antialiased`}
            >
                {children}
            </div>
        );
    }

    return (
        <div
            className={`${(safeThemeConfig.sidebar && 'toggle-sidebar') || ''} ${safeThemeConfig.menu} ${safeThemeConfig.layout} ${
                safeThemeConfig.rtlClass
            } main-section relative font-nunito text-sm font-normal antialiased`}
        >
            {isLoading ? <Loading /> : children}
        </div>
    );
}

export default App;