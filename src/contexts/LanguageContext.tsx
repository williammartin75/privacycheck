'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { siteTranslations, SiteTranslation, SupportedLanguage } from '@/lib/site-translations';

interface LanguageContextType {
    language: SupportedLanguage;
    setLanguage: (lang: SupportedLanguage) => void;
    t: SiteTranslation;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = 'pc_language';

const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'de', 'es', 'it', 'pt', 'nl', 'pl'];

function detectBrowserLanguage(): SupportedLanguage {
    if (typeof navigator === 'undefined') return 'en';

    const browserLang = navigator.language?.substring(0, 2).toLowerCase();
    if (browserLang && SUPPORTED_LANGUAGES.includes(browserLang as SupportedLanguage)) {
        return browserLang as SupportedLanguage;
    }
    return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<SupportedLanguage>('en');
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // Check localStorage first, then browser language
        const stored = localStorage.getItem(LANGUAGE_KEY);
        if (stored && SUPPORTED_LANGUAGES.includes(stored as SupportedLanguage)) {
            setLanguageState(stored as SupportedLanguage);
        } else {
            const detected = detectBrowserLanguage();
            setLanguageState(detected);
            localStorage.setItem(LANGUAGE_KEY, detected);
        }
        setIsInitialized(true);
    }, []);

    const setLanguage = (lang: SupportedLanguage) => {
        setLanguageState(lang);
        localStorage.setItem(LANGUAGE_KEY, lang);
    };

    const t = siteTranslations[language] || siteTranslations.en;

    // Prevent flash of wrong language
    if (!isInitialized) {
        return null;
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

export { SUPPORTED_LANGUAGES };
export type { SupportedLanguage };
