import jsPDF from 'jspdf';
import type { AuditResult } from '@/types/audit';

// Color palette
const COLORS = {
    navy: [15, 23, 42] as [number, number, number],
    blue: [37, 99, 235] as [number, number, number],
    lightBlue: [56, 189, 248] as [number, number, number],
    gold: [245, 158, 11] as [number, number, number],
    amber: [251, 191, 36] as [number, number, number],
    gray: [100, 116, 139] as [number, number, number],
    darkGray: [51, 65, 85] as [number, number, number],
    lightGray: [241, 245, 249] as [number, number, number],
    green: [34, 197, 94] as [number, number, number],
    red: [220, 38, 38] as [number, number, number],
    orange: [249, 115, 22] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    black: [0, 0, 0] as [number, number, number],
};

function stripParentheses(text: string): string {
    return text.replace(/\s*\([^)]*\)/g, '').trim();
}

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
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 20, y + 2);
        y += 15;
    };

    const drawSubHeader = (title: string) => {
        checkNewPage(15);
        doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 20, y);
        y += 6;
    };

    const drawCheck = (label: string, passed: boolean) => {
        checkNewPage(7);
        doc.setFontSize(9);
        if (passed) {
            doc.setTextColor(COLORS.blue[0], COLORS.blue[1], COLORS.blue[2]);
            doc.text('[PASS]', 20, y);
        } else {
            doc.setTextColor(COLORS.red[0], COLORS.red[1], COLORS.red[2]);
            doc.text('[FAIL]', 20, y);
        }
        doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
        doc.setFont('helvetica', 'normal');
        doc.text(label, 40, y);
        y += 6;
    };

    // ============ HEADER ============
    doc.setFillColor(COLORS.navy[0], COLORS.navy[1], COLORS.navy[2]);
    doc.rect(0, 0, pageWidth, 50, 'F');

    // Logo and title
    doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('PrivacyChecker', 20, 18);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Privacy Audit Report', 20, 26);

    // Reference
    const refDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const refDomain = result.domain.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 8);
    doc.setFontSize(7);
    doc.text(`Ref: RPT-${refDate}-${refDomain}`, 20, 34);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')} | Audit Engine v2.1`, 20, 40);

    // Score badge
    const scoreColor = result.score >= 80 ? COLORS.green : result.score >= 50 ? COLORS.gold : COLORS.red;
    doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.roundedRect(pageWidth - 55, 12, 40, 26, 3, 3, 'F');
    doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${result.score}`, pageWidth - 45, 26);
    doc.setFontSize(10);
    doc.text('/100', pageWidth - 30, 26);

    // Risk label
    const riskLabel = result.score >= 80 ? 'LOW RISK' : result.score >= 50 ? 'MEDIUM RISK' : 'HIGH RISK';
    doc.setFontSize(6);
    doc.text(riskLabel, pageWidth - 48, 34);

    y = 60;

    // ============ DOMAIN INFO ============
    doc.setTextColor(COLORS.navy[0], COLORS.navy[1], COLORS.navy[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(result.domain, 20, y);
    y += 8;

    doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Pages Scanned: ${result.pagesScanned} | Regulations: ${result.regulations.join(', ')}`, 20, y);
    y += 12;

    // ============ EXECUTIVE SUMMARY ============
    drawSectionHeader('EXECUTIVE SUMMARY');

    const passedChecks = result.scoreBreakdown?.filter(s => s.passed).length || 0;
    const failedChecks = result.scoreBreakdown?.filter(s => !s.passed).length || 0;

    doc.setFontSize(9);
    doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);

    // Summary grid
    doc.text(`Checks Passed: ${passedChecks}`, 20, y);
    doc.text(`Issues Found: ${failedChecks}`, 80, y);
    doc.text(`Pages Scanned: ${result.pagesScanned}`, 140, y);
    y += 8;

    doc.text(`Cookies: ${result.issues.cookies.count} (${result.issues.cookies.undeclared} undeclared)`, 20, y);
    doc.text(`Trackers: ${result.issues.trackers.length}`, 80, y);
    if (result.issues.vendorRisks?.length) {
        doc.text(`Vendors: ${result.issues.vendorRisks.length}`, 140, y);
    }
    y += 12;

    // ============ ISSUES FOUND ============
    const failedItems = result.scoreBreakdown?.filter(s => !s.passed) || [];
    if (failedItems.length > 0) {
        drawSectionHeader('ISSUES FOUND');

        doc.setFontSize(8);
        failedItems.forEach(item => {
            checkNewPage(6);
            doc.setTextColor(COLORS.red[0], COLORS.red[1], COLORS.red[2]);
            doc.text(`X ${stripParentheses(item.item)}`, 20, y);
            doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
            doc.text(`${item.points}`, 160, y);
            y += 5;
        });
        y += 5;
    }

    // ============ SCORE BREAKDOWN ============
    if (result.scoreBreakdown && result.scoreBreakdown.length > 0) {
        drawSectionHeader('SCORE BREAKDOWN');

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
        doc.text('Check', 20, y);
        doc.text('Points', 160, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        result.scoreBreakdown.filter(b => b.points !== 0 || !b.passed).forEach(item => {
            checkNewPage(5);
            doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
            doc.text(stripParentheses(item.item).substring(0, 60), 20, y);

            const pointColor = item.passed ? COLORS.darkGray : COLORS.red;
            doc.setTextColor(pointColor[0], pointColor[1], pointColor[2]);
            doc.text(`${item.points > 0 ? '+' : ''}${item.points}`, 160, y);
            y += 5;
        });

        // Final score
        doc.setDrawColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
        doc.line(20, y, 180, y);
        y += 5;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(COLORS.navy[0], COLORS.navy[1], COLORS.navy[2]);
        doc.text('Final Score', 20, y);
        doc.text(`${result.score}/100`, 160, y);
        y += 10;
    }

    // ============ GDPR FINE ESTIMATION ============
    if (result.riskPrediction) {
        drawSectionHeader('GDPR FINE ESTIMATION');

        const riskColor = result.riskPrediction.riskLevel === 'critical' ? COLORS.red :
            result.riskPrediction.riskLevel === 'high' ? COLORS.orange :
                result.riskPrediction.riskLevel === 'medium' ? COLORS.gold : COLORS.green;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
        doc.text(`Risk Level: ${result.riskPrediction.riskLevel.toUpperCase()}`, 20, y);
        y += 8;

        const formatFine = (n: number) => n >= 1000000 ? `EUR ${(n / 1000000).toFixed(1)}M` : `EUR ${(n / 1000).toFixed(0)}K`;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
        doc.text(`Estimated Fine Range: ${formatFine(result.riskPrediction.minFine)} - ${formatFine(result.riskPrediction.maxFine)}`, 20, y);
        y += 6;
        doc.text(`Probability of Enforcement: ${(result.riskPrediction.probability * 100).toFixed(0)}%`, 20, y);
        y += 10;
    }

    // ============ SECURITY EXPOSURE ANALYSIS ============
    if (result.attackSurface && result.attackSurface.totalFindings > 0) {
        drawSectionHeader('SECURITY EXPOSURE ANALYSIS');

        doc.setFontSize(9);
        doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
        doc.text(`Total Findings: ${result.attackSurface.totalFindings}`, 20, y);
        y += 8;

        result.attackSurface.findings.slice(0, 8).forEach(finding => {
            checkNewPage(12);
            const sevColor = finding.severity === 'critical' || finding.severity === 'high' ? COLORS.red :
                finding.severity === 'medium' ? COLORS.orange : COLORS.gray;

            doc.setTextColor(sevColor[0], sevColor[1], sevColor[2]);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.text(`[${finding.severity.toUpperCase()}]`, 20, y);
            doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
            doc.text(finding.title.substring(0, 50), 45, y);
            y += 5;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.text(finding.description.substring(0, 80), 25, y);
            y += 6;
        });
        y += 5;
    }

    // ============ CONSENT BEHAVIOR TEST ============
    if (result.issues.consentBehavior) {
        drawSectionHeader('CONSENT BEHAVIOR TEST');

        const cb = result.issues.consentBehavior;
        const cbColor = cb.score >= 80 ? COLORS.green : cb.score >= 50 ? COLORS.gold : COLORS.red;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(cbColor[0], cbColor[1], cbColor[2]);
        doc.text(`Score: ${cb.score}/100`, 20, y);
        y += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);

        if (cb.preConsentCookies && cb.preConsentCookies.length > 0) {
            doc.text(`Pre-consent cookies: ${cb.preConsentCookies.length}`, 20, y);
            y += 5;
        }
        drawCheck('Has Reject Button', cb.hasRejectButton);
        drawCheck('Has Accept Button', cb.hasAcceptButton);

        if (cb.issues.length > 0) {
            y += 3;
            doc.setFont('helvetica', 'bold');
            doc.text('Issues:', 20, y);
            y += 5;
            doc.setFont('helvetica', 'normal');
            cb.issues.slice(0, 5).forEach(issue => {
                checkNewPage(5);
                doc.text(`- ${issue.substring(0, 70)}`, 25, y);
                y += 5;
            });
        }
        y += 5;
    }

    // ============ PRIVACY POLICY ANALYSIS ============
    if (result.issues.policyAnalysis) {
        drawSectionHeader('PRIVACY POLICY ANALYSIS');

        const pa = result.issues.policyAnalysis;
        const paColor = pa.overallScore >= 80 ? COLORS.green : pa.overallScore >= 50 ? COLORS.gold : COLORS.red;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(paColor[0], paColor[1], paColor[2]);
        doc.text(`Score: ${pa.overallScore}/100`, 20, y);
        y += 8;

        doc.setFontSize(8);
        const sections = [
            { name: 'Legal Basis', data: pa.sections.legalBasis },
            { name: 'Data Retention', data: pa.sections.dataRetention },
            { name: 'User Rights', data: pa.sections.userRights },
            { name: 'Third Party Sharing', data: pa.sections.thirdPartySharing },
            { name: 'International Transfers', data: pa.sections.internationalTransfers },
            { name: 'Contact Info', data: pa.sections.contactInfo },
            { name: 'Cookie Policy', data: pa.sections.cookiePolicy },
        ];

        sections.forEach(section => {
            checkNewPage(6);
            const statusColor = section.data.status === 'compliant' ? COLORS.blue :
                section.data.status === 'partial' ? COLORS.gold :
                    section.data.status === 'missing' ? COLORS.red : COLORS.gray;

            doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
            doc.setFont('helvetica', 'normal');
            doc.text(section.name, 20, y);

            doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
            doc.setFont('helvetica', 'bold');
            const statusLabel = section.data.status === 'compliant' ? 'PASS' :
                section.data.status === 'partial' ? 'REVIEW' :
                    section.data.status === 'missing' ? 'FAIL' : 'N/A';
            doc.text(statusLabel, 120, y);
            y += 5;
        });
        y += 5;
    }

    // ============ DARK PATTERNS DETECTION ============
    if (result.issues.darkPatterns && result.issues.darkPatterns.detected) {
        drawSectionHeader('DARK PATTERNS DETECTION');

        const dp = result.issues.darkPatterns;
        const dpColor = dp.score >= 80 ? COLORS.green : dp.score >= 50 ? COLORS.gold : COLORS.red;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(dpColor[0], dpColor[1], dpColor[2]);
        doc.text(`Score: ${dp.score}/100`, 20, y);
        doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
        doc.setFontSize(8);
        doc.text(`(${dp.totalCount} patterns detected)`, 60, y);
        y += 8;

        dp.patterns.slice(0, 8).forEach(pattern => {
            checkNewPage(10);
            const sevColor = pattern.severity === 'critical' ? COLORS.red :
                pattern.severity === 'high' ? COLORS.orange :
                    pattern.severity === 'medium' ? COLORS.gold : COLORS.blue;

            doc.setTextColor(sevColor[0], sevColor[1], sevColor[2]);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7);
            doc.text(`[${pattern.severity.toUpperCase()}]`, 20, y);

            doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
            doc.text(pattern.type, 45, y);
            y += 4;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.text(pattern.description.substring(0, 80), 25, y);
            y += 6;
        });
        y += 5;
    }

    // ============ FINGERPRINTING DETECTION ============
    if (result.issues.fingerprinting && result.issues.fingerprinting.detected) {
        drawSectionHeader('FINGERPRINTING DETECTION');

        const fp = result.issues.fingerprinting;
        const fpColor = fp.score >= 80 ? COLORS.green : fp.score >= 50 ? COLORS.gold : COLORS.red;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(fpColor[0], fpColor[1], fpColor[2]);
        doc.text(`Score: ${fp.score}/100`, 20, y);
        doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
        doc.setFontSize(8);
        doc.text(`(${fp.totalTechniques} techniques detected)`, 60, y);
        y += 8;

        fp.issues.slice(0, 6).forEach(issue => {
            checkNewPage(6);
            doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
            doc.setFontSize(8);
            doc.text(`- ${issue.type}: ${issue.description.substring(0, 60)}`, 20, y);
            y += 5;
        });
        y += 5;
    }

    // ============ COMPLIANCE CHECKS ============
    drawSectionHeader('COMPLIANCE CHECKLIST');

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

    // ============ SECURITY HEADERS ============
    if (result.issues.securityHeadersExtended || result.issues.securityHeaders) {
        drawSectionHeader('SECURITY & INFRASTRUCTURE');

        if (result.issues.securityHeadersExtended) {
            const sh = result.issues.securityHeadersExtended;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
            doc.text(`Security Headers Score: ${sh.score}/100 (Grade: ${sh.grade})`, 20, y);
            y += 8;

            sh.issues.slice(0, 6).forEach(h => {
                drawCheck(h.header, h.status === 'present');
            });
        } else if (result.issues.securityHeaders) {
            drawCheck('Content-Security-Policy', result.issues.securityHeaders.csp);
            drawCheck('X-Frame-Options', result.issues.securityHeaders.xFrameOptions);
            drawCheck('X-Content-Type-Options', result.issues.securityHeaders.xContentType);
            drawCheck('HSTS', result.issues.securityHeaders.strictTransportSecurity);
            drawCheck('Referrer-Policy', result.issues.securityHeaders.referrerPolicy);
        }

        if (result.issues.ssl) {
            y += 3;
            drawSubHeader('SSL/TLS');
            drawCheck('Certificate Valid', result.issues.ssl.valid);
            drawCheck('HSTS Enabled', result.issues.ssl.hsts);
        }

        if (result.issues.emailSecurity) {
            y += 3;
            drawSubHeader('Email Security');
            drawCheck('SPF Record', result.issues.emailSecurity.spf);
            drawCheck('DMARC Record', result.issues.emailSecurity.dmarc);
        }
        y += 5;
    }

    // ============ COOKIES DETECTED ============
    if (result.issues.cookies.list?.length > 0) {
        drawSectionHeader('COOKIES DETECTED');

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
        doc.text('Name', 20, y);
        doc.text('Category', 80, y);
        doc.text('Provider', 130, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);

        result.issues.cookies.list.slice(0, 20).forEach(cookie => {
            checkNewPage(5);
            doc.text(cookie.name.substring(0, 30), 20, y);
            doc.text(cookie.category, 80, y);
            doc.text(cookie.provider.substring(0, 25), 130, y);
            y += 5;
        });

        if (result.issues.cookies.list.length > 20) {
            doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
            doc.text(`... and ${result.issues.cookies.list.length - 20} more cookies`, 20, y);
            y += 5;
        }
        y += 5;
    }

    // ============ PAGES SCANNED ============
    if (result.pages && result.pages.length > 0) {
        drawSectionHeader('PAGES SCANNED');

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
        doc.text('Page', 20, y);
        doc.text('Cookies', 140, y);
        doc.text('Trackers', 165, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        result.pages.slice(0, 15).forEach(page => {
            checkNewPage(5);
            doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
            doc.text((page.title || page.url).substring(0, 55), 20, y);
            doc.text(String(page.cookiesFound), 145, y);
            doc.text(String(page.trackersFound.length), 170, y);
            y += 5;
        });
        y += 5;
    }

    // ============ THIRD-PARTY TRACKERS ============
    if (result.issues.trackers.length > 0) {
        drawSectionHeader('THIRD-PARTY TRACKERS');

        doc.setFontSize(8);
        doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);

        result.issues.trackers.slice(0, 15).forEach(tracker => {
            checkNewPage(5);
            doc.text(`- ${tracker}`, 20, y);
            y += 5;
        });
        y += 5;
    }

    // ============ VENDOR RISKS ============
    if (result.issues.vendorRisks && result.issues.vendorRisks.length > 0) {
        drawSectionHeader('VENDOR RISK ASSESSMENT');

        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
        doc.text('Vendor', 20, y);
        doc.text('Category', 65, y);
        doc.text('Risk', 105, y);
        doc.text('GDPR', 125, y);
        doc.text('Jurisdiction', 150, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        result.issues.vendorRisks.slice(0, 12).forEach(vendor => {
            checkNewPage(5);
            doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
            doc.text(vendor.name.substring(0, 20), 20, y);
            doc.text(vendor.category.substring(0, 18), 65, y);

            const riskColor = vendor.riskLevel === 'critical' || vendor.riskLevel === 'high' ? COLORS.red : COLORS.gray;
            doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
            doc.text(`${vendor.riskScore}/10`, 105, y);

            doc.setTextColor(vendor.gdprCompliant ? COLORS.blue[0] : COLORS.red[0],
                vendor.gdprCompliant ? COLORS.blue[1] : COLORS.red[1],
                vendor.gdprCompliant ? COLORS.blue[2] : COLORS.red[2]);
            doc.text(vendor.gdprCompliant ? 'Yes' : 'No', 125, y);

            doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
            doc.text(vendor.jurisdiction, 150, y);
            y += 5;
        });
        y += 5;
    }

    // ============ DATA BREACHES ============
    if (result.issues.dataBreaches && result.issues.dataBreaches.length > 0) {
        drawSectionHeader('DATA BREACHES DETECTED');

        doc.setTextColor(COLORS.red[0], COLORS.red[1], COLORS.red[2]);
        doc.setFontSize(9);
        doc.text(`This domain has been involved in ${result.issues.dataBreaches.length} known data breach(es):`, 20, y);
        y += 6;

        doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
        doc.setFontSize(8);
        result.issues.dataBreaches.forEach(breach => {
            checkNewPage(5);
            doc.text(`- ${breach.name} (${breach.date}) - ${breach.count.toLocaleString()} records`, 20, y);
            y += 5;
        });
        y += 5;
    }

    // ============ EXPOSED EMAILS ============
    if (result.issues.exposedEmails && result.issues.exposedEmails.length > 0) {
        drawSectionHeader('EMAIL EXPOSURE WARNING');

        doc.setTextColor(COLORS.orange[0], COLORS.orange[1], COLORS.orange[2]);
        doc.setFontSize(9);
        doc.text(`${result.issues.exposedEmails.length} email address(es) found exposed:`, 20, y);
        y += 6;

        doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
        doc.setFontSize(8);
        result.issues.exposedEmails.slice(0, 8).forEach(email => {
            checkNewPage(5);
            doc.text(`- ${email}`, 20, y);
            y += 5;
        });
        y += 5;
    }

    // ============ FOOTER ============
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFillColor(COLORS.lightGray[0], COLORS.lightGray[1], COLORS.lightGray[2]);
        doc.rect(0, pageHeight - 18, pageWidth, 18, 'F');

        doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
        doc.setFontSize(7);
        doc.text('Generated by PrivacyChecker - www.privacychecker.pro', 20, pageHeight - 8);
        doc.text('This report does not constitute legal advice.', 20, pageHeight - 4);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 6);
    }

    // Save
    doc.save(`privacycheck-${result.domain}-${new Date().toISOString().split('T')[0]}.pdf`);
}
