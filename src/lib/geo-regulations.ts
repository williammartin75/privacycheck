// Geo-targeting for Privacy Regulations
// Maps countries/regions to their applicable privacy regulations

export interface GeoRegulation {
    code: string;
    name: string;
    shortName: string;
    countries: string[];
    requirements: {
        priorConsent: boolean; // Consent BEFORE cookies
        optOut: boolean;       // Allow opt-out after fact
        strictMode: boolean;   // No cookies without explicit consent
    };
    bannerText: string;
}

// Privacy regulations by region
export const regulations: Record<string, GeoRegulation> = {
    gdpr: {
        code: 'gdpr',
        name: 'General Data Protection Regulation',
        shortName: 'GDPR',
        countries: [
            'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
            'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
            'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', // EU-27
            'GB', 'IS', 'LI', 'NO', // UK + EEA
            'CH' // Switzerland (similar standards)
        ],
        requirements: {
            priorConsent: true,
            optOut: true,
            strictMode: true,
        },
        bannerText: 'We use cookies to enhance your experience. Under GDPR, we need your consent before setting non-essential cookies.',
    },
    ccpa: {
        code: 'ccpa',
        name: 'California Consumer Privacy Act',
        shortName: 'CCPA/CPRA',
        countries: ['US-CA'], // California specifically
        requirements: {
            priorConsent: false, // Opt-out model
            optOut: true,
            strictMode: false,
        },
        bannerText: 'We use cookies and may sell your data to third parties. Under CCPA, you have the right to opt out.',
    },
    lgpd: {
        code: 'lgpd',
        name: 'Lei Geral de Proteção de Dados',
        shortName: 'LGPD',
        countries: ['BR'],
        requirements: {
            priorConsent: true,
            optOut: true,
            strictMode: true,
        },
        bannerText: 'Utilizamos cookies para melhorar sua experiência. De acordo com a LGPD, precisamos do seu consentimento.',
    },
    pipeda: {
        code: 'pipeda',
        name: 'Personal Information Protection and Electronic Documents Act',
        shortName: 'PIPEDA',
        countries: ['CA'],
        requirements: {
            priorConsent: true,
            optOut: true,
            strictMode: false,
        },
        bannerText: 'We use cookies to enhance your experience. Under PIPEDA, we need your consent for non-essential cookies.',
    },
    popia: {
        code: 'popia',
        name: 'Protection of Personal Information Act',
        shortName: 'POPIA',
        countries: ['ZA'],
        requirements: {
            priorConsent: true,
            optOut: true,
            strictMode: false,
        },
        bannerText: 'We use cookies to enhance your experience. Under POPIA, we need your consent for non-essential cookies.',
    },
    pdpa_th: {
        code: 'pdpa_th',
        name: 'Personal Data Protection Act (Thailand)',
        shortName: 'PDPA',
        countries: ['TH'],
        requirements: {
            priorConsent: true,
            optOut: true,
            strictMode: false,
        },
        bannerText: 'We use cookies to enhance your experience. Under Thailand PDPA, we need your consent.',
    },
    appi: {
        code: 'appi',
        name: 'Act on Protection of Personal Information',
        shortName: 'APPI',
        countries: ['JP'],
        requirements: {
            priorConsent: false,
            optOut: true,
            strictMode: false,
        },
        bannerText: 'We use cookies. Under APPI, you may opt out of non-essential cookies.',
    },
    default: {
        code: 'default',
        name: 'General Privacy Notice',
        shortName: 'Privacy',
        countries: [],
        requirements: {
            priorConsent: false,
            optOut: true,
            strictMode: false,
        },
        bannerText: 'We use cookies to enhance your experience. You may opt out of non-essential cookies.',
    },
};

// US States with privacy laws
export const usStatesWithLaws: Record<string, string> = {
    'CA': 'ccpa',      // California - CCPA/CPRA
    'VA': 'vcdpa',     // Virginia - VCDPA
    'CO': 'cpa',       // Colorado - CPA
    'CT': 'ctdpa',     // Connecticut - CTDPA
    'UT': 'ucpa',      // Utah - UCPA
};

// Get regulation for a country code
export function getRegulationForCountry(countryCode: string, regionCode?: string): GeoRegulation {
    // Check for US states first
    if (countryCode === 'US' && regionCode) {
        const usLaw = usStatesWithLaws[regionCode];
        if (usLaw) {
            return {
                code: usLaw,
                name: regulations.ccpa.name,
                shortName: regulations.ccpa.shortName,
                countries: [`US-${regionCode}`],
                requirements: regulations.ccpa.requirements,
                bannerText: regulations.ccpa.bannerText,
            };
        }
    }

    // Check against all regulations
    for (const [key, reg] of Object.entries(regulations)) {
        if (reg.countries.includes(countryCode)) {
            return reg;
        }
        // Check for region-specific (like US-CA)
        if (regionCode && reg.countries.includes(`${countryCode}-${regionCode}`)) {
            return reg;
        }
    }

    return regulations.default;
}

// Determine if cookies should be blocked by default (strict mode)
export function shouldBlockByDefault(regulation: GeoRegulation): boolean {
    return regulation.requirements.priorConsent && regulation.requirements.strictMode;
}

// Get consent mode based on regulation
export function getConsentMode(regulation: GeoRegulation): 'opt-in' | 'opt-out' | 'notice-only' {
    if (regulation.requirements.priorConsent && regulation.requirements.strictMode) {
        return 'opt-in'; // Must accept before any tracking
    }
    if (regulation.requirements.optOut) {
        return 'opt-out'; // Can track but must allow opt-out
    }
    return 'notice-only'; // Just inform, no action required
}
