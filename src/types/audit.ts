// Audit Types - Extracted from page.tsx
// All types related to privacy audit results

export interface Cookie {
    name: string;
    category: 'necessary' | 'analytics' | 'marketing' | 'preferences' | 'unknown';
    description: string;
    provider: string;
}

export interface PageScan {
    url: string;
    title: string;
    cookiesFound: number;
    trackersFound: string[];
}

export interface AuditResult {
    score: number;
    domain: string;
    pagesScanned: number;
    pages: PageScan[];
    issues: {
        cookies: {
            count: number;
            undeclared: number;
            list: Cookie[];
        };
        consentBanner: boolean;
        privacyPolicy: boolean;
        https: boolean;
        trackers: string[];
        legalMentions: boolean;
        dpoContact: boolean;
        dataDeleteLink: boolean;
        secureforms: boolean;
        optOutMechanism: boolean;
        ageVerification: boolean;
        cookiePolicy: boolean;
        // P0 Security modules
        ssl?: {
            valid: boolean;
            hsts: boolean;
            hstsMaxAge: number | null;
        };
        securityHeaders?: {
            csp: boolean;
            xFrameOptions: boolean;
            xContentType: boolean;
            strictTransportSecurity: boolean;
            referrerPolicy: boolean;
            permissionsPolicy: boolean;
        };
        emailSecurity?: {
            spf: boolean;
            dmarc: boolean;
            domain: string;
        };
        // Email Exposure
        exposedEmails?: string[];
        // External Resources
        externalResources?: {
            scripts: { src: string; provider: string }[];
            fonts: { src: string; provider: string }[];
            iframes: { src: string; provider: string }[];
        };
        // Social Trackers
        socialTrackers?: { name: string; risk: 'high' | 'medium' | 'low' }[];
        // Data Breaches
        dataBreaches?: { name: string; date: string; count: number }[];
        // Vendor Risk Assessment
        vendorRisks?: {
            name: string;
            category: string;
            riskScore: number;
            riskLevel: 'low' | 'medium' | 'high' | 'critical';
            jurisdiction: string;
            dataTransfer: string;
            concerns: string[];
            gdprCompliant: boolean;
        }[];
        // Consent Behavior Analysis
        consentBehavior?: {
            detected: boolean;
            hasRejectButton: boolean;
            hasAcceptButton: boolean;
            rejectButtonLabels: string[];
            acceptButtonLabels: string[];
            darkPatterns: {
                type: string;
                description: string;
                severity: 'low' | 'medium' | 'high';
            }[];
            preConsentCookies: {
                name: string;
                category: string;
                droppedBeforeConsent: boolean;
                violation: boolean;
            }[];
            consentProvider: string | null;
            score: number;
            issues: string[];
        };
        // Privacy Policy AI Analysis
        policyAnalysis?: {
            found: boolean;
            policyUrl: string | null;
            lastUpdated: string | null;
            overallScore: number;
            overallStatus: 'compliant' | 'partial' | 'non-compliant' | 'not-found';
            sections: {
                legalBasis: { found: boolean; score: number; status: string; details: string[]; issues: string[] };
                dataRetention: { found: boolean; score: number; status: string; details: string[]; issues: string[] };
                userRights: { found: boolean; score: number; status: string; details: string[]; issues: string[] };
                thirdPartySharing: { found: boolean; score: number; status: string; details: string[]; issues: string[] };
                internationalTransfers: { found: boolean; score: number; status: string; details: string[]; issues: string[] };
                contactInfo: { found: boolean; score: number; status: string; details: string[]; issues: string[] };
                cookiePolicy: { found: boolean; score: number; status: string; details: string[]; issues: string[] };
                childrenPrivacy: { found: boolean; score: number; status: string; details: string[]; issues: string[] };
            };
            missingElements: string[];
            recommendations: string[];
            gdprArticles: { article: string; status: 'compliant' | 'partial' | 'missing' }[];
        };
        // Site-wide Dark Patterns Detection
        darkPatterns?: {
            detected: boolean;
            totalCount: number;
            score: number;
            bySeverity: {
                critical: number;
                high: number;
                medium: number;
                low: number;
            };
            byCategory: Record<string, number>;
            patterns: {
                type: string;
                category: string;
                description: string;
                severity: 'low' | 'medium' | 'high' | 'critical';
                element?: string;
                gdprRelevance: boolean;
                recommendation: string;
            }[];
            gdprViolations: {
                type: string;
                category: string;
                description: string;
                severity: 'low' | 'medium' | 'high' | 'critical';
                gdprRelevance: boolean;
                recommendation: string;
            }[];
            recommendations: string[];
        };
        // Opt-in Forms Analysis
        optInForms?: {
            formsAnalyzed: number;
            totalIssues: number;
            score: number;
            issues: {
                type: 'pre-checked' | 'hidden-consent' | 'bundled-consent' | 'unclear-label' | 'forced-consent';
                description: string;
                severity: 'low' | 'medium' | 'high' | 'critical';
                element?: string;
                recommendation: string;
                gdprArticle?: string;
            }[];
            preCheckedCount: number;
            hiddenConsentCount: number;
            bundledConsentCount: number;
            compliant: boolean;
            recommendations: string[];
        };
        // Cookie Lifespan Analysis
        cookieLifespan?: {
            totalCookiesAnalyzed: number;
            compliantCount: number;
            issuesCount: number;
            score: number;
            issues: {
                name: string;
                currentLifespan: number;
                recommendedLifespan: number;
                severity: 'low' | 'medium' | 'high' | 'critical';
                category: string;
                recommendation: string;
            }[];
            longestCookie: { name: string; days: number } | null;
            averageLifespan: number;
            compliant: boolean;
            recommendations: string[];
        };
        // Fingerprinting Detection
        fingerprinting?: {
            detected: boolean;
            totalTechniques: number;
            score: number;
            issues: {
                type: string;
                description: string;
                severity: 'low' | 'medium' | 'high' | 'critical';
                evidence?: string;
                gdprImpact: string;
                recommendation: string;
            }[];
            byType: {
                canvas: number;
                webgl: number;
                audio: number;
                font: number;
                device: number;
                other: number;
            };
            riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
            recommendations: string[];
        };
        // Security Headers Extended
        securityHeadersExtended?: {
            score: number;
            totalHeaders: number;
            presentCount: number;
            missingCount: number;
            issues: {
                header: string;
                status: 'missing' | 'weak' | 'misconfigured' | 'present';
                severity: 'low' | 'medium' | 'high' | 'critical';
                currentValue?: string;
                recommendation: string;
                privacyImpact: string;
            }[];
            grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
            headers: Record<string, { present: boolean; value?: string }>;
            recommendations: string[];
        };
        // Storage Audit
        storageAudit?: {
            totalItems: number;
            localStorage: { count: number; riskItems: number };
            sessionStorage: { count: number; riskItems: number };
            issues: {
                key: string;
                type: 'localStorage' | 'sessionStorage';
                category: string;
                risk: 'low' | 'medium' | 'high' | 'critical';
                description: string;
                recommendation: string;
            }[];
            score: number;
            compliant: boolean;
            recommendations: string[];
        };
        // Mixed Content
        mixedContent?: {
            detected: boolean;
            totalIssues: number;
            blockedCount: number;
            warningCount: number;
            issues: {
                type: string;
                url: string;
                severity: 'low' | 'medium' | 'high' | 'critical';
                blocked: boolean;
                description: string;
                recommendation: string;
            }[];
            score: number;
            byType: {
                scripts: number;
                styles: number;
                images: number;
                iframes: number;
                fonts: number;
                media: number;
                forms: number;
                other: number;
            };
            recommendations: string[];
        };
        // Form Security
        formSecurity?: {
            totalForms: number;
            secureCount: number;
            issuesCount: number;
            issues: {
                formId?: string;
                type: string;
                severity: 'low' | 'medium' | 'high' | 'critical';
                description: string;
                field?: string;
                recommendation: string;
            }[];
            score: number;
            hasLoginForm: boolean;
            hasPaymentForm: boolean;
            compliant: boolean;
            recommendations: string[];
        };
    };
    regulations: string[];
    scoreBreakdown?: { item: string; points: number; passed: boolean }[];
    // Risk Prediction - GDPR Fine Estimation
    riskPrediction?: {
        minFine: number;
        maxFine: number;
        avgFine: number;
        riskLevel: 'low' | 'medium' | 'high' | 'critical';
        probability: number;
        factors: {
            issue: string;
            severity: 'low' | 'medium' | 'high' | 'critical';
            fineContribution: number;
            gdprArticle?: string;
            description: string;
        }[];
        recommendation: string;
    };
    // Attack Surface Scanner results
    attackSurface?: {
        overallRisk: 'low' | 'medium' | 'high' | 'critical';
        totalFindings: number;
        findings: {
            type: 'dns' | 's3' | 'config' | 'api' | 'subdomain' | 'email' | 'cloud' | 'info';
            severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
            title: string;
            description: string;
            details?: string;
            remediation: string;
        }[];
        recommendations: string[];
    };
}
