'use client';
import Dropdown from '@/components/dropdown';
import IconCaretDown from '@/components/icon/icon-caret-down';
import { getTranslation } from '@/i18n';
import { IRootState } from '@/store';
import { toggleRTL } from '@/store/themeConfigSlice';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface LanguageDropdownProps {
    className?: string;
}

const LanguageDropdown = ({ className = '' }: LanguageDropdownProps) => {
    const dispatch = useDispatch();
    const router = useRouter();
    
    // Add error handling for the translation with improved fallback
    let i18n;
    try {
        const translationResult = getTranslation();
        i18n = translationResult.i18n;
        
        // Ensure i18n is properly structured
        if (!i18n || typeof i18n !== 'object') {
            i18n = {
                language: 'en',
                changeLanguage: () => {}
            };
        }
    } catch (e) {
        // Fallback if getTranslation fails
        i18n = {
            language: 'en',
            changeLanguage: () => {}
        };
    }

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const setLocale = (flag: string) => {
        if (flag.toLowerCase() === 'ae') {
            dispatch(toggleRTL('rtl'));
        } else {
            dispatch(toggleRTL('ltr'));
        }
        router.refresh();
    };

    // Add safety check for i18n.language
    const safeLanguage = i18n?.language && typeof i18n.language === 'string' ? i18n.language : 'en';

    return (
        <div className={`dropdown ${className}`}>
            {safeLanguage && (
                <Dropdown
                    offset={[0, 8]}
                    placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                    btnClassName="flex items-center gap-2.5 rounded-lg border border-white-dark/30 bg-white px-2 py-1.5 text-white-dark hover:border-primary hover:text-primary dark:bg-black"
                    button={
                        <>
                            <div>
                                <img src={`/assets/images/flags/${i18n.language.toUpperCase()}.svg`} alt="image" className="h-5 w-5 rounded-full object-cover" />
                            </div>
                            <div className="text-base font-bold uppercase">{i18n.language}</div>
                            <span className="shrink-0">
                                <IconCaretDown />
                            </span>
                        </>
                    }
                >
                    <ul className="grid w-[280px] grid-cols-2 gap-2 !px-2 font-semibold text-dark dark:text-white-dark dark:text-white-light/90">
                        {themeConfig.languageList.map((item: any) => {
                            return (
                                <li key={item.code}>
                                    <button
                                        type="button"
                                        className={`flex w-full rounded-lg hover:text-primary ${i18n.language === item.code ? 'bg-primary/10 text-primary' : ''}`}
                                        onClick={() => {
                                            i18n.changeLanguage(item.code);
                                            setLocale(item.code);
                                        }}
                                    >
                                        <img src={`/assets/images/flags/${item.code.toUpperCase()}.svg`} alt="flag" className="h-5 w-5 rounded-full object-cover" />
                                        <span className="ltr:ml-3 rtl:mr-3">{item.name}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </Dropdown>
            )}
        </div>
    );
};

export default LanguageDropdown;
