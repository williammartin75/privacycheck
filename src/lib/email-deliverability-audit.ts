/**
 * Email Deliverability Audit - SPF, DKIM, DMARC Deep Analysis
 * Analyzes email configuration to estimate deliverability and identify issues
 * For PrivacyChecker Pro/Pro+ users
 */

import dns from 'dns';
import { promisify } from 'util';

const resolveTxt = promisify(dns.resolveTxt);
const resolveMx = promisify(dns.resolveMx);

// ============ INTERFACES ============

export interface EmailDeliverabilityResult {
    score: number; // 0-100 deliverability score
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    spf: SpfAnalysis;
    dkim: DkimAnalysis;
    dmarc: DmarcAnalysis;
    mxRecords: MxAnalysis;
    alerts: EmailAlert[];
    recommendations: EmailRecommendation[];
    summary: string;
}

export interface SpfAnalysis {
    exists: boolean;
    record: string | null;
    policy: 'hardfail' | 'softfail' | 'neutral' | 'pass' | 'none';
    lookupCount: number;
    maxLookups: number;
    includes: string[];
    mechanisms: string[];
    issues: string[];
    score: number; // 0-25
}

export interface DkimAnalysis {
    exists: boolean;
    selectorsFound: string[];
    selectorsTested: string[];
    keyLength: 'unknown' | 'weak' | 'standard' | 'strong';
    issues: string[];
    score: number; // 0-25
}

export interface DmarcAnalysis {
    exists: boolean;
    record: string | null;
    policy: 'none' | 'quarantine' | 'reject' | 'unknown';
    subdomainPolicy: 'none' | 'quarantine' | 'reject' | 'inherit';
    percentage: number;
    reportingEnabled: boolean;
    ruaEmail: string | null;
    rufEmail: string | null;
    issues: string[];
    score: number; // 0-25
}

export interface MxAnalysis {
    exists: boolean;
    records: { priority: number; exchange: string }[];
    provider: string | null;
    issues: string[];
    score: number; // 0-25
}

export interface EmailAlert {
    severity: 'critical' | 'warning' | 'info';
    provider: 'gmail' | 'outlook' | 'yahoo' | 'all';
    message: string;
}

export interface EmailRecommendation {
    priority: 'high' | 'medium' | 'low';
    category: 'spf' | 'dkim' | 'dmarc' | 'general';
    title: string;
    description: string;
    impact: string;
}

// ============ EMAIL PROVIDERS DETECTION ============

const EMAIL_PROVIDERS: Record<string, string> = {
    'google.com': 'Google Workspace',
    'googlemail.com': 'Gmail',
    'outlook.com': 'Microsoft 365',
    'protection.outlook.com': 'Microsoft 365',
    'pphosted.com': 'Proofpoint',
    'mimecast.com': 'Mimecast',
    'messagelabs.com': 'Symantec',
    'secureserver.net': 'GoDaddy',
    'zoho.com': 'Zoho Mail',
    'mailgun.org': 'Mailgun',
    'sendgrid.net': 'SendGrid',
    'amazonses.com': 'Amazon SES',
    'mailchimp.com': 'Mailchimp',
    'ovh.net': 'OVH',
    'gandi.net': 'Gandi',
};

// ============ SPF ANALYSIS ============

async function analyzeSpf(domain: string): Promise<SpfAnalysis> {
    const result: SpfAnalysis = {
        exists: false,
        record: null,
        policy: 'none',
        lookupCount: 0,
        maxLookups: 10,
        includes: [],
        mechanisms: [],
        issues: [],
        score: 0,
    };

    try {
        const txtRecords = await resolveTxt(domain).catch(() => []);

        for (const record of txtRecords) {
            const txt = record.join('');
            if (txt.startsWith('v=spf1')) {
                result.exists = true;
                result.record = txt;

                // Parse policy (all mechanism)
                if (txt.includes('-all')) {
                    result.policy = 'hardfail';
                    result.score += 25;
                } else if (txt.includes('~all')) {
                    result.policy = 'softfail';
                    result.score += 15;
                    result.issues.push('Using ~all (softfail) instead of -all (hardfail)');
                } else if (txt.includes('?all')) {
                    result.policy = 'neutral';
                    result.score += 5;
                    result.issues.push('Using ?all (neutral) - provides no protection');
                } else if (txt.includes('+all')) {
                    result.policy = 'pass';
                    result.score += 0;
                    result.issues.push('CRITICAL: +all allows anyone to send as your domain');
                }

                // Count DNS lookups (includes, a, mx, ptr, exists, redirect)
                const includeMatches = txt.match(/include:/g) || [];
                const aMatches = txt.match(/\ba:/g) || [];
                const mxMatches = txt.match(/\bmx:/g) || [];
                const ptrMatches = txt.match(/\bptr/g) || [];
                const existsMatches = txt.match(/exists:/g) || [];
                const redirectMatches = txt.match(/redirect=/g) || [];

                result.lookupCount = includeMatches.length + aMatches.length +
                    mxMatches.length + ptrMatches.length + existsMatches.length +
                    redirectMatches.length;

                if (result.lookupCount > 10) {
                    result.issues.push(`Too many DNS lookups (${result.lookupCount}/10 max) - will cause SPF failures`);
                    result.score = Math.max(0, result.score - 10);
                }

                // Extract includes
                const includeRegex = /include:([^\s]+)/g;
                let match;
                while ((match = includeRegex.exec(txt)) !== null) {
                    result.includes.push(match[1]);
                }

                // Extract mechanisms
                const mechRegex = /(ip4:[^\s]+|ip6:[^\s]+|a:[^\s]+|mx:[^\s]+)/g;
                while ((match = mechRegex.exec(txt)) !== null) {
                    result.mechanisms.push(match[1]);
                }

                break;
            }
        }

        if (!result.exists) {
            result.issues.push('No SPF record found - emails may be marked as spam');
        }
    } catch {
        result.issues.push('Failed to query SPF record');
    }

    return result;
}

// ============ DKIM ANALYSIS ============

async function analyzeDkim(domain: string): Promise<DkimAnalysis> {
    const result: DkimAnalysis = {
        exists: false,
        selectorsFound: [],
        selectorsTested: [],
        keyLength: 'unknown',
        issues: [],
        score: 0,
    };

    // Common DKIM selectors used by popular providers
    const selectors = [
        'default', 'google', 'selector1', 'selector2', // Microsoft
        'k1', 'k2', 'k3', // Generic
        'dkim', 'mail', 'email',
        's1', 's2', 'sig1',
        'mandrill', 'mailchimp', 'sendgrid', // ESPs
        'pm', 'protonmail', // ProtonMail
        'mxvault', 'everlytickey1', 'turbo-smtp',
        'resend', // Resend.com
        'improvmx', 'mx', // ImprovMX
        'amazonses', 'ses', // Amazon SES
    ];

    result.selectorsTested = selectors;

    for (const selector of selectors) {
        try {
            const dkimRecords = await resolveTxt(`${selector}._domainkey.${domain}`);
            if (dkimRecords.length > 0) {
                result.exists = true;
                result.selectorsFound.push(selector);

                // Check key length from record
                const record = dkimRecords[0].join('');
                if (record.includes('p=')) {
                    const keyMatch = record.match(/p=([^;]+)/);
                    if (keyMatch) {
                        const keyLength = keyMatch[1].length;
                        if (keyLength < 200) {
                            result.keyLength = 'weak';
                            result.issues.push('DKIM key appears to be 1024-bit or less - consider upgrading to 2048-bit');
                        } else if (keyLength >= 400) {
                            result.keyLength = 'strong';
                        } else {
                            result.keyLength = 'standard';
                        }
                    }
                }
            }
        } catch {
            // Selector not found, continue
        }
    }

    if (result.exists) {
        result.score = 25;
        if (result.keyLength === 'weak') {
            result.score -= 5;
        }
    } else {
        result.issues.push('No DKIM records found - emails lack authentication signature');
    }

    return result;
}

// ============ DMARC ANALYSIS ============

async function analyzeDmarc(domain: string): Promise<DmarcAnalysis> {
    const result: DmarcAnalysis = {
        exists: false,
        record: null,
        policy: 'unknown',
        subdomainPolicy: 'inherit',
        percentage: 100,
        reportingEnabled: false,
        ruaEmail: null,
        rufEmail: null,
        issues: [],
        score: 0,
    };

    try {
        const dmarcRecords = await resolveTxt(`_dmarc.${domain}`).catch(() => []);

        for (const record of dmarcRecords) {
            const txt = record.join('');
            if (txt.includes('v=DMARC1')) {
                result.exists = true;
                result.record = txt;

                // Parse policy
                const policyMatch = txt.match(/;\s*p=(\w+)/);
                if (policyMatch) {
                    const policy = policyMatch[1].toLowerCase();
                    if (policy === 'reject') {
                        result.policy = 'reject';
                        result.score += 25;
                    } else if (policy === 'quarantine') {
                        result.policy = 'quarantine';
                        result.score += 20;
                        result.issues.push('Consider upgrading to p=reject for maximum protection');
                    } else if (policy === 'none') {
                        result.policy = 'none';
                        result.score += 5;
                        result.issues.push('DMARC policy is p=none (monitoring only) - no protection against spoofing');
                    }
                }

                // Parse subdomain policy
                const spMatch = txt.match(/;\s*sp=(\w+)/);
                if (spMatch) {
                    result.subdomainPolicy = spMatch[1].toLowerCase() as DmarcAnalysis['subdomainPolicy'];
                }

                // Parse percentage
                const pctMatch = txt.match(/;\s*pct=(\d+)/);
                if (pctMatch) {
                    result.percentage = parseInt(pctMatch[1], 10);
                    if (result.percentage < 100) {
                        result.issues.push(`DMARC only applies to ${result.percentage}% of emails`);
                    }
                }

                // Check for reporting
                const ruaMatch = txt.match(/;\s*rua=mailto:([^;]+)/);
                if (ruaMatch) {
                    result.reportingEnabled = true;
                    result.ruaEmail = ruaMatch[1];
                }

                const rufMatch = txt.match(/;\s*ruf=mailto:([^;]+)/);
                if (rufMatch) {
                    result.rufEmail = rufMatch[1];
                }

                if (!result.reportingEnabled) {
                    result.issues.push('No DMARC reporting configured (rua) - you won\'t receive failure reports');
                }

                break;
            }
        }

        if (!result.exists) {
            result.issues.push('No DMARC record found - domain can be spoofed');
        }
    } catch {
        result.issues.push('Failed to query DMARC record');
    }

    return result;
}

// ============ MX ANALYSIS ============

async function analyzeMx(domain: string): Promise<MxAnalysis> {
    const result: MxAnalysis = {
        exists: false,
        records: [],
        provider: null,
        issues: [],
        score: 0,
    };

    try {
        const mxRecords = await resolveMx(domain).catch(() => []);

        if (mxRecords.length > 0) {
            result.exists = true;
            result.score = 25;
            result.records = mxRecords.map(r => ({
                priority: r.priority,
                exchange: r.exchange,
            }));

            // Detect email provider
            for (const record of mxRecords) {
                const exchange = record.exchange.toLowerCase();
                for (const [pattern, provider] of Object.entries(EMAIL_PROVIDERS)) {
                    if (exchange.includes(pattern)) {
                        result.provider = provider;
                        break;
                    }
                }
                if (result.provider) break;
            }
        } else {
            result.issues.push('No MX records found - domain cannot receive emails');
        }
    } catch {
        result.issues.push('Failed to query MX records');
    }

    return result;
}

// ============ GENERATE ALERTS ============

function generateAlerts(
    spf: SpfAnalysis,
    dkim: DkimAnalysis,
    dmarc: DmarcAnalysis
): EmailAlert[] {
    const alerts: EmailAlert[] = [];

    // Critical: No SPF or DKIM
    if (!spf.exists && !dkim.exists) {
        alerts.push({
            severity: 'critical',
            provider: 'gmail',
            message: 'Gmail will likely reject or spam your emails (missing SPF and DKIM)',
        });
        alerts.push({
            severity: 'critical',
            provider: 'outlook',
            message: 'Outlook/Microsoft 365 will likely reject your emails',
        });
    }

    // SPF +all is dangerous
    if (spf.policy === 'pass') {
        alerts.push({
            severity: 'critical',
            provider: 'all',
            message: 'Your domain can be spoofed by anyone (+all in SPF)',
        });
    }

    // DMARC none
    if (dmarc.exists && dmarc.policy === 'none') {
        alerts.push({
            severity: 'warning',
            provider: 'all',
            message: 'DMARC p=none provides no protection - anyone can still spoof your domain',
        });
    }

    // No DMARC
    if (!dmarc.exists && spf.exists && dkim.exists) {
        alerts.push({
            severity: 'warning',
            provider: 'gmail',
            message: 'Gmail recommends DMARC for all senders as of February 2024',
        });
    }

    // Too many SPF lookups
    if (spf.lookupCount > 10) {
        alerts.push({
            severity: 'critical',
            provider: 'all',
            message: `SPF has ${spf.lookupCount} DNS lookups (max 10) - authentication will fail`,
        });
    }

    // Weak DKIM key
    if (dkim.keyLength === 'weak') {
        alerts.push({
            severity: 'warning',
            provider: 'all',
            message: 'DKIM key is 1024-bit or less - upgrade to 2048-bit recommended',
        });
    }

    return alerts;
}

// ============ GENERATE RECOMMENDATIONS ============

function generateRecommendations(
    spf: SpfAnalysis,
    dkim: DkimAnalysis,
    dmarc: DmarcAnalysis,
    mx: MxAnalysis
): EmailRecommendation[] {
    const recommendations: EmailRecommendation[] = [];

    // SPF recommendations
    if (!spf.exists) {
        recommendations.push({
            priority: 'high',
            category: 'spf',
            title: 'Add SPF Record',
            description: 'Create an SPF TXT record to authorize your email servers',
            impact: 'Reduces chance of emails being marked as spam by 40%',
        });
    } else if (spf.policy !== 'hardfail') {
        recommendations.push({
            priority: 'medium',
            category: 'spf',
            title: 'Upgrade SPF to -all',
            description: 'Change ~all or ?all to -all for strict enforcement',
            impact: 'Blocks unauthorized senders from using your domain',
        });
    }

    // DKIM recommendations
    if (!dkim.exists) {
        recommendations.push({
            priority: 'high',
            category: 'dkim',
            title: 'Configure DKIM Signing',
            description: `Set up DKIM with your email provider${mx.provider ? ` (${mx.provider})` : ''}`,
            impact: 'Gmail and Outlook require DKIM for reliable delivery',
        });
    } else if (dkim.keyLength === 'weak') {
        recommendations.push({
            priority: 'medium',
            category: 'dkim',
            title: 'Upgrade DKIM Key to 2048-bit',
            description: 'Current key length is 1024-bit, which is considered weak',
            impact: 'Improves security and future-proofs your email authentication',
        });
    }

    // DMARC recommendations
    if (!dmarc.exists) {
        recommendations.push({
            priority: 'high',
            category: 'dmarc',
            title: 'Add DMARC Record',
            description: 'Start with p=none and rua= for reporting',
            impact: 'Required by Gmail for bulk senders since February 2024',
        });
    } else if (dmarc.policy === 'none') {
        recommendations.push({
            priority: 'medium',
            category: 'dmarc',
            title: 'Upgrade DMARC to p=quarantine',
            description: 'After monitoring, upgrade from p=none to p=quarantine',
            impact: 'Starts protecting your domain from spoofing',
        });
    } else if (dmarc.policy === 'quarantine') {
        recommendations.push({
            priority: 'low',
            category: 'dmarc',
            title: 'Consider p=reject',
            description: 'Upgrade to p=reject for maximum protection',
            impact: 'Completely blocks spoofed emails from reaching recipients',
        });
    }

    if (dmarc.exists && !dmarc.reportingEnabled) {
        recommendations.push({
            priority: 'medium',
            category: 'dmarc',
            title: 'Enable DMARC Reporting',
            description: 'Add rua=mailto:reports@yourdomain.com to receive reports',
            impact: 'Visibility into who is sending email as your domain',
        });
    }

    return recommendations.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

// ============ MAIN ANALYSIS FUNCTION ============

export async function analyzeEmailDeliverability(domain: string): Promise<EmailDeliverabilityResult> {
    // Run all analyses in parallel
    const [spf, dkim, dmarc, mx] = await Promise.all([
        analyzeSpf(domain),
        analyzeDkim(domain),
        analyzeDmarc(domain),
        analyzeMx(domain),
    ]);

    // Calculate overall score
    const score = spf.score + dkim.score + dmarc.score + mx.score;

    // Determine grade
    let grade: EmailDeliverabilityResult['grade'];
    if (score >= 90) grade = 'A';
    else if (score >= 75) grade = 'B';
    else if (score >= 50) grade = 'C';
    else if (score >= 25) grade = 'D';
    else grade = 'F';

    // Generate alerts and recommendations
    const alerts = generateAlerts(spf, dkim, dmarc);
    const recommendations = generateRecommendations(spf, dkim, dmarc, mx);

    // Generate summary
    let summary: string;
    if (score >= 90) {
        summary = 'Excellent email configuration. Your emails should have high deliverability.';
    } else if (score >= 75) {
        summary = 'Good email configuration with minor improvements possible.';
    } else if (score >= 50) {
        summary = 'Average configuration. Some emails may be marked as spam.';
    } else if (score >= 25) {
        summary = 'Poor configuration. Many emails will likely be rejected or marked as spam.';
    } else {
        summary = 'Critical issues detected. Emails will likely be rejected by major providers.';
    }

    return {
        score,
        grade,
        spf,
        dkim,
        dmarc,
        mxRecords: mx,
        alerts,
        recommendations,
        summary,
    };
}
