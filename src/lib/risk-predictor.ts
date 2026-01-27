// AI Risk Predictor - Estimate GDPR/CCPA Fines based on violations
// Based on real GDPR enforcement data and fine calculations

export interface RiskPrediction {
    minFine: number;
    maxFine: number;
    avgFine: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    probability: number; // 0-100 chance of enforcement action
    factors: RiskFactor[];
    recommendation: string;
}

export interface RiskFactor {
    issue: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    fineContribution: number; // Estimated € contribution to fine
    gdprArticle?: string;
    description: string;
}

// GDPR fine calculation bases (2024 enforcement data)
const GDPR_FINE_BASES = {
    // Article 83(4) - Up to €10M or 2% of annual turnover
    tier1: {
        minPercent: 0.1,
        maxPercent: 2,
        maxFixed: 10_000_000,
    },
    // Article 83(5) - Up to €20M or 4% of annual turnover
    tier2: {
        minPercent: 0.5,
        maxPercent: 4,
        maxFixed: 20_000_000,
    },
};

// Average company revenue estimation based on website indicators
function estimateCompanySize(indicators: {
    hasEcommerce?: boolean;
    isEnterprise?: boolean;
    employeeCount?: number;
    trafficEstimate?: 'low' | 'medium' | 'high';
}): 'micro' | 'small' | 'medium' | 'large' | 'enterprise' {
    if (indicators.isEnterprise || (indicators.employeeCount && indicators.employeeCount > 250)) {
        return 'enterprise';
    }
    if (indicators.hasEcommerce && indicators.trafficEstimate === 'high') {
        return 'large';
    }
    if (indicators.hasEcommerce) {
        return 'medium';
    }
    if (indicators.trafficEstimate === 'medium') {
        return 'small';
    }
    return 'micro';
}

// Revenue estimates by company size (€)
const REVENUE_ESTIMATES: Record<string, { min: number; max: number; avg: number }> = {
    micro: { min: 50_000, max: 500_000, avg: 200_000 },
    small: { min: 500_000, max: 2_000_000, avg: 1_000_000 },
    medium: { min: 2_000_000, max: 10_000_000, avg: 5_000_000 },
    large: { min: 10_000_000, max: 50_000_000, avg: 25_000_000 },
    enterprise: { min: 50_000_000, max: 500_000_000, avg: 150_000_000 },
};

// Calculate risk prediction based on audit results
export function calculateRiskPrediction(auditData: {
    score: number;
    issues: {
        consentBanner: boolean;
        privacyPolicy: boolean;
        https: boolean;
        cookies: { count: number; undeclared: number };
        trackers: string[];
        legalMentions: boolean;
        dpoContact: boolean;
        dataDeleteLink: boolean;
        securityHeaders?: { csp: boolean; xFrameOptions: boolean };
        vendorRisks?: { riskScore: number; gdprCompliant: boolean }[];
        dataBreaches?: { count: number }[];
        exposedEmails?: string[];
    };
    companyIndicators?: {
        hasEcommerce?: boolean;
        isEnterprise?: boolean;
        trafficEstimate?: 'low' | 'medium' | 'high';
    };
}): RiskPrediction {
    const factors: RiskFactor[] = [];
    let totalRiskScore = 0;
    let probability = 10; // Base 10% probability

    // 1. No consent banner - CRITICAL (GDPR Art. 6, 7)
    if (!auditData.issues.consentBanner) {
        factors.push({
            issue: 'No Cookie Consent Banner',
            severity: 'critical',
            fineContribution: 50_000,
            gdprArticle: 'Art. 6, 7',
            description: 'Processing data without valid consent is a Tier 2 violation.',
        });
        totalRiskScore += 30;
        probability += 25;
    }

    // 2. No privacy policy - HIGH
    if (!auditData.issues.privacyPolicy) {
        factors.push({
            issue: 'Missing Privacy Policy',
            severity: 'high',
            fineContribution: 25_000,
            gdprArticle: 'Art. 13, 14',
            description: 'Failure to provide required information to data subjects.',
        });
        totalRiskScore += 20;
        probability += 15;
    }

    // 3. No HTTPS - HIGH
    if (!auditData.issues.https) {
        factors.push({
            issue: 'No HTTPS Encryption',
            severity: 'high',
            fineContribution: 30_000,
            gdprArticle: 'Art. 32',
            description: 'Inadequate security measures for data protection.',
        });
        totalRiskScore += 20;
        probability += 10;
    }

    // 4. Undeclared cookies - MEDIUM to HIGH
    if (auditData.issues.cookies.undeclared > 0) {
        const severity = auditData.issues.cookies.undeclared > 5 ? 'high' : 'medium';
        factors.push({
            issue: `${auditData.issues.cookies.undeclared} Undeclared Cookies`,
            severity,
            fineContribution: auditData.issues.cookies.undeclared * 5_000,
            gdprArticle: 'Art. 6, ePrivacy',
            description: 'Cookies set without disclosure or consent.',
        });
        totalRiskScore += auditData.issues.cookies.undeclared * 3;
        probability += auditData.issues.cookies.undeclared * 2;
    }

    // 5. Third-party trackers without consent - HIGH
    if (auditData.issues.trackers.length > 0) {
        factors.push({
            issue: `${auditData.issues.trackers.length} Third-Party Trackers`,
            severity: 'high',
            fineContribution: auditData.issues.trackers.length * 10_000,
            gdprArticle: 'Art. 6, 44-49',
            description: 'Third-party tracking without consent, potential international transfers.',
        });
        totalRiskScore += auditData.issues.trackers.length * 5;
        probability += auditData.issues.trackers.length * 3;
    }

    // 6. No legal mentions - MEDIUM
    if (!auditData.issues.legalMentions) {
        factors.push({
            issue: 'Missing Legal Mentions',
            severity: 'medium',
            fineContribution: 10_000,
            description: 'Required company information not disclosed.',
        });
        totalRiskScore += 10;
        probability += 5;
    }

    // 7. No DPO contact - MEDIUM (if required)
    if (!auditData.issues.dpoContact) {
        factors.push({
            issue: 'No DPO Contact Information',
            severity: 'medium',
            fineContribution: 15_000,
            gdprArticle: 'Art. 37-39',
            description: 'Data Protection Officer contact may be required.',
        });
        totalRiskScore += 10;
        probability += 5;
    }

    // 8. No data deletion mechanism - MEDIUM
    if (!auditData.issues.dataDeleteLink) {
        factors.push({
            issue: 'No Data Deletion Mechanism',
            severity: 'medium',
            fineContribution: 20_000,
            gdprArticle: 'Art. 17',
            description: 'Right to erasure not easily exercisable.',
        });
        totalRiskScore += 15;
        probability += 5;
    }

    // 9. High-risk vendors - HIGH
    if (auditData.issues.vendorRisks) {
        const highRiskVendors = auditData.issues.vendorRisks.filter(v => v.riskScore >= 7);
        const nonCompliantVendors = auditData.issues.vendorRisks.filter(v => !v.gdprCompliant);

        if (highRiskVendors.length > 0) {
            factors.push({
                issue: `${highRiskVendors.length} High-Risk Vendors`,
                severity: 'high',
                fineContribution: highRiskVendors.length * 15_000,
                gdprArticle: 'Art. 28, 44-49',
                description: 'Data shared with high-risk third parties.',
            });
            totalRiskScore += highRiskVendors.length * 8;
            probability += highRiskVendors.length * 5;
        }

        if (nonCompliantVendors.length > 0) {
            factors.push({
                issue: `${nonCompliantVendors.length} Non-GDPR Compliant Vendors`,
                severity: 'critical',
                fineContribution: nonCompliantVendors.length * 20_000,
                gdprArticle: 'Art. 44-49',
                description: 'Transferring data to non-compliant processors.',
            });
            totalRiskScore += nonCompliantVendors.length * 12;
            probability += nonCompliantVendors.length * 8;
        }
    }

    // 10. Data breaches - CRITICAL
    if (auditData.issues.dataBreaches && auditData.issues.dataBreaches.length > 0) {
        const totalAffected = auditData.issues.dataBreaches.reduce((sum, b) => sum + b.count, 0);
        factors.push({
            issue: 'Known Data Breach History',
            severity: 'critical',
            fineContribution: Math.min(totalAffected * 10, 500_000),
            gdprArticle: 'Art. 32, 33, 34',
            description: `Domain involved in data breaches affecting ${totalAffected.toLocaleString()} accounts.`,
        });
        totalRiskScore += 40;
        probability += 20;
    }

    // 11. Exposed emails - MEDIUM
    if (auditData.issues.exposedEmails && auditData.issues.exposedEmails.length > 0) {
        factors.push({
            issue: `${auditData.issues.exposedEmails.length} Exposed Email Addresses`,
            severity: 'medium',
            fineContribution: 5_000,
            gdprArticle: 'Art. 32',
            description: 'Personal data (emails) exposed on public pages.',
        });
        totalRiskScore += 5;
        probability += 3;
    }

    // Calculate company size and revenue
    const companySize = estimateCompanySize(auditData.companyIndicators || {});
    const revenue = REVENUE_ESTIMATES[companySize];

    // Calculate fine estimates
    const totalFactorContribution = factors.reduce((sum, f) => sum + f.fineContribution, 0);

    // Apply multipliers based on severity
    let minFine = Math.round(totalFactorContribution * 0.3);
    let maxFine = Math.round(totalFactorContribution * 2);

    // Cap based on GDPR maximums
    const revenueBasedMax = revenue.avg * 0.04; // 4% of revenue
    maxFine = Math.min(maxFine, revenueBasedMax, 20_000_000);

    // Minimum fine floor
    minFine = Math.max(minFine, 1_000);

    // Average fine
    const avgFine = Math.round((minFine + maxFine) / 2);

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (totalRiskScore >= 80) {
        riskLevel = 'critical';
    } else if (totalRiskScore >= 50) {
        riskLevel = 'high';
    } else if (totalRiskScore >= 25) {
        riskLevel = 'medium';
    } else {
        riskLevel = 'low';
    }

    // Cap probability
    probability = Math.min(probability, 95);

    // Generate recommendation
    let recommendation: string;
    if (riskLevel === 'critical') {
        recommendation = 'URGENT: Your site has critical privacy violations. Immediate action required to avoid potential regulatory enforcement and significant fines.';
    } else if (riskLevel === 'high') {
        recommendation = 'Your site has significant privacy issues that could result in regulatory action. We recommend addressing these issues within 30 days.';
    } else if (riskLevel === 'medium') {
        recommendation = 'Some privacy improvements are needed. Consider implementing fixes within 60-90 days to reduce compliance risk.';
    } else {
        recommendation = 'Your site has good privacy practices. Continue monitoring and maintaining compliance.';
    }

    return {
        minFine,
        maxFine,
        avgFine,
        riskLevel,
        probability,
        factors: factors.sort((a, b) => b.fineContribution - a.fineContribution),
        recommendation,
    };
}

// Format currency for display
export function formatFine(amount: number): string {
    if (amount >= 1_000_000) {
        return `€${(amount / 1_000_000).toFixed(1)}M`;
    }
    if (amount >= 1_000) {
        return `€${(amount / 1_000).toFixed(0)}k`;
    }
    return `€${amount}`;
}

// Get color based on risk level
export function getRiskColor(level: 'low' | 'medium' | 'high' | 'critical'): string {
    switch (level) {
        case 'critical': return '#dc2626'; // red-600
        case 'high': return '#ea580c';     // orange-600
        case 'medium': return '#ca8a04';   // yellow-600
        case 'low': return '#16a34a';      // green-600
    }
}
