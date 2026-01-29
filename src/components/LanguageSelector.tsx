'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, SUPPORTED_LANGUAGES, SupportedLanguage } from '@/contexts/LanguageContext';

// Language names only (flag emojis don't display on Windows)
const LANGUAGE_DATA: Record<SupportedLanguage, { abbr: string; name: string }> = {
    en: { abbr: 'EN', name: 'English' },
    fr: { abbr: 'FR', name: 'Français' },
    de: { abbr: 'DE', name: 'Deutsch' },
    es: { abbr: 'ES', name: 'Español' },
    it: { abbr: 'IT', name: 'Italiano' },
    pt: { abbr: 'PT', name: 'Português' },
    nl: { abbr: 'NL', name: 'Nederlands' },
    pl: { abbr: 'PL', name: 'Polski' },
    ro: { abbr: 'RO', name: 'Română' },
    cs: { abbr: 'CZ', name: 'Čeština' },
    hu: { abbr: 'HU', name: 'Magyar' },
    el: { abbr: 'GR', name: 'Ελληνικά' },
    sv: { abbr: 'SE', name: 'Svenska' },
    da: { abbr: 'DK', name: 'Dansk' },
    fi: { abbr: 'FI', name: 'Suomi' },
    no: { abbr: 'NO', name: 'Norsk' },
};

export function LanguageSelector() {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentLang = LANGUAGE_DATA[language];

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Current language button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                aria-label="Select language"
            >
                <span className="text-sm font-semibold">{currentLang.abbr}</span>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {SUPPORTED_LANGUAGES.map((lang) => {
                        const langData = LANGUAGE_DATA[lang];
                        const isActive = lang === language;

                        return (
                            <button
                                key={lang}
                                onClick={() => {
                                    setLanguage(lang);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'hover:bg-gray-50 text-gray-700'
                                    }`}
                            >
                                <span className="flex-1 font-medium">{langData.name}</span>
                                {isActive && (
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default LanguageSelector;
