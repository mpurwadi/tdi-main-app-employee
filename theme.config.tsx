const themeConfig = {
    locale: 'en', // en, da, de, el, es, fr, hu, it, ja, pl, pt, ru, sv, tr, zh
    theme: 'light', // light, dark, system
    menu: 'vertical', // vertical, collapsible-vertical, horizontal
    layout: 'full', // full, boxed-layout
    rtlClass: 'ltr', // rtl, ltr
    animation: '', // animate__fadeIn, animate__fadeInDown, animate__fadeInUp, animate__fadeInLeft, animate__fadeInRight, animate__slideInDown, animate__slideInLeft, animate__slideInRight, animate__zoomIn
    navbar: 'navbar-sticky', // navbar-sticky, navbar-floating, navbar-static
    semidark: false,
};

export default themeConfig;

// Also export individual properties for better tree-shaking
export const locale = themeConfig.locale;
export const theme = themeConfig.theme;
export const menu = themeConfig.menu;
export const layout = themeConfig.layout;
export const rtlClass = themeConfig.rtlClass;
export const animation = themeConfig.animation;
export const navbar = themeConfig.navbar;
export const semidark = themeConfig.semidark;
