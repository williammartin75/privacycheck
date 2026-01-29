'use client';

import React, { useState, useRef, useEffect } from 'react';

// Language data
const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'es', name: 'Español' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'pl', name: 'Polski' },
    { code: 'ro', name: 'Română' },
    { code: 'cs', name: 'Čeština' },
    { code: 'hu', name: 'Magyar' },
    { code: 'el', name: 'Ελληνικά' },
    { code: 'sv', name: 'Svenska' },
    { code: 'da', name: 'Dansk' },
    { code: 'fi', name: 'Suomi' },
    { code: 'no', name: 'Norsk' },
];

export function LanguageSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLang, setSelectedLang] = useState('en');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Get current language from cookie on mount
    useEffect(() => {
        // Check googtrans cookie
        const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
        if (match && match[1]) {
            setSelectedLang(match[1]);
        } else {
            // Check if user explicitly chose English (stored in localStorage)
            const userChoseEnglish = localStorage.getItem('userChoseEnglish');
            if (userChoseEnglish === 'true') {
                // User explicitly chose English, don't auto-translate
                setSelectedLang('en');
            } else {
                // First visit - detect browser language
                const browserLang = navigator.language?.substring(0, 2).toLowerCase();
                const supported = LANGUAGES.find(l => l.code === browserLang);
                if (supported && supported.code !== 'en') {
                    // Auto-translate to browser language
                    setTimeout(() => {
                        handleLanguageSelect(supported.code, true);
                    }, 500);
                }
            }
        }
    }, []);

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

    const handleLanguageSelect = (langCode: string, auto = false) => {
        setSelectedLang(langCode);
        if (!auto) setIsOpen(false);

        // Set Google Translate cookie and reload
        const domain = window.location.hostname;

        if (langCode === 'en') {
            // Clear translation - remove cookies
            document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain}`;
            // Remember that user explicitly chose English (to prevent auto-translation)
            if (!auto) {
                localStorage.setItem('userChoseEnglish', 'true');
            }
        } else {
            // Set translation cookie
            document.cookie = `googtrans=/en/${langCode}; path=/;`;
            document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${domain}`;
            // Clear the English preference since user chose another language
            localStorage.removeItem('userChoseEnglish');
        }

        // Force full page reload by reassigning href
        setTimeout(() => {
            window.location.href = window.location.href;
        }, 100);
    };

    const currentLang = LANGUAGES.find(l => l.code === selectedLang) || LANGUAGES[0];

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Hidden Google Translate element for initialization */}
            <div id="google_translate_element" style={{ position: 'absolute', visibility: 'hidden', height: 0, overflow: 'hidden' }}></div>

            {/* Custom dropdown button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 border border-gray-200"
                aria-label="Select language"
            >
                <span>{currentLang.name}</span>
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
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 max-h-80 overflow-y-auto">
                    {LANGUAGES.map((lang) => {
                        const isActive = lang.code === selectedLang;
                        return (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageSelect(lang.code)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'hover:bg-gray-50 text-gray-700'
                                    }`}
                            >
                                <span className="flex-1 font-medium">{lang.name}</span>
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
