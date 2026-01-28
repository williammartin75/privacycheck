import jsPDF from 'jspdf';

interface Cookie {
    name: string;
    category: 'necessary' | 'analytics' | 'marketing' | 'preferences' | 'unknown';
    description: string;
    provider: string;
}

interface AuditResult {
    score: number;
    domain: string;
    pagesScanned: number;
    pages: { url: string; title: string; cookiesFound: number; trackersFound: string[] }[];
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
        ssl?: { valid: boolean; hsts: boolean; hstsMaxAge: number | null };
        securityHeaders?: {
            csp: boolean;
            xFrameOptions: boolean;
            xContentType: boolean;
            strictTransportSecurity: boolean;
            referrerPolicy: boolean;
            permissionsPolicy: boolean;
        };
        emailSecurity?: { spf: boolean; dmarc: boolean; domain: string };
        exposedEmails?: string[];
        externalResources?: {
            scripts: { src: string; provider: string }[];
            fonts: { src: string; provider: string }[];
            iframes: { src: string; provider: string }[];
        };
        socialTrackers?: { name: string; risk: 'high' | 'medium' | 'low' }[];
        dataBreaches?: { name: string; date: string; count: number }[];
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
    };
    regulations: string[];
    scoreBreakdown?: { item: string; points: number; passed: boolean }[];
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
    attackSurface?: {
        overallRisk: 'low' | 'medium' | 'high' | 'critical';
        totalFindings: number;
        findings: { type: string; severity: string; title: string; description: string; remediation: string }[];
        recommendations: string[];
    };
}

// Color palette (matching the new UI)
const COLORS = {
    navy: [15, 23, 42],      // slate-900
    blue: [37, 99, 235],     // blue-600
    lightBlue: [56, 189, 248], // sky-400
    gold: [245, 158, 11],    // amber-500
    gray: [100, 116, 139],   // slate-500
    darkGray: [51, 65, 85],  // slate-700
    lightGray: [241, 245, 249], // slate-100
    green: [34, 197, 94],
    red: [239, 68, 68],
    white: [255, 255, 255],
    black: [0, 0, 0],
};

export function generatePDF(result: AuditResult): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 20;

    const checkNewPage = (neededSpace: number = 30) => {
        if (y + neededSpace > pageHeight - 30) {
            doc.addPage();
            y = 20;
            return true;
        }
        return false;
    };

    const drawSectionHeader = (title: string) => {
        checkNewPage(25);
        doc.setFillColor(COLORS.lightGray[0], COLORS.lightGray[1], COLORS.lightGray[2]);
        doc.rect(15, y - 5, pageWidth - 30, 10, 'F');
        doc.setTextColor(COLORS.navy[0], COLORS.navy[1], COLORS.navy[2]);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 20, y + 2);
        y += 15;
    };

    const drawCheck = (label: string, passed: boolean) => {
        checkNewPage(8);
        const icon = passed ? '✓' : '✗';
        const color = passed ? COLORS.blue : COLORS.gray;
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(icon, 20, y);
        doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(label, 28, y);
        y += 6;
    };

    // ============ HEADER ============
    doc.setFillColor(COLORS.navy[0], COLORS.navy[1], COLORS.navy[2]);
    doc.rect(0, 0, pageWidth, 45, 'F');

    doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('PrivacyChecker', 20, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Privacy Compliance Audit Report', 20, 30);

    // Score badge
    const scoreColor = result.score >= 80 ? COLORS.green : result.score >= 50 ? COLORS.gold : COLORS.red;
    doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.roundedRect(pageWidth - 55, 12, 40, 22, 3, 3, 'F');
    doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`${result.score}/100`, pageWidth - 48, 26);

    y = 55;

    // ============ DOMAIN INFO ============
    doc.setTextColor(COLORS.navy[0], COLORS.navy[1], COLORS.navy[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(result.domain, 20, y);
    y += 8;

    doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} | Pages: ${result.pagesScanned} | ${result.regulations.join(', ')}`, 20, y);
    y += 15;

    // ============ EXECUTIVE SUMMARY ============
    drawSectionHeader('EXECUTIVE SUMMARY');

    doc.setFontSize(9);
    const passedChecks = result.scoreBreakdown?.filter(s => s.passed).length || 0;
    const failedChecks = result.scoreBreakdown?.filter(s => !s.passed).length || 0;

    doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
    doc.text(`• Checks Passed: ${passedChecks}`, 20, y); y += 6;
    doc.text(`• Issues Found: ${failedChecks}`, 20, y); y += 6;
    doc.text(`• Cookies Detected: ${result.issues.cookies.count} (${result.issues.cookies.undeclared} undeclared)`, 20, y); y += 6;
    doc.text(`• Third-Party Trackers: ${result.issues.trackers.length}`, 20, y); y += 6;
    if (result.issues.vendorRisks?.length) {
        doc.text(`• Vendor Risks: ${result.issues.vendorRisks.length}`, 20, y); y += 6;
    }
    y += 5;

    // ============ COMPLIANCE CHECKS ============
    drawSectionHeader('COMPLIANCE CHECKS');

    drawCheck('HTTPS Enabled', result.issues.https);
    drawCheck('Cookie Consent Banner', result.issues.consentBanner);
    drawCheck('Privacy Policy', result.issues.privacyPolicy);
    drawCheck('Cookie Policy', result.issues.cookiePolicy);
    drawCheck('Legal Mentions', result.issues.legalMentions);
    drawCheck('DPO Contact', result.issues.dpoContact);
    drawCheck('Data Deletion Option', result.issues.dataDeleteLink);
    drawCheck('Opt-out Mechanism', result.issues.optOutMechanism);
    drawCheck('Form Consent', result.issues.secureforms);
    y += 5;

    // ============ SECURITY ANALYSIS ============
    drawSectionHeader('SECURITY ANALYSIS');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
    doc.text('SSL/TLS', 20, y); y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    drawCheck('SSL Certificate Valid', result.issues.ssl?.valid || false);
    drawCheck('HSTS Enabled', result.issues.ssl?.hsts || false);
    y += 3;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Security Headers', 20, y); y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    if (result.issues.securityHeaders) {
        drawCheck('Content-Security-Policy', result.issues.securityHeaders.csp);
        drawCheck('X-Frame-Options', result.issues.securityHeaders.xFrameOptions);
        drawCheck('X-Content-Type-Options', result.issues.securityHeaders.xContentType);
        drawCheck('Strict-Transport-Security', result.issues.securityHeaders.strictTransportSecurity);
        drawCheck('Referrer-Policy', result.issues.securityHeaders.referrerPolicy);
    }
    y += 3;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Email Security', 20, y); y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    if (result.issues.emailSecurity) {
        drawCheck('SPF Record', result.issues.emailSecurity.spf);
        drawCheck('DMARC Record', result.issues.emailSecurity.dmarc);
    }
    y += 5;

    // ============ COOKIES DETECTED ============
    if (result.issues.cookies.list?.length > 0) {
        drawSectionHeader('COOKIES DETECTED');

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
        doc.text('Name', 20, y);
        doc.text('Category', 70, y);
        doc.text('Provider', 110, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);

        result.issues.cookies.list.slice(0, 15).forEach(cookie => {
            checkNewPage(6);
            doc.text(cookie.name.substring(0, 25), 20, y);
            doc.text(cookie.category, 70, y);
            doc.text(cookie.provider.substring(0, 20), 110, y);
            y += 5;
        });

        if (result.issues.cookies.list.length > 15) {
            doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
            doc.text(`... and ${result.issues.cookies.list.length - 15} more cookies`, 20, y);
            y += 5;
        }
        y += 5;
    }

    // ============ THIRD-PARTY TRACKERS ============
    if (result.issues.trackers.length > 0 || (result.issues.socialTrackers?.length || 0) > 0) {
        drawSectionHeader('THIRD-PARTY TRACKERS');

        doc.setFontSize(9);
        doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);

        result.issues.trackers.forEach(tracker => {
            checkNewPage(6);
            doc.text(`• ${tracker}`, 20, y);
            y += 5;
        });

        if ((result.issues.socialTrackers?.length || 0) > 0) {
            y += 3;
            doc.setFont('helvetica', 'bold');
            doc.text('Social & Ad Trackers:', 20, y); y += 6;
            doc.setFont('helvetica', 'normal');

            result.issues.socialTrackers?.forEach(tracker => {
                checkNewPage(6);
                const riskColor = tracker.risk === 'high' ? COLORS.red : tracker.risk === 'medium' ? COLORS.gold : COLORS.gray;
                doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
                doc.text(`• ${tracker.name} (${tracker.risk} risk)`, 20, y);
                y += 5;
            });
        }
        y += 5;
    }

    // ============ VENDOR RISK ASSESSMENT ============
    if ((result.issues.vendorRisks?.length || 0) > 0) {
        drawSectionHeader('VENDOR RISK ASSESSMENT');

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
        doc.text('Vendor', 20, y);
        doc.text('Category', 70, y);
        doc.text('Risk', 110, y);
        doc.text('GDPR', 135, y);
        doc.text('Data Transfer', 155, y);
        y += 5;

        doc.setFont('helvetica', 'normal');

        result.issues.vendorRisks?.slice(0, 10).forEach(vendor => {
            checkNewPage(6);
            doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
            doc.text(vendor.name.substring(0, 25), 20, y);
            doc.text(vendor.category.substring(0, 18), 70, y);

            const riskColor = vendor.riskLevel === 'critical' ? COLORS.red :
                vendor.riskLevel === 'high' ? COLORS.gold : COLORS.gray;
            doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
            doc.text(`${vendor.riskScore}/10`, 110, y);

            doc.setTextColor(vendor.gdprCompliant ? COLORS.blue[0] : COLORS.red[0],
                vendor.gdprCompliant ? COLORS.blue[1] : COLORS.red[1],
                vendor.gdprCompliant ? COLORS.blue[2] : COLORS.red[2]);
            doc.text(vendor.gdprCompliant ? 'Yes' : 'No', 135, y);

            doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
            doc.text(vendor.dataTransfer, 155, y);
            y += 5;
        });
        y += 5;
    }

    // ============ EXPOSED EMAILS ============
    if ((result.issues.exposedEmails?.length || 0) > 0) {
        drawSectionHeader('EMAIL EXPOSURE WARNING');

        doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
        doc.setFontSize(9);
        doc.text(`${result.issues.exposedEmails?.length || 0} email address(es) found in page source:`, 20, y);
        y += 6;

        doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
        result.issues.exposedEmails?.slice(0, 5).forEach(email => {
            checkNewPage(6);
            doc.text(`• ${email}`, 20, y);
            y += 5;
        });
        y += 5;
    }

    // ============ EXTERNAL RESOURCES ============
    const totalExternal = (result.issues.externalResources?.scripts?.length || 0) +
        (result.issues.externalResources?.fonts?.length || 0) +
        (result.issues.externalResources?.iframes?.length || 0);

    if (totalExternal > 0) {
        drawSectionHeader('EXTERNAL RESOURCES');

        doc.setFontSize(9);
        doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);

        if (result.issues.externalResources?.scripts?.length) {
            doc.text(`External Scripts: ${result.issues.externalResources.scripts.length}`, 20, y); y += 5;
        }
        if (result.issues.externalResources?.fonts?.length) {
            doc.text(`External Fonts: ${result.issues.externalResources.fonts.length}`, 20, y); y += 5;
        }
        if (result.issues.externalResources?.iframes?.length) {
            doc.text(`Embedded Iframes: ${result.issues.externalResources.iframes.length}`, 20, y); y += 5;
        }
        y += 5;
    }

    // ============ RISK PREDICTION ============
    if (result.riskPrediction) {
        drawSectionHeader('GDPR RISK ASSESSMENT');

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');

        const riskColor = result.riskPrediction.riskLevel === 'critical' ? COLORS.red :
            result.riskPrediction.riskLevel === 'high' ? COLORS.gold : COLORS.blue;
        doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
        doc.text(`Risk Level: ${result.riskPrediction.riskLevel.toUpperCase()}`, 20, y);
        y += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);

        const formatFine = (n: number) => n >= 1000000 ? `€${(n / 1000000).toFixed(1)}M` : `€${(n / 1000).toFixed(0)}K`;
        doc.text(`Estimated Fine Range: ${formatFine(result.riskPrediction.minFine)} - ${formatFine(result.riskPrediction.maxFine)}`, 20, y);
        y += 6;
        doc.text(`Probability of Enforcement: ${(result.riskPrediction.probability * 100).toFixed(0)}%`, 20, y);
        y += 8;

        if (result.riskPrediction.recommendation) {
            doc.setFont('helvetica', 'bold');
            doc.text('Recommendation:', 20, y); y += 5;
            doc.setFont('helvetica', 'normal');

            const recLines = doc.splitTextToSize(result.riskPrediction.recommendation, pageWidth - 40);
            recLines.slice(0, 3).forEach((line: string) => {
                checkNewPage(6);
                doc.text(line, 20, y);
                y += 5;
            });
        }
        y += 5;
    }

    // ============ DATA BREACHES ============
    if ((result.issues.dataBreaches?.length || 0) > 0) {
        drawSectionHeader('⚠ DATA BREACHES DETECTED');

        doc.setTextColor(COLORS.red[0], COLORS.red[1], COLORS.red[2]);
        doc.setFontSize(9);
        doc.text(`This domain has been involved in ${result.issues.dataBreaches?.length || 0} known data breach(es):`, 20, y);
        y += 6;

        doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
        result.issues.dataBreaches?.forEach(breach => {
            checkNewPage(6);
            doc.text(`• ${breach.name} (${breach.date}) - ${breach.count.toLocaleString()} records`, 20, y);
            y += 5;
        });
        y += 5;
    }

    // ============ FOOTER ============
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFillColor(COLORS.lightGray[0], COLORS.lightGray[1], COLORS.lightGray[2]);
        doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');

        doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
        doc.setFontSize(7);
        doc.text('Generated by PrivacyChecker - www.privacychecker.pro', 20, pageHeight - 8);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 35, pageHeight - 8);
    }

    // Save
    doc.save(`privacycheck-${result.domain}-${new Date().toISOString().split('T')[0]}.pdf`);
}
