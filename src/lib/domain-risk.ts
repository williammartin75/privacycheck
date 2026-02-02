/**
 * Domain Risk Analysis - WHOIS, SSL, DNS Security, Typosquatting
 * For PrivacyChecker Pro/Pro+ users
 */

import dns from 'dns';
import { promisify } from 'util';

const resolveTxt = promisify(dns.resolveTxt);
const resolve4 = promisify(dns.resolve4);

// ============ INTERFACES ============

export interface DomainRiskResult {
    domainExpiry: {
        expiresAt: string | null;
        daysUntilExpiry: number | null;
        registrar: string | null;
        status: 'ok' | 'warning' | 'critical' | 'unknown';
    };
    sslExpiry: {
        expiresAt: string | null;
        daysUntilExpiry: number | null;
        status: 'ok' | 'warning' | 'critical';
    };
    dnsSecurity: {
        dnssec: boolean;
        spf: boolean;
        dkim: boolean;
        dmarc: boolean;
        score: number;
    };
    typosquatting: {
        detected: number;
        domains: TyposquattingDomain[];
    };
    phishingRisk: {
        score: number;
        alerts: string[];
    };
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    score: number;
}

export interface TyposquattingDomain {
    domain: string;
    type: string;
    registered: boolean;
    risk: 'high' | 'medium' | 'low';
}

// ============ WHOIS PARSING ============

interface WhoisData {
    expiresAt: string | null;
    registrar: string | null;
}

async function getWhoisData(domain: string): Promise<WhoisData> {
    try {
        // Dynamic import for whois (CommonJS module)
        const whois = await import('whois');

        return new Promise((resolve) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            whois.lookup(domain, (err: Error | null, data: any) => {
                if (err || !data) {
                    resolve({ expiresAt: null, registrar: null });
                    return;
                }

                // Handle both string and array response types
                const whoisText = typeof data === 'string' ? data :
                    Array.isArray(data) ? data.map(r => r.data || '').join('\n') : '';

                if (!whoisText) {
                    resolve({ expiresAt: null, registrar: null });
                    return;
                }

                // Parse expiration date from WHOIS response
                const expiryPatterns = [
                    /Registry Expiry Date:\s*(.+)/i,
                    /Expiration Date:\s*(.+)/i,
                    /Expiry Date:\s*(.+)/i,
                    /paid-till:\s*(.+)/i,
                    /Registrar Registration Expiration Date:\s*(.+)/i,
                ];

                let expiresAt: string | null = null;
                for (const pattern of expiryPatterns) {
                    const match = whoisText.match(pattern);
                    if (match) {
                        expiresAt = match[1].trim();
                        break;
                    }
                }

                // Parse registrar
                const registrarMatch = whoisText.match(/Registrar:\s*(.+)/i);
                const registrar = registrarMatch ? registrarMatch[1].trim() : null;

                resolve({ expiresAt, registrar });
            });
        });
    } catch {
        return { expiresAt: null, registrar: null };
    }
}

function calculateDaysUntilExpiry(expiresAt: string | null): number | null {
    if (!expiresAt) return null;

    try {
        const expiryDate = new Date(expiresAt);
        if (isNaN(expiryDate.getTime())) return null;

        const now = new Date();
        const diffMs = expiryDate.getTime() - now.getTime();
        return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    } catch {
        return null;
    }
}

// ============ DNS SECURITY ============

async function checkDnsSecurity(domain: string): Promise<{
    dnssec: boolean;
    spf: boolean;
    dkim: boolean;
    dmarc: boolean;
    score: number;
}> {
    let spf = false;
    let dkim = false;
    let dmarc = false;
    const dnssec = false; // Would need DNSSEC-specific query

    try {
        // Check SPF record
        const txtRecords = await resolveTxt(domain).catch(() => []);
        for (const record of txtRecords) {
            const txt = record.join('');
            if (txt.includes('v=spf1')) {
                spf = true;
            }
        }

        // Check DMARC record
        const dmarcRecords = await resolveTxt(`_dmarc.${domain}`).catch(() => []);
        for (const record of dmarcRecords) {
            const txt = record.join('');
            if (txt.includes('v=DMARC1')) {
                dmarc = true;
            }
        }

        // Check DKIM (common selectors including Resend, ImprovMX, Amazon SES)
        const selectors = ['default', 'google', 'selector1', 'selector2', 'k1', 'resend', 'improvmx', 'mx', 'amazonses', 'ses'];
        for (const selector of selectors) {
            try {
                const dkimRecords = await resolveTxt(`${selector}._domainkey.${domain}`);
                if (dkimRecords.length > 0) {
                    dkim = true;
                    break;
                }
            } catch {
                // Selector not found, continue
            }
        }
    } catch {
        // DNS lookup failed
    }

    // Calculate DNS security score (0-100)
    let score = 0;
    if (spf) score += 30;
    if (dkim) score += 30;
    if (dmarc) score += 30;
    if (dnssec) score += 10;

    return { dnssec, spf, dkim, dmarc, score };
}

// ============ TYPOSQUATTING DETECTION ============

function generateTyposquattingVariants(domain: string): { domain: string; type: string }[] {
    // Extract base domain (without TLD)
    const parts = domain.split('.');
    if (parts.length < 2) return [];

    const tld = parts.pop()!;
    const baseName = parts.join('.');
    const variants: { domain: string; type: string }[] = [];

    // 1. Character omission (missing letters)
    for (let i = 0; i < baseName.length; i++) {
        const variant = baseName.slice(0, i) + baseName.slice(i + 1);
        if (variant.length > 0) {
            variants.push({ domain: `${variant}.${tld}`, type: 'omission' });
        }
    }

    // 2. Character swap (transposition)
    for (let i = 0; i < baseName.length - 1; i++) {
        const chars = baseName.split('');
        [chars[i], chars[i + 1]] = [chars[i + 1], chars[i]];
        variants.push({ domain: `${chars.join('')}.${tld}`, type: 'swap' });
    }

    // 3. Character duplication
    for (let i = 0; i < baseName.length; i++) {
        const variant = baseName.slice(0, i + 1) + baseName[i] + baseName.slice(i + 1);
        variants.push({ domain: `${variant}.${tld}`, type: 'duplication' });
    }

    // 4. Adjacent key replacement (QWERTY)
    const qwertyAdjacent: Record<string, string[]> = {
        'a': ['q', 's', 'z'], 'b': ['v', 'n', 'g', 'h'], 'c': ['x', 'v', 'd', 'f'],
        'd': ['s', 'f', 'e', 'r', 'x', 'c'], 'e': ['w', 'r', 'd', 's'],
        'f': ['d', 'g', 'r', 't', 'c', 'v'], 'g': ['f', 'h', 't', 'y', 'v', 'b'],
        'h': ['g', 'j', 'y', 'u', 'b', 'n'], 'i': ['u', 'o', 'k', 'j'],
        'j': ['h', 'k', 'u', 'i', 'n', 'm'], 'k': ['j', 'l', 'i', 'o', 'm'],
        'l': ['k', 'o', 'p'], 'm': ['n', 'j', 'k'], 'n': ['b', 'm', 'h', 'j'],
        'o': ['i', 'p', 'l', 'k'], 'p': ['o', 'l'], 'q': ['w', 'a'],
        'r': ['e', 't', 'd', 'f'], 's': ['a', 'd', 'w', 'e', 'z', 'x'],
        't': ['r', 'y', 'f', 'g'], 'u': ['y', 'i', 'h', 'j'],
        'v': ['c', 'b', 'f', 'g'], 'w': ['q', 'e', 'a', 's'],
        'x': ['z', 'c', 's', 'd'], 'y': ['t', 'u', 'g', 'h'], 'z': ['a', 's', 'x']
    };

    for (let i = 0; i < baseName.length; i++) {
        const char = baseName[i].toLowerCase();
        const adjacent = qwertyAdjacent[char] || [];
        for (const adj of adjacent.slice(0, 2)) { // Limit to 2 per char
            const variant = baseName.slice(0, i) + adj + baseName.slice(i + 1);
            variants.push({ domain: `${variant}.${tld}`, type: 'typo' });
        }
    }

    // 5. TLD variations
    const commonTLDs = ['com', 'net', 'org', 'co', 'io', 'info', 'biz'];
    for (const newTld of commonTLDs) {
        if (newTld !== tld) {
            variants.push({ domain: `${baseName}.${newTld}`, type: 'tld-swap' });
        }
    }

    // 6. Homograph attacks (common substitutions)
    const homographs: Record<string, string[]> = {
        'a': ['4', '@'], 'e': ['3'], 'i': ['1', 'l'], 'o': ['0'],
        's': ['5', '$'], 'l': ['1', 'i'], 't': ['7']
    };

    for (let i = 0; i < baseName.length; i++) {
        const char = baseName[i].toLowerCase();
        const subs = homographs[char] || [];
        for (const sub of subs.slice(0, 1)) { // Limit to 1 per char
            const variant = baseName.slice(0, i) + sub + baseName.slice(i + 1);
            variants.push({ domain: `${variant}.${tld}`, type: 'homograph' });
        }
    }

    // Remove duplicates and the original domain
    const seen = new Set<string>();
    seen.add(domain);

    return variants.filter(v => {
        if (seen.has(v.domain)) return false;
        seen.add(v.domain);
        return true;
    }).slice(0, 50); // Limit to 50 variants for checking
}

async function checkDomainExists(domain: string): Promise<boolean> {
    try {
        await resolve4(domain);
        return true;
    } catch {
        return false;
    }
}

async function detectTyposquatting(domain: string): Promise<{
    detected: number;
    domains: TyposquattingDomain[];
}> {
    const variants = generateTyposquattingVariants(domain);
    const registeredDomains: TyposquattingDomain[] = [];

    // Check a subset of variants (limit DNS queries)
    const toCheck = variants.slice(0, 30);

    const results = await Promise.allSettled(
        toCheck.map(async (v) => {
            const exists = await checkDomainExists(v.domain);
            return { ...v, exists };
        })
    );

    for (const result of results) {
        if (result.status === 'fulfilled' && result.value.exists) {
            const { domain: d, type } = result.value;

            // Determine risk level
            let risk: 'high' | 'medium' | 'low' = 'medium';
            if (type === 'omission' || type === 'swap') {
                risk = 'high';
            } else if (type === 'homograph') {
                risk = 'high';
            } else if (type === 'tld-swap') {
                risk = 'medium';
            } else {
                risk = 'low';
            }

            registeredDomains.push({
                domain: d,
                type,
                registered: true,
                risk
            });
        }
    }

    // Sort by risk and limit to 15
    const sorted = registeredDomains.sort((a, b) => {
        const riskOrder = { high: 0, medium: 1, low: 2 };
        return riskOrder[a.risk] - riskOrder[b.risk];
    }).slice(0, 15);

    return {
        detected: sorted.length,
        domains: sorted
    };
}

// ============ PHISHING RISK ============

function assessPhishingRisk(typosquattingResults: TyposquattingDomain[]): {
    score: number;
    alerts: string[];
} {
    const alerts: string[] = [];
    let score = 100;

    const highRiskCount = typosquattingResults.filter(d => d.risk === 'high').length;
    const mediumRiskCount = typosquattingResults.filter(d => d.risk === 'medium').length;

    if (highRiskCount >= 3) {
        score -= 30;
        alerts.push(`${highRiskCount} high-risk lookalike domains detected - potential phishing risk`);
    } else if (highRiskCount > 0) {
        score -= highRiskCount * 8;
        alerts.push(`${highRiskCount} high-risk lookalike domain(s) found`);
    }

    if (mediumRiskCount >= 5) {
        score -= 15;
        alerts.push(`${mediumRiskCount} similar domains registered with different TLDs`);
    }

    if (typosquattingResults.length >= 10) {
        alerts.push('High number of similar domains - consider trademark monitoring');
    }

    return { score: Math.max(0, score), alerts };
}

// ============ MAIN ANALYSIS FUNCTION ============

export async function analyzeDomainRisk(
    domain: string,
    sslInfo?: { validTo?: string }
): Promise<DomainRiskResult> {
    // Run all checks in parallel
    const [whoisData, dnsSecurity, typosquatting] = await Promise.all([
        getWhoisData(domain),
        checkDnsSecurity(domain),
        detectTyposquatting(domain)
    ]);

    // Process WHOIS expiry
    const daysUntilExpiry = calculateDaysUntilExpiry(whoisData.expiresAt);
    let domainStatus: 'ok' | 'warning' | 'critical' | 'unknown' = 'unknown';

    if (daysUntilExpiry !== null) {
        if (daysUntilExpiry < 30) {
            domainStatus = 'critical';
        } else if (daysUntilExpiry < 90) {
            domainStatus = 'warning';
        } else {
            domainStatus = 'ok';
        }
    }

    // Process SSL expiry
    let sslDaysUntilExpiry: number | null = null;
    let sslStatus: 'ok' | 'warning' | 'critical' = 'ok';
    let sslExpiresAt: string | null = null;

    if (sslInfo?.validTo) {
        sslExpiresAt = sslInfo.validTo;
        sslDaysUntilExpiry = calculateDaysUntilExpiry(sslInfo.validTo);

        if (sslDaysUntilExpiry !== null) {
            if (sslDaysUntilExpiry < 14) {
                sslStatus = 'critical';
            } else if (sslDaysUntilExpiry < 30) {
                sslStatus = 'warning';
            }
        }
    }

    // Assess phishing risk
    const phishingRisk = assessPhishingRisk(typosquatting.domains);

    // Calculate overall risk
    let overallRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';

    if (domainStatus === 'critical' || sslStatus === 'critical') {
        overallRisk = 'critical';
    } else if (domainStatus === 'warning' || sslStatus === 'warning' || typosquatting.detected >= 5) {
        overallRisk = 'high';
    } else if (typosquatting.detected >= 3 || dnsSecurity.score < 50) {
        overallRisk = 'medium';
    }

    // Calculate score (0-100)
    let score = 100;

    // Domain expiry penalties
    if (daysUntilExpiry !== null) {
        if (daysUntilExpiry < 30) score -= 20;
        else if (daysUntilExpiry < 90) score -= 10;
    }

    // SSL expiry penalties
    if (sslDaysUntilExpiry !== null) {
        if (sslDaysUntilExpiry < 14) score -= 15;
        else if (sslDaysUntilExpiry < 30) score -= 8;
    }

    // DNS security penalties
    score -= Math.round((100 - dnsSecurity.score) * 0.2);

    // Typosquatting penalties
    const highRiskTypos = typosquatting.domains.filter(d => d.risk === 'high').length;
    score -= Math.min(highRiskTypos * 5, 15);

    score = Math.max(0, Math.min(100, score));

    return {
        domainExpiry: {
            expiresAt: whoisData.expiresAt,
            daysUntilExpiry,
            registrar: whoisData.registrar,
            status: domainStatus
        },
        sslExpiry: {
            expiresAt: sslExpiresAt,
            daysUntilExpiry: sslDaysUntilExpiry,
            status: sslStatus
        },
        dnsSecurity,
        typosquatting,
        phishingRisk,
        overallRisk,
        score
    };
}
