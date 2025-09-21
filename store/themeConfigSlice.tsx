import { createSlice } from '@reduxjs/toolkit';
import themeConfig from '@/theme.config';

// Ensure themeConfig has all required properties with defaults
const safeThemeConfig = {
    theme: themeConfig?.theme || 'light',
    menu: themeConfig?.menu || 'vertical',
    layout: themeConfig?.layout || 'full',
    rtlClass: themeConfig?.rtlClass || 'ltr',
    animation: themeConfig?.animation || '',
    navbar: themeConfig?.navbar || 'navbar-sticky',
    locale: themeConfig?.locale || 'en',
    semidark: themeConfig?.semidark ?? false,
};

const initialState = {
    isDarkMode: false,
    sidebar: false,
    theme: safeThemeConfig.theme,
    menu: safeThemeConfig.menu,
    layout: safeThemeConfig.layout,
    rtlClass: safeThemeConfig.rtlClass,
    animation: safeThemeConfig.animation,
    navbar: safeThemeConfig.navbar,
    locale: safeThemeConfig.locale,
    semidark: safeThemeConfig.semidark,
    languageList: [
        { code: 'zh', name: 'Chinese' },
        { code: 'da', name: 'Danish' },
        { code: 'en', name: 'English' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'el', name: 'Greek' },
        { code: 'hu', name: 'Hungarian' },
        { code: 'it', name: 'Italian' },
        { code: 'ja', name: 'Japanese' },
        { code: 'pl', name: 'Polish' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'ru', name: 'Russian' },
        { code: 'es', name: 'Spanish' },
        { code: 'sv', name: 'Swedish' },
        { code: 'tr', name: 'Turkish' },
        { code: 'ae', name: 'Arabic' },
    ],
};

const themeConfigSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        toggleTheme(state, { payload }) {
            payload = payload || state.theme; // light | dark | system
            
            // Only access localStorage on client-side
            if (typeof window !== 'undefined') {
                localStorage.setItem('theme', payload);
            }
            
            state.theme = payload;
            
            if (payload === 'light') {
                state.isDarkMode = false;
            } else if (payload === 'dark') {
                state.isDarkMode = true;
            } else if (payload === 'system') {
                // Only access window.matchMedia on client-side
                if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    state.isDarkMode = true;
                } else {
                    state.isDarkMode = false;
                }
            }

            // Only manipulate DOM on client-side
            if (typeof window !== 'undefined') {
                if (state.isDarkMode) {
                    document.querySelector('body')?.classList.add('dark');
                } else {
                    document.querySelector('body')?.classList.remove('dark');
                }
            }
        },
        toggleMenu(state, { payload }) {
            payload = payload || state.menu; // vertical, collapsible-vertical, horizontal
            
            // Only access localStorage on client-side
            if (typeof window !== 'undefined') {
                localStorage.setItem('menu', payload);
            }
            
            state.menu = payload;
        },
        toggleLayout(state, { payload }) {
            payload = payload || state.layout; // full, boxed-layout
            
            // Only access localStorage on client-side
            if (typeof window !== 'undefined') {
                localStorage.setItem('layout', payload);
            }
            
            state.layout = payload;
        },
        toggleRTL(state, { payload }) {
            payload = payload || state.rtlClass; // rtl, ltr
            
            // Only access localStorage on client-side
            if (typeof window !== 'undefined') {
                localStorage.setItem('rtlClass', payload);
            }
            
            state.rtlClass = payload;
            
            // Only manipulate DOM on client-side
            if (typeof window !== 'undefined') {
                document.querySelector('html')?.setAttribute('dir', state.rtlClass || 'ltr');
            }
        },
        toggleAnimation(state, { payload }) {
            payload = payload || state.animation; // animate__fadeIn, animate__fadeInDown, animate__fadeInUp, animate__fadeInLeft, animate__fadeInRight, animate__slideInDown, animate__slideInLeft, animate__slideInRight, animate__zoomIn
            payload = payload?.trim();
            
            // Only access localStorage on client-side
            if (typeof window !== 'undefined') {
                localStorage.setItem('animation', payload);
            }
            
            state.animation = payload;
        },
        toggleNavbar(state, { payload }) {
            payload = payload || state.navbar; // navbar-sticky, navbar-floating, navbar-static
            
            // Only access localStorage on client-side
            if (typeof window !== 'undefined') {
                localStorage.setItem('navbar', payload);
            }
            
            state.navbar = payload;
        },
        toggleSemidark(state, { payload }) {
            payload = payload === true || payload === 'true' ? true : false;
            
            // Only access localStorage on client-side
            if (typeof window !== 'undefined') {
                localStorage.setItem('semidark', payload);
            }
            
            state.semidark = payload;
        },
        toggleSidebar(state) {
            state.sidebar = !state.sidebar;
        },
        resetToggleSidebar(state) {
            state.sidebar = false;
        },
    },
});

export const { toggleTheme, toggleMenu, toggleLayout, toggleRTL, toggleAnimation, toggleNavbar, toggleSemidark, toggleSidebar, resetToggleSidebar } = themeConfigSlice.actions;

export default themeConfigSlice.reducer;