// Compliance Drift Detection - Track privacy changes over time
// Compares current scan results with historical data to detect changes

export interface DriftChange {
    type: 'improvement' | 'regression' | 'neutral';
    category: string;
    field: string;
    previousValue: string | number | boolean;
    currentValue: string | number | boolean;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
    timestamp: string;
}

export interface DriftReport {
    hasChanges: boolean;
    overallTrend: 'improving' | 'declining' | 'stable';
    scoreDelta: number;
    changes: DriftChange[];
    summary: string;
    alertLevel: 'none' | 'info' | 'warning' | 'critical';
}

interface ScanSnapshot {
    score: number;
    timestamp: string;
    issues: {
        consentBanner: boolean;
        privacyPolicy: boolean;
        https: boolean;
        cookies: { count: number; undeclared: number };
        trackers: string[];
        legalMentions: boolean;
        dpoContact: boolean;
        dataDeleteLink: boolean;
        cookiePolicy: boolean;
        secureforms: boolean;
        optOutMechanism: boolean;
    };
    vendorRisks?: { name: string; riskScore: number }[];
}

// Detect changes between two scans
export function detectComplianceDrift(
    previousScan: ScanSnapshot | null,
    currentScan: ScanSnapshot
): DriftReport {
    const changes: DriftChange[] = [];
    const currentTime = new Date().toISOString();

    // If no previous scan, return neutral report
    if (!previousScan) {
        return {
            hasChanges: false,
            overallTrend: 'stable',
            scoreDelta: 0,
            changes: [],
            summary: 'First scan - no historical data for comparison.',
            alertLevel: 'none',
        };
    }

    // Score change
    const scoreDelta = currentScan.score - previousScan.score;
    if (scoreDelta !== 0) {
        changes.push({
            type: scoreDelta > 0 ? 'improvement' : 'regression',
            category: 'Overall',
            field: 'Privacy Score',
            previousValue: previousScan.score,
            currentValue: currentScan.score,
            impact: scoreDelta > 0 ? 'positive' : 'negative',
            description: scoreDelta > 0
                ? `Score improved from ${previousScan.score} to ${currentScan.score} (+${scoreDelta} points)`
                : `Score dropped from ${previousScan.score} to ${currentScan.score} (${scoreDelta} points)`,
            timestamp: currentTime,
        });
    }

    // Boolean compliance checks
    const booleanChecks = [
        { key: 'consentBanner', label: 'Cookie Consent Banner', category: 'Consent' },
        { key: 'privacyPolicy', label: 'Privacy Policy', category: 'Legal' },
        { key: 'https', label: 'HTTPS Encryption', category: 'Security' },
        { key: 'legalMentions', label: 'Legal Mentions', category: 'Legal' },
        { key: 'dpoContact', label: 'DPO Contact', category: 'Legal' },
        { key: 'dataDeleteLink', label: 'Data Deletion Link', category: 'Rights' },
        { key: 'cookiePolicy', label: 'Cookie Policy', category: 'Consent' },
        { key: 'secureforms', label: 'Form Consent Checkbox', category: 'Consent' },
        { key: 'optOutMechanism', label: 'Opt-out Mechanism', category: 'Rights' },
    ];

    for (const check of booleanChecks) {
        const prevValue = previousScan.issues[check.key as keyof typeof previousScan.issues];
        const currValue = currentScan.issues[check.key as keyof typeof currentScan.issues];

        if (typeof prevValue === 'boolean' && typeof currValue === 'boolean' && prevValue !== currValue) {
            changes.push({
                type: currValue ? 'improvement' : 'regression',
                category: check.category,
                field: check.label,
                previousValue: prevValue,
                currentValue: currValue,
                impact: currValue ? 'positive' : 'negative',
                description: currValue
                    ? `${check.label} was ADDED ✓`
                    : `${check.label} was REMOVED ✗`,
                timestamp: currentTime,
            });
        }
    }

    // Cookie changes
    if (previousScan.issues.cookies && currentScan.issues.cookies) {
        const prevCookies = previousScan.issues.cookies.count;
        const currCookies = currentScan.issues.cookies.count;
        const prevUndeclared = previousScan.issues.cookies.undeclared;
        const currUndeclared = currentScan.issues.cookies.undeclared;

        if (currCookies !== prevCookies) {
            const delta = currCookies - prevCookies;
            changes.push({
                type: delta > 0 ? 'neutral' : 'improvement',
                category: 'Cookies',
                field: 'Total Cookies',
                previousValue: prevCookies,
                currentValue: currCookies,
                impact: delta > 0 ? 'negative' : 'positive',
                description: delta > 0
                    ? `${delta} new cookie(s) detected (${prevCookies} → ${currCookies})`
                    : `${Math.abs(delta)} cookie(s) removed (${prevCookies} → ${currCookies})`,
                timestamp: currentTime,
            });
        }

        if (currUndeclared !== prevUndeclared) {
            const delta = currUndeclared - prevUndeclared;
            changes.push({
                type: delta > 0 ? 'regression' : 'improvement',
                category: 'Cookies',
                field: 'Undeclared Cookies',
                previousValue: prevUndeclared,
                currentValue: currUndeclared,
                impact: delta > 0 ? 'negative' : 'positive',
                description: delta > 0
                    ? `${delta} new undeclared cookie(s) (${prevUndeclared} → ${currUndeclared})`
                    : `${Math.abs(delta)} cookie(s) now declared (${prevUndeclared} → ${currUndeclared})`,
                timestamp: currentTime,
            });
        }
    }

    // Tracker changes
    if (previousScan.issues.trackers && currentScan.issues.trackers) {
        const prevTrackers = new Set(previousScan.issues.trackers);
        const currTrackers = new Set(currentScan.issues.trackers);

        // New trackers added
        const newTrackers = [...currTrackers].filter(t => !prevTrackers.has(t));
        if (newTrackers.length > 0) {
            changes.push({
                type: 'regression',
                category: 'Trackers',
                field: 'New Trackers Added',
                previousValue: previousScan.issues.trackers.length,
                currentValue: currentScan.issues.trackers.length,
                impact: 'negative',
                description: `New tracker(s) added: ${newTrackers.join(', ')}`,
                timestamp: currentTime,
            });
        }

        // Trackers removed
        const removedTrackers = [...prevTrackers].filter(t => !currTrackers.has(t));
        if (removedTrackers.length > 0) {
            changes.push({
                type: 'improvement',
                category: 'Trackers',
                field: 'Trackers Removed',
                previousValue: previousScan.issues.trackers.length,
                currentValue: currentScan.issues.trackers.length,
                impact: 'positive',
                description: `Tracker(s) removed: ${removedTrackers.join(', ')}`,
                timestamp: currentTime,
            });
        }
    }

    // Vendor risk changes
    if (previousScan.vendorRisks && currentScan.vendorRisks) {
        const prevVendors = new Map(previousScan.vendorRisks.map(v => [v.name, v.riskScore]));
        const currVendors = new Map(currentScan.vendorRisks?.map(v => [v.name, v.riskScore]) || []);

        // New high-risk vendors
        const newHighRisk = [...currVendors.entries()]
            .filter(([name, score]) => score >= 7 && !prevVendors.has(name))
            .map(([name]) => name);

        if (newHighRisk.length > 0) {
            changes.push({
                type: 'regression',
                category: 'Vendors',
                field: 'High-Risk Vendors Added',
                previousValue: previousScan.vendorRisks.filter(v => v.riskScore >= 7).length,
                currentValue: currentScan.vendorRisks?.filter(v => v.riskScore >= 7).length || 0,
                impact: 'negative',
                description: `New high-risk vendor(s): ${newHighRisk.join(', ')}`,
                timestamp: currentTime,
            });
        }
    }

    // Determine overall trend
    let overallTrend: 'improving' | 'declining' | 'stable';
    const positiveChanges = changes.filter(c => c.impact === 'positive').length;
    const negativeChanges = changes.filter(c => c.impact === 'negative').length;

    if (positiveChanges > negativeChanges) {
        overallTrend = 'improving';
    } else if (negativeChanges > positiveChanges) {
        overallTrend = 'declining';
    } else {
        overallTrend = 'stable';
    }

    // Determine alert level
    let alertLevel: 'none' | 'info' | 'warning' | 'critical';
    if (changes.length === 0) {
        alertLevel = 'none';
    } else if (scoreDelta < -15 || negativeChanges >= 3) {
        alertLevel = 'critical';
    } else if (scoreDelta < -5 || negativeChanges >= 2) {
        alertLevel = 'warning';
    } else {
        alertLevel = 'info';
    }

    // Generate summary
    let summary: string;
    if (changes.length === 0) {
        summary = 'No compliance changes detected since last scan.';
    } else if (overallTrend === 'improving') {
        summary = `${changes.length} change(s) detected. Overall trend: IMPROVING (+${positiveChanges} improvements, ${negativeChanges} regressions)`;
    } else if (overallTrend === 'declining') {
        summary = `⚠️ ${changes.length} change(s) detected. Overall trend: DECLINING (${positiveChanges} improvements, +${negativeChanges} regressions)`;
    } else {
        summary = `${changes.length} change(s) detected with mixed impact.`;
    }

    return {
        hasChanges: changes.length > 0,
        overallTrend,
        scoreDelta,
        changes: changes.sort((a, b) => {
            // Sort by impact (negative first), then by type
            if (a.impact !== b.impact) {
                return a.impact === 'negative' ? -1 : 1;
            }
            return 0;
        }),
        summary,
        alertLevel,
    };
}

// Get trend icon
export function getTrendIcon(trend: 'improving' | 'declining' | 'stable'): string {
    switch (trend) {
        case 'improving': return '📈';
        case 'declining': return '📉';
        case 'stable': return '➡️';
    }
}

// Get change type color
export function getChangeColor(type: 'improvement' | 'regression' | 'neutral'): string {
    switch (type) {
        case 'improvement': return '#16a34a'; // green
        case 'regression': return '#dc2626';  // red
        case 'neutral': return '#6b7280';     // gray
    }
}
