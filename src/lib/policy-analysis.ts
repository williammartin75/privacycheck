/**
 * Privacy Policy AI Analysis Module
 * 
 * Analyzes privacy policy content to assess GDPR compliance
 * Uses pattern matching and AI inference to evaluate:
 * - Legal basis declarations
 * - Data retention policies
 * - User rights (access, deletion, portability)
 * - Third-party data sharing
 * - DPO/Contact information
 * - International data transfers
 * - Cookie policy integration
 */

export interface PolicyAnalysisResult {
    found: boolean;
    policyUrl: string | null;
    lastUpdated: string | null;
    overallScore: number;
    overallStatus: 'compliant' | 'partial' | 'non-compliant' | 'not-found';

    sections: {
        legalBasis: SectionAnalysis;
        dataRetention: SectionAnalysis;
        userRights: SectionAnalysis;
        thirdPartySharing: SectionAnalysis;
        internationalTransfers: SectionAnalysis;
        contactInfo: SectionAnalysis;
        cookiePolicy: SectionAnalysis;
        childrenPrivacy: SectionAnalysis;
    };

    missingElements: string[];
    recommendations: string[];
    gdprArticles: { article: string; status: 'compliant' | 'partial' | 'missing' }[];
}

export interface SectionAnalysis {
    found: boolean;
    score: number; // 0-100
    status: 'compliant' | 'partial' | 'missing';
    details: string[];
    issues: string[];
}

// Patterns to find privacy policy links
const PRIVACY_POLICY_LINK_PATTERNS = [
    /href=["']([^"']*(?:privacy|datenschutz|confidentialite|privacidad|politique-de-confidentialite|privacy-policy|data-protection)[^"']*)["']/gi,
    /href=["']([^"']*\/privacy\/?[^"']*)["']/gi,
    /href=["']([^"']*\/legal\/privacy[^"']*)["']/gi,
];

// Legal basis patterns (GDPR Article 6)
const LEGAL_BASIS_PATTERNS = {
    consent: [
        /\b(consent|consentement|einwilligung|consentimiento)\b/i,
        /\bwith your (consent|permission|agreement)\b/i,
        /\bby (consenting|agreeing|accepting)\b/i,
        /\bobtain(ing|ed)? (your )?consent\b/i,
    ],
    contract: [
        /\b(contract|contractual|contrat|vertrag)\b/i,
        /\bperform(ance of |ing )?(a |the )?contract\b/i,
        /\bnecessary (for|to) (provide|deliver) (our |the )?service\b/i,
    ],
    legalObligation: [
        /\blegal obligation\b/i,
        /\bcomply with (the |a )?law\b/i,
        /\blegal(ly)? required\b/i,
        /\bstatutory (obligation|requirement)\b/i,
    ],
    vitalInterests: [
        /\bvital interests?\b/i,
        /\bprotect(ing)? (your |the )?life\b/i,
    ],
    publicInterest: [
        /\bpublic interest\b/i,
        /\bofficial authority\b/i,
    ],
    legitimateInterest: [
        /\blegitimate interest\b/i,
        /\bbusiness interest\b/i,
        /\bour (legitimate )?interests?\b/i,
        /\bbalancing (of )?interests?\b/i,
    ],
};

// Data retention patterns
const RETENTION_PATTERNS = {
    hasPolicy: [
        /\b(retain|keep|store|hold) (your |personal )?(data|information) (for|during)\b/i,
        /\bretention (period|policy|duration)\b/i,
        /\bdata (is |will be )?(kept|stored|retained)\b/i,
        /\bhow long (we |do we )?(keep|retain|store)\b/i,
    ],
    specificPeriod: [
        /\b(\d+)\s*(year|month|day|week)s?\b/i,
        /\b(one|two|three|five|seven|ten)\s*(year|month)s?\b/i,
    ],
    deletionPolicy: [
        /\b(delete|erase|remove|destroy) (your |the )?(data|information)\b/i,
        /\bdata (deletion|erasure|removal)\b/i,
        /\bafter (this |the )?period\b/i,
    ],
};

// User rights patterns (GDPR Articles 15-22)
const USER_RIGHTS_PATTERNS = {
    access: [
        /\bright (to |of )?access\b/i,
        /\baccess (to )?(your |personal )?(data|information)\b/i,
        /\brequest (a )?copy\b/i,
        /\bobtain (a )?copy\b/i,
    ],
    rectification: [
        /\b(rectif|correct)(y|ication)\b/i,
        /\bupdate (your )?(data|information)\b/i,
        /\bmodify (your )?(data|information)\b/i,
    ],
    erasure: [
        /\b(right to )?(be )?forgot(ten)?\b/i,
        /\berasure\b/i,
        /\bdelete (your )?(data|information|account)\b/i,
        /\brequest deletion\b/i,
    ],
    restriction: [
        /\brestrict(ion)? (of )?(processing|use)\b/i,
        /\blimit (the )?processing\b/i,
    ],
    portability: [
        /\bdata portability\b/i,
        /\btransfer (your )?data\b/i,
        /\breceive (your )?data\b/i,
        /\bmachine.?readable\b/i,
    ],
    objection: [
        /\b(right to )?object\b/i,
        /\bobjection (to|right)\b/i,
        /\bopt.?out\b/i,
    ],
    automatedDecision: [
        /\bautomated (decision|processing)\b/i,
        /\bprofiling\b/i,
        /\bhuman (intervention|review)\b/i,
    ],
};

// Third-party sharing patterns
const THIRD_PARTY_PATTERNS = {
    disclosure: [
        /\b(share|disclose|transfer|provide) (your )?(data|information) (to|with)\b/i,
        /\bthird.?part(y|ies)\b/i,
        /\bservice providers?\b/i,
        /\bpartners?\b/i,
    ],
    categories: [
        /\b(analytics|advertising|marketing|payment|hosting|cloud)\s*(provider|service|partner)?\b/i,
        /\b(google|facebook|meta|amazon|aws|stripe|paypal)\b/i,
    ],
    purposes: [
        /\bfor (the )?purpose(s)? of\b/i,
        /\bin order to\b/i,
        /\bto (provide|improve|analyze)\b/i,
    ],
};

// International transfer patterns
const TRANSFER_PATTERNS = {
    hasTransfers: [
        /\b(transfer|send|transmit) (data |information )?(outside|to|from) (the )?(EU|EEA|Europe)\b/i,
        /\binternational (data )?transfer\b/i,
        /\bcross.?border\b/i,
        /\b(USA|United States|US servers?)\b/i,
    ],
    safeguards: [
        /\bstandard contractual clauses\b/i,
        /\bSCCs?\b/i,
        /\badequacy decision\b/i,
        /\bbinding corporate rules\b/i,
        /\bprivacy shield\b/i, // outdated but still mentioned
        /\bDPF\b/i, // EU-US Data Privacy Framework
        /\bdata privacy framework\b/i,
    ],
};

// Contact information patterns
const CONTACT_PATTERNS = {
    dpo: [
        /\bdata protection officer\b/i,
        /\bDPO\b/,
        /\bdatenschutzbeauftragte\b/i,
        /\bdélégué.*protection.*données\b/i,
    ],
    email: [
        /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/,
        /\b(privacy|dpo|dataprotection|gdpr)@\b/i,
    ],
    address: [
        /\b\d+\s+[A-Za-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd)\b/i,
        /\b[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}\b/, // UK postcode
        /\b\d{5}\s+[A-Za-z]+\b/, // German/French postal
    ],
    supervisoryAuthority: [
        /\bsupervisory authority\b/i,
        /\bdata protection authority\b/i,
        /\b(CNIL|ICO|BfDI|AEPD|Garante|DPA)\b/i,
        /\blodge a complaint\b/i,
    ],
};

// Cookie policy patterns
const COOKIE_PATTERNS = {
    hasCookieSection: [
        /\bcookie(s)?\s*(policy|notice|information)\b/i,
        /\buse of cookies\b/i,
        /\bwhat (are )?cookies\b/i,
    ],
    categories: [
        /\b(essential|necessary|functional|analytics|performance|marketing|advertising)\s*cookies?\b/i,
        /\bfirst.?party\b/i,
        /\bthird.?party\s*cookies?\b/i,
    ],
    management: [
        /\bmanage (your )?cookies?\b/i,
        /\bcookie (settings|preferences|consent)\b/i,
        /\bdisable cookies?\b/i,
        /\bbrowser settings\b/i,
    ],
};

// Children privacy patterns (GDPR Article 8)
const CHILDREN_PATTERNS = {
    hasSection: [
        /\bchildren('s| under)\b/i,
        /\bminors?\b/i,
        /\b(under )?(13|16|18) years?\b/i,
        /\bparental consent\b/i,
        /\bage (verification|requirement|restriction)\b/i,
    ],
    notTargeted: [
        /\bnot (intended|directed) (for|at|to) (children|minors)\b/i,
        /\bdo not (knowingly )?(collect|target)\b/i,
    ],
};

// Last updated patterns
const LAST_UPDATED_PATTERNS = [
    /\b(last |)updated:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/i,
    /\b(effective|updated|revised|modified)\s*(date|on|as of)?:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}/i,
    /\b\d{1,2}\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/i,
];

/**
 * Extract privacy policy URL from HTML
 */
function findPrivacyPolicyUrl(html: string, baseUrl: URL): string | null {
    const htmlLower = html.toLowerCase();

    for (const pattern of PRIVACY_POLICY_LINK_PATTERNS) {
        const matches = html.matchAll(pattern);
        for (const match of matches) {
            if (match[1]) {
                try {
                    const url = new URL(match[1], baseUrl);
                    return url.toString();
                } catch {
                    continue;
                }
            }
        }
    }

    // Fallback: common paths
    const commonPaths = ['/privacy', '/privacy-policy', '/legal/privacy', '/datenschutz', '/politique-de-confidentialite'];
    for (const path of commonPaths) {
        if (htmlLower.includes(`href="${path}"`) || htmlLower.includes(`href='${path}'`)) {
            return new URL(path, baseUrl).toString();
        }
    }

    return null;
}

/**
 * Extract last updated date from policy text
 */
function extractLastUpdated(text: string): string | null {
    for (const pattern of LAST_UPDATED_PATTERNS) {
        const match = text.match(pattern);
        if (match) {
            return match[0];
        }
    }
    return null;
}

/**
 * Check patterns and return matches count
 */
function checkPatterns(text: string, patterns: RegExp[]): { found: boolean; matches: string[] } {
    const matches: string[] = [];
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            matches.push(match[0]);
        }
    }
    return { found: matches.length > 0, matches };
}

/**
 * Analyze legal basis section
 */
function analyzeLegalBasis(text: string): SectionAnalysis {
    const details: string[] = [];
    const issues: string[] = [];
    let score = 0;

    const basisTypes = Object.entries(LEGAL_BASIS_PATTERNS);
    let foundBases = 0;

    for (const [basis, patterns] of basisTypes) {
        const result = checkPatterns(text, patterns);
        if (result.found) {
            foundBases++;
            const basisName = basis.replace(/([A-Z])/g, ' $1').trim();
            details.push(`Mentions ${basisName.toLowerCase()} as legal basis`);
        }
    }

    if (foundBases >= 3) {
        score = 100;
    } else if (foundBases >= 2) {
        score = 75;
    } else if (foundBases >= 1) {
        score = 50;
        issues.push('Limited legal bases mentioned');
    } else {
        score = 0;
        issues.push('No clear legal basis for data processing specified');
    }

    // Check for Article 6 explicit mention
    if (/article\s*6/i.test(text) || /GDPR\s*Art(icle)?\.?\s*6/i.test(text)) {
        details.push('Explicitly references GDPR Article 6');
        score = Math.min(100, score + 10);
    }

    return {
        found: foundBases > 0,
        score: Math.min(100, score),
        status: score >= 70 ? 'compliant' : score >= 40 ? 'partial' : 'missing',
        details,
        issues,
    };
}

/**
 * Analyze data retention section
 */
function analyzeDataRetention(text: string): SectionAnalysis {
    const details: string[] = [];
    const issues: string[] = [];
    let score = 0;

    const hasPolicy = checkPatterns(text, RETENTION_PATTERNS.hasPolicy);
    const hasSpecificPeriod = checkPatterns(text, RETENTION_PATTERNS.specificPeriod);
    const hasDeletion = checkPatterns(text, RETENTION_PATTERNS.deletionPolicy);

    if (hasPolicy.found) {
        score += 40;
        details.push('Contains data retention policy');
    } else {
        issues.push('No clear data retention policy found');
    }

    if (hasSpecificPeriod.found) {
        score += 40;
        details.push(`Specifies retention periods (${hasSpecificPeriod.matches[0]})`);
    } else {
        issues.push('No specific retention periods mentioned');
    }

    if (hasDeletion.found) {
        score += 20;
        details.push('Mentions data deletion after retention period');
    }

    return {
        found: hasPolicy.found,
        score,
        status: score >= 70 ? 'compliant' : score >= 40 ? 'partial' : 'missing',
        details,
        issues,
    };
}

/**
 * Analyze user rights section
 */
function analyzeUserRights(text: string): SectionAnalysis {
    const details: string[] = [];
    const issues: string[] = [];
    let score = 0;

    const rightsFound: string[] = [];
    const rightsMissing: string[] = [];

    const rights = [
        { name: 'Access', key: 'access', weight: 15 },
        { name: 'Rectification', key: 'rectification', weight: 15 },
        { name: 'Erasure', key: 'erasure', weight: 20 },
        { name: 'Restriction', key: 'restriction', weight: 10 },
        { name: 'Portability', key: 'portability', weight: 15 },
        { name: 'Objection', key: 'objection', weight: 15 },
        { name: 'Automated Decision', key: 'automatedDecision', weight: 10 },
    ];

    for (const right of rights) {
        const patterns = USER_RIGHTS_PATTERNS[right.key as keyof typeof USER_RIGHTS_PATTERNS];
        const result = checkPatterns(text, patterns);
        if (result.found) {
            rightsFound.push(right.name);
            score += right.weight;
        } else {
            rightsMissing.push(right.name);
        }
    }

    if (rightsFound.length > 0) {
        details.push(`Covers ${rightsFound.length}/7 user rights: ${rightsFound.join(', ')}`);
    }

    if (rightsMissing.length > 0 && rightsMissing.length <= 3) {
        issues.push(`Missing rights: ${rightsMissing.join(', ')}`);
    } else if (rightsMissing.length > 3) {
        issues.push('Significant user rights not mentioned');
    }

    return {
        found: rightsFound.length >= 3,
        score: Math.min(100, score),
        status: score >= 70 ? 'compliant' : score >= 40 ? 'partial' : 'missing',
        details,
        issues,
    };
}

/**
 * Analyze third-party sharing section
 */
function analyzeThirdPartySharing(text: string): SectionAnalysis {
    const details: string[] = [];
    const issues: string[] = [];
    let score = 0;

    const hasDisclosure = checkPatterns(text, THIRD_PARTY_PATTERNS.disclosure);
    const hasCategories = checkPatterns(text, THIRD_PARTY_PATTERNS.categories);
    const hasPurposes = checkPatterns(text, THIRD_PARTY_PATTERNS.purposes);

    if (hasDisclosure.found) {
        score += 40;
        details.push('Discloses third-party data sharing');
    } else {
        issues.push('No information about third-party data sharing');
    }

    if (hasCategories.found) {
        score += 30;
        details.push('Names categories of third parties');
    }

    if (hasPurposes.found) {
        score += 30;
        details.push('Explains purposes of data sharing');
    }

    return {
        found: hasDisclosure.found,
        score,
        status: score >= 70 ? 'compliant' : score >= 40 ? 'partial' : 'missing',
        details,
        issues,
    };
}

/**
 * Analyze international transfers section
 */
function analyzeInternationalTransfers(text: string): SectionAnalysis {
    const details: string[] = [];
    const issues: string[] = [];
    let score = 50; // Default: no transfers = OK

    const hasTransfers = checkPatterns(text, TRANSFER_PATTERNS.hasTransfers);
    const hasSafeguards = checkPatterns(text, TRANSFER_PATTERNS.safeguards);

    if (hasTransfers.found) {
        details.push('Mentions international data transfers');
        if (hasSafeguards.found) {
            score = 100;
            details.push(`Uses legal safeguards (${hasSafeguards.matches.join(', ')})`);
        } else {
            score = 30;
            issues.push('International transfers without documented safeguards (SCCs, adequacy decision)');
        }
    } else {
        details.push('No international transfers mentioned');
    }

    return {
        found: hasTransfers.found,
        score,
        status: score >= 70 ? 'compliant' : score >= 40 ? 'partial' : 'missing',
        details,
        issues,
    };
}

/**
 * Analyze contact information section
 */
function analyzeContactInfo(text: string): SectionAnalysis {
    const details: string[] = [];
    const issues: string[] = [];
    let score = 0;

    const hasDpo = checkPatterns(text, CONTACT_PATTERNS.dpo);
    const hasEmail = checkPatterns(text, CONTACT_PATTERNS.email);
    const hasAddress = checkPatterns(text, CONTACT_PATTERNS.address);
    const hasAuthority = checkPatterns(text, CONTACT_PATTERNS.supervisoryAuthority);

    if (hasDpo.found) {
        score += 30;
        details.push('DPO/Privacy contact mentioned');
    } else {
        issues.push('No Data Protection Officer contact');
    }

    if (hasEmail.found) {
        score += 30;
        details.push(`Contact email provided (${hasEmail.matches[0]})`);
    } else {
        issues.push('No privacy contact email');
    }

    if (hasAddress.found) {
        score += 20;
        details.push('Physical address provided');
    }

    if (hasAuthority.found) {
        score += 20;
        details.push('Information about supervisory authority');
    } else {
        issues.push('No mention of supervisory authority for complaints');
    }

    return {
        found: hasEmail.found || hasDpo.found,
        score,
        status: score >= 70 ? 'compliant' : score >= 40 ? 'partial' : 'missing',
        details,
        issues,
    };
}

/**
 * Analyze cookie policy section
 */
function analyzeCookiePolicy(text: string): SectionAnalysis {
    const details: string[] = [];
    const issues: string[] = [];
    let score = 0;

    const hasCookieSection = checkPatterns(text, COOKIE_PATTERNS.hasCookieSection);
    const hasCategories = checkPatterns(text, COOKIE_PATTERNS.categories);
    const hasManagement = checkPatterns(text, COOKIE_PATTERNS.management);

    if (hasCookieSection.found) {
        score += 40;
        details.push('Contains cookie policy information');
    } else {
        issues.push('No cookie policy section in privacy policy');
    }

    if (hasCategories.found) {
        score += 30;
        details.push('Explains cookie categories');
    }

    if (hasManagement.found) {
        score += 30;
        details.push('Explains how to manage cookies');
    }

    return {
        found: hasCookieSection.found,
        score,
        status: score >= 70 ? 'compliant' : score >= 40 ? 'partial' : 'missing',
        details,
        issues,
    };
}

/**
 * Analyze children privacy section
 */
function analyzeChildrenPrivacy(text: string): SectionAnalysis {
    const details: string[] = [];
    const issues: string[] = [];
    let score = 50; // Default: OK if not targeting children

    const hasSection = checkPatterns(text, CHILDREN_PATTERNS.hasSection);
    const hasNotTargeted = checkPatterns(text, CHILDREN_PATTERNS.notTargeted);

    if (hasSection.found) {
        score = 80;
        details.push('Contains children privacy policy');
    }

    if (hasNotTargeted.found) {
        score = 100;
        details.push('States service is not directed at children');
    }

    if (!hasSection.found && !hasNotTargeted.found) {
        issues.push('No statement about children\'s data');
    }

    return {
        found: hasSection.found || hasNotTargeted.found,
        score,
        status: score >= 70 ? 'compliant' : score >= 40 ? 'partial' : 'missing',
        details,
        issues,
    };
}

/**
 * Main analysis function
 */
export function analyzePrivacyPolicy(html: string, policyText: string | null, baseUrl: URL): PolicyAnalysisResult {
    // Find policy URL
    const policyUrl = findPrivacyPolicyUrl(html, baseUrl);

    // If no policy text provided, use the main HTML
    const textToAnalyze = policyText || html;
    const textLower = textToAnalyze.toLowerCase();

    // Check if it looks like a privacy policy
    const looksLikePolicy = /privacy\s*(policy|notice|statement)/i.test(textToAnalyze) ||
        /datenschutz/i.test(textToAnalyze) ||
        /politique.*confidentialit/i.test(textToAnalyze);

    // If we have policy text, analyze it
    const lastUpdated = extractLastUpdated(textToAnalyze);

    // Analyze each section
    const sections = {
        legalBasis: analyzeLegalBasis(textToAnalyze),
        dataRetention: analyzeDataRetention(textToAnalyze),
        userRights: analyzeUserRights(textToAnalyze),
        thirdPartySharing: analyzeThirdPartySharing(textToAnalyze),
        internationalTransfers: analyzeInternationalTransfers(textToAnalyze),
        contactInfo: analyzeContactInfo(textToAnalyze),
        cookiePolicy: analyzeCookiePolicy(textToAnalyze),
        childrenPrivacy: analyzeChildrenPrivacy(textToAnalyze),
    };

    // Calculate overall score
    const sectionScores = Object.values(sections).map(s => s.score);
    const overallScore = Math.round(sectionScores.reduce((a, b) => a + b, 0) / sectionScores.length);

    // Collect missing elements
    const missingElements: string[] = [];
    if (!sections.legalBasis.found) missingElements.push('Legal basis for processing');
    if (!sections.dataRetention.found) missingElements.push('Data retention policy');
    if (sections.userRights.score < 50) missingElements.push('Complete user rights information');
    if (!sections.thirdPartySharing.found) missingElements.push('Third-party sharing disclosure');
    if (!sections.contactInfo.found) missingElements.push('Privacy contact information');

    // Generate recommendations
    const recommendations: string[] = [];
    if (sections.legalBasis.score < 70) {
        recommendations.push('Clearly specify legal basis for each type of data processing (GDPR Art. 6)');
    }
    if (sections.dataRetention.score < 70) {
        recommendations.push('Add specific data retention periods for each category of data');
    }
    if (sections.userRights.score < 70) {
        recommendations.push('Include all GDPR user rights (access, rectification, erasure, portability, objection)');
    }
    if (sections.contactInfo.score < 70) {
        recommendations.push('Add DPO contact information and supervisory authority details');
    }
    if (!lastUpdated) {
        recommendations.push('Add a visible "last updated" date to your privacy policy');
    }

    // GDPR articles compliance
    const getStatus = (score: number): 'compliant' | 'partial' | 'missing' => {
        if (score >= 70) return 'compliant';
        if (score >= 40) return 'partial';
        return 'missing';
    };

    const gdprArticles: PolicyAnalysisResult['gdprArticles'] = [
        { article: 'Art. 6 - Legal Basis', status: getStatus(sections.legalBasis.score) },
        { article: 'Art. 13/14 - Information', status: getStatus(sections.contactInfo.score) },
        { article: 'Art. 15-22 - User Rights', status: getStatus(sections.userRights.score) },
        { article: 'Art. 44-49 - Transfers', status: getStatus(sections.internationalTransfers.score) },
    ];

    // Determine overall status
    let overallStatus: PolicyAnalysisResult['overallStatus'];
    if (!policyUrl && !looksLikePolicy) {
        overallStatus = 'not-found';
    } else if (overallScore >= 70) {
        overallStatus = 'compliant';
    } else if (overallScore >= 40) {
        overallStatus = 'partial';
    } else {
        overallStatus = 'non-compliant';
    }

    return {
        found: policyUrl !== null || looksLikePolicy,
        policyUrl,
        lastUpdated,
        overallScore,
        overallStatus,
        sections,
        missingElements,
        recommendations,
        gdprArticles,
    };
}

/**
 * Fetch and analyze privacy policy from URL
 */
export async function fetchAndAnalyzePolicy(policyUrl: string, mainHtml: string, baseUrl: URL): Promise<PolicyAnalysisResult> {
    try {
        const response = await fetch(policyUrl, {
            headers: {
                'User-Agent': 'PrivacyChecker/1.0 GDPR Compliance Scanner',
                'Accept': 'text/html,application/xhtml+xml',
            },
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
            return analyzePrivacyPolicy(mainHtml, null, baseUrl);
        }

        const policyHtml = await response.text();
        // Strip HTML tags for text analysis
        const policyText = policyHtml
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        return analyzePrivacyPolicy(mainHtml, policyText, baseUrl);
    } catch {
        return analyzePrivacyPolicy(mainHtml, null, baseUrl);
    }
}
