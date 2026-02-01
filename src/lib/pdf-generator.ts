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

    const drawCategoryHeader = (title: string) => {
        checkNewPage(20);
        y += 5;
        doc.setFillColor(COLORS.navy[0], COLORS.navy[1], COLORS.navy[2]);
        doc.rect(15, y - 6, pageWidth - 30, 12, 'F');
        doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(title.toUpperCase(), 20, y + 2);
        y += 18;
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
            doc.text('✓', 20, y);
        } else {
            doc.setTextColor(COLORS.red[0], COLORS.red[1], COLORS.red[2]);
            doc.text('✕', 20, y);
        }
        doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
        doc.setFont('helvetica', 'normal');
        doc.text(label, 28, y);
        y += 6;
    };

    const drawBadge = (text: string, color: [number, number, number], x: number, yPos: number) => {
        const textWidth = doc.getTextWidth(text) + 6;
        doc.setFillColor(color[0], color[1], color[2]);
        doc.roundedRect(x, yPos - 4, textWidth, 6, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text(text, x + 3, yPos);
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
    const riskLabel = result.score >= 80 ? 'LOW RISK' : result.score >= 50 ? 'MEDIUM RISK' : 'ELEVATED RISK';
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
            doc.text(`✕ ${stripParentheses(item.item)}`, 20, y);
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

    // ==========================================
    // CATEGORY: COMPLIANCE
    // ==========================================
    drawCategoryHeader('Compliance');

    // ============ GDPR FINE ESTIMATION ============
    if (result.riskPrediction) {
        drawSectionHeader('POTENTIAL REGULATORY EXPOSURE');

        const riskColor = result.riskPrediction.riskLevel === 'critical' ? COLORS.red :
            result.riskPrediction.riskLevel === 'high' ? COLORS.orange :
                result.riskPrediction.riskLevel === 'medium' ? COLORS.gold : COLORS.green;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
        doc.text(`Risk Level: ${result.riskPrediction.riskLevel.toUpperCase()}`, 20, y);
        y += 8;

        const formatFine = (n: number) => n >= 1000000 ? `€${(n / 1000000).toFixed(1)}M` : `€${(n / 1000).toFixed(0)}K`;
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

    // ==========================================
    // CATEGORY: CONSENT & PRIVACY
    // ==========================================
    drawCategoryHeader('Consent & Privacy');

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
        drawCheck('Reject button available', cb.hasRejectButton ?? false);
        drawCheck('Accept button available', cb.hasAcceptButton ?? false);

        if (cb.issues.length > 0) {
            y += 3;
            doc.setFont('helvetica', 'bold');
            doc.text('Issues:', 20, y);
            y += 5;
            doc.setFont('helvetica', 'normal');
            cb.issues.slice(0, 5).forEach(issue => {
                checkNewPage(5);
                doc.text(`• ${issue.substring(0, 70)}`, 25, y);
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
        // Use sections object instead of categories array
        const sectionNames = ['legalBasis', 'dataRetention', 'userRights', 'thirdPartySharing', 'contactInfo'] as const;
        sectionNames.forEach(sectionName => {
            const section = pa.sections[sectionName];
            if (!section) return;
            checkNewPage(6);
            const statusColor = section.status === 'compliant' ? COLORS.blue :
                section.status === 'partial' ? COLORS.gold : COLORS.red;

            doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
            doc.setFont('helvetica', 'normal');
            doc.text(sectionName.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()), 20, y);

            doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
            doc.setFont('helvetica', 'bold');
            const statusLabel = section.found ? (section.status === 'compliant' ? 'PASS' : 'REVIEW') : 'MISSING';
            doc.text(statusLabel, 120, y);
            y += 5;
        });
        y += 5;
    }

    // ============ DARK PATTERNS DETECTION ============
    if (result.issues.darkPatterns) {
        drawSectionHeader('DARK PATTERNS DETECTION');

        const dp = result.issues.darkPatterns;
        const dpColor = dp.score >= 80 ? COLORS.green : dp.score >= 50 ? COLORS.gold : COLORS.red;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(dpColor[0], dpColor[1], dpColor[2]);
        doc.text(`Score: ${dp.score}/100`, 20, y);
        doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
        doc.setFontSize(8);
        doc.text(`(${dp.patterns.length} patterns detected)`, 60, y);
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
    if (result.issues.ageVerification) {
        drawCheck('Age Verification', true);
    }
    y += 5;

    // ==========================================
    // CATEGORY: SECURITY
    // ==========================================
    drawCategoryHeader('Security');

    // ============ SECURITY HEADERS ============
    if (result.issues.securityHeadersExtended || result.issues.securityHeaders) {
        drawSectionHeader('SECURITY & INFRASTRUCTURE');

        if (result.issues.securityHeadersExtended) {
            const sh = result.issues.securityHeadersExtended;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
            doc.text(`Security Headers Score: ${sh.score}/100`, 20, y);
            y += 8;

            Object.entries(sh.headers).slice(0, 8).forEach(([name, h]) => {
                drawCheck(name, h.present);
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

    // ============ SOCIAL TRACKERS ============
    if (result.issues.socialTrackers && result.issues.socialTrackers.length > 0) {
        drawSectionHeader('SOCIAL TRACKERS');

        doc.setFontSize(8);
        result.issues.socialTrackers.slice(0, 10).forEach(tracker => {
            checkNewPage(5);
            const riskColor = tracker.risk === 'high' ? COLORS.red :
                tracker.risk === 'medium' ? COLORS.orange : COLORS.gray;
            doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
            doc.text(`[${tracker.risk.toUpperCase()}]`, 20, y);
            doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
            doc.text(tracker.name, 45, y);
            y += 5;
        });
        y += 5;
    }

    // ============ FINGERPRINTING DETECTION ============
    if (result.issues.fingerprinting) {
        drawSectionHeader('FINGERPRINTING DETECTION');

        const fp = result.issues.fingerprinting;
        const fpColor = fp.score >= 80 ? COLORS.green : fp.score >= 50 ? COLORS.gold : COLORS.red;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(fpColor[0], fpColor[1], fpColor[2]);
        doc.text(`Score: ${fp.score}/100`, 20, y);
        doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
        doc.setFontSize(8);
        doc.text(fp.detected ? '(Fingerprinting detected)' : '(No fingerprinting detected)', 55, y);
        y += 8;

        if (fp.issues.length > 0) {
            doc.setFont('helvetica', 'normal');
            fp.issues.slice(0, 5).forEach(issue => {
                checkNewPage(6);
                const sevColor = issue.severity === 'critical' || issue.severity === 'high' ? COLORS.red : COLORS.orange;
                doc.setTextColor(sevColor[0], sevColor[1], sevColor[2]);
                doc.text(`[${issue.severity.toUpperCase()}]`, 20, y);
                doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
                doc.text(issue.type, 45, y);
                y += 5;
            });
        }
        y += 5;
    }

    // ============ COOKIE LIFESPAN ANALYSIS ============
    if (result.issues.cookieLifespan) {
        drawSectionHeader('COOKIE LIFESPAN ANALYSIS');

        const cl = result.issues.cookieLifespan;
        doc.setFontSize(9);
        doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
        doc.text(`Cookies Analyzed: ${cl.totalCookiesAnalyzed} | Issues: ${cl.issuesCount} | Avg Lifespan: ${cl.averageLifespan}d`, 20, y);
        y += 6;

        if (cl.longestCookie) {
            doc.text(`Longest: "${cl.longestCookie.name}" - ${cl.longestCookie.days} days`, 20, y);
            y += 6;
        }

        if (cl.issues.length > 0) {
            doc.setFontSize(8);
            cl.issues.slice(0, 5).forEach(issue => {
                checkNewPage(5);
                const sevColor = issue.severity === 'critical' || issue.severity === 'high' ? COLORS.red : COLORS.orange;
                doc.setTextColor(sevColor[0], sevColor[1], sevColor[2]);
                doc.text(`• ${issue.name}: ${issue.currentLifespan}d (recommended: ${issue.recommendedLifespan}d)`, 20, y);
                y += 5;
            });
        }
        y += 5;
    }

    // ============ OPT-IN FORMS ANALYSIS ============
    if (result.issues.optInForms && result.issues.optInForms.totalIssues > 0) {
        drawSectionHeader('OPT-IN FORMS ANALYSIS');

        const oi = result.issues.optInForms;
        const oiColor = oi.score >= 80 ? COLORS.green : oi.score >= 50 ? COLORS.gold : COLORS.red;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(oiColor[0], oiColor[1], oiColor[2]);
        doc.text(`Score: ${oi.score}/100`, 20, y);
        y += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
        doc.text(`Forms Analyzed: ${oi.formsAnalyzed} | Pre-checked: ${oi.preCheckedCount} | Hidden Consent: ${oi.hiddenConsentCount}`, 20, y);
        y += 6;

        oi.issues.slice(0, 5).forEach(issue => {
            checkNewPage(5);
            const sevColor = issue.severity === 'critical' || issue.severity === 'high' ? COLORS.red : COLORS.orange;
            doc.setTextColor(sevColor[0], sevColor[1], sevColor[2]);
            doc.text(`• [${issue.type}] ${issue.description.substring(0, 60)}`, 20, y);
            y += 5;
        });
        y += 5;
    }

    // ============ STORAGE AUDIT ============
    if (result.issues.storageAudit && result.issues.storageAudit.totalItems > 0) {
        drawSectionHeader('STORAGE AUDIT');

        const sa = result.issues.storageAudit;
        doc.setFontSize(9);
        doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
        doc.text(`LocalStorage: ${sa.localStorage.count} items (${sa.localStorage.riskItems} risky)`, 20, y);
        doc.text(`SessionStorage: ${sa.sessionStorage.count} items`, 100, y);
        y += 6;

        if (sa.issues.length > 0) {
            doc.setFontSize(8);
            sa.issues.slice(0, 5).forEach(issue => {
                checkNewPage(5);
                const riskColor = issue.risk === 'critical' || issue.risk === 'high' ? COLORS.red : COLORS.orange;
                doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
                doc.text(`• ${issue.key}: ${issue.description.substring(0, 50)}`, 20, y);
                y += 5;
            });
        }
        y += 5;
    }

    // ============ MIXED CONTENT ============
    if (result.issues.mixedContent && result.issues.mixedContent.detected) {
        drawSectionHeader('⚠ MIXED CONTENT DETECTED');

        const mc = result.issues.mixedContent;
        doc.setTextColor(COLORS.orange[0], COLORS.orange[1], COLORS.orange[2]);
        doc.setFontSize(9);
        doc.text(`${mc.totalIssues} mixed content issue(s) found (${mc.blockedCount} blocked, ${mc.warningCount} warnings)`, 20, y);
        y += 6;

        doc.setFontSize(8);
        mc.issues.slice(0, 5).forEach(issue => {
            checkNewPage(5);
            doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
            doc.text(`• [${issue.type}] ${issue.url.substring(0, 50)}`, 20, y);
            y += 5;
        });
        y += 5;
    }

    // ============ FORM SECURITY ============
    if (result.issues.formSecurity && result.issues.formSecurity.issuesCount > 0) {
        drawSectionHeader('FORM SECURITY');

        const fs = result.issues.formSecurity;
        const fsColor = fs.score >= 80 ? COLORS.green : fs.score >= 50 ? COLORS.gold : COLORS.red;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(fsColor[0], fsColor[1], fsColor[2]);
        doc.text(`Score: ${fs.score}/100`, 20, y);
        y += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
        doc.text(`Forms: ${fs.totalForms} | Secure: ${fs.secureCount} | Issues: ${fs.issuesCount}`, 20, y);
        y += 6;

        fs.issues.slice(0, 5).forEach(issue => {
            checkNewPage(5);
            const sevColor = issue.severity === 'critical' || issue.severity === 'high' ? COLORS.red : COLORS.orange;
            doc.setTextColor(sevColor[0], sevColor[1], sevColor[2]);
            doc.text(`• [${issue.severity.toUpperCase()}] ${issue.type}: ${issue.description.substring(0, 45)}`, 20, y);
            y += 5;
        });
        y += 5;
    }

    // ==========================================
    // CATEGORY: ACCESSIBILITY (EAA 2025)
    // ==========================================
    drawCategoryHeader('Accessibility (EAA 2025)');

    if (result.issues.accessibility) {
        const acc = result.issues.accessibility;
        const accColor = acc.score >= 80 ? COLORS.green : acc.score >= 50 ? COLORS.gold : COLORS.red;

        // Score Overview
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(accColor[0], accColor[1], accColor[2]);
        doc.text(`WCAG 2.1 AA Score: ${acc.score}/100`, 20, y);
        y += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
        doc.text(`Critical: ${acc.criticalCount} | Serious: ${acc.seriousCount} | Moderate: ${acc.moderateCount} | Minor: ${acc.minorCount}`, 20, y);
        y += 8;

        // Violations
        if (acc.violations.length > 0) {
            drawSubHeader('Issues Found');
            acc.violations.slice(0, 8).forEach(violation => {
                checkNewPage(6);
                const impactColor = violation.impact === 'critical' ? COLORS.red :
                    violation.impact === 'serious' ? COLORS.orange : COLORS.gold;
                doc.setTextColor(impactColor[0], impactColor[1], impactColor[2]);
                doc.setFontSize(8);
                doc.text(`• [${violation.impact.toUpperCase()}] ${violation.description}`, 20, y);
                doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
                doc.setFontSize(7);
                doc.text(`WCAG ${violation.wcagCriteria} | ${violation.nodes} element(s)`, 25, y + 4);
                y += 9;
            });
        }

        // Passed checks
        if (acc.passes.length > 0) {
            y += 3;
            drawSubHeader('Checks Passed');
            doc.setTextColor(COLORS.green[0], COLORS.green[1], COLORS.green[2]);
            doc.setFontSize(7);
            const passedText = acc.passes.slice(0, 5).map(p => `✓ ${p.substring(0, 30)}`).join(' | ');
            doc.text(passedText, 20, y);
            y += 6;
        }

        // EAA Warning
        y += 3;
        doc.setFillColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
        doc.rect(15, y - 3, pageWidth - 30, 10, 'F');
        doc.setTextColor(COLORS.navy[0], COLORS.navy[1], COLORS.navy[2]);
        doc.setFontSize(7);
        doc.text('⚠ European Accessibility Act (EAA) requires WCAG 2.1 AA compliance. Non-compliance can result in fines up to €30,000.', 20, y + 3);
        y += 15;
    } else {
        doc.setFontSize(9);
        doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
        doc.text('Accessibility data not available', 20, y);
        y += 10;
    }

    // ==========================================
    // CATEGORY: DOMAIN SECURITY
    // ==========================================
    drawCategoryHeader('Domain Security');

    if (result.issues.domainRisk) {
        const dr = result.issues.domainRisk;
        const drColor = dr.score >= 80 ? COLORS.green : dr.score >= 50 ? COLORS.gold : COLORS.red;

        // Score Overview
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(drColor[0], drColor[1], drColor[2]);
        doc.text(`Domain Security Score: ${dr.score}/100`, 20, y);
        y += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
        doc.text(`Overall Risk: ${dr.overallRisk.toUpperCase()}`, 20, y);
        y += 8;

        // Domain Expiry
        drawSubHeader('Domain Expiry');
        if (dr.domainExpiry.daysUntilExpiry !== null) {
            const expiryColor = dr.domainExpiry.status === 'ok' ? COLORS.green :
                dr.domainExpiry.status === 'warning' ? COLORS.gold : COLORS.red;
            doc.setTextColor(expiryColor[0], expiryColor[1], expiryColor[2]);
            doc.setFontSize(8);
            doc.text(`${dr.domainExpiry.daysUntilExpiry} days until expiry`, 20, y);
            if (dr.domainExpiry.registrar) {
                doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
                doc.text(`Registrar: ${dr.domainExpiry.registrar.substring(0, 40)}`, 80, y);
            }
            y += 6;
        } else {
            doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
            doc.text('WHOIS data not available', 20, y);
            y += 6;
        }

        // DNS Security
        drawSubHeader('DNS Security');
        doc.setFontSize(8);
        const dnsItems = [
            { label: 'SPF', value: dr.dnsSecurity.spf },
            { label: 'DKIM', value: dr.dnsSecurity.dkim },
            { label: 'DMARC', value: dr.dnsSecurity.dmarc },
            { label: 'DNSSEC', value: dr.dnsSecurity.dnssec },
        ];
        let dnsX = 20;
        dnsItems.forEach(item => {
            const color = item.value ? COLORS.green : COLORS.red;
            doc.setTextColor(color[0], color[1], color[2]);
            doc.text(`${item.value ? '✓' : '✗'} ${item.label}`, dnsX, y);
            dnsX += 30;
        });
        y += 8;

        // Typosquatting
        if (dr.typosquatting.detected > 0) {
            drawSubHeader(`Typosquatting Detected (${dr.typosquatting.detected})`);
            dr.typosquatting.domains.slice(0, 5).forEach(domain => {
                checkNewPage(6);
                const riskColor = domain.risk === 'high' ? COLORS.red :
                    domain.risk === 'medium' ? COLORS.orange : COLORS.gold;
                doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
                doc.setFontSize(8);
                doc.text(`• ${domain.domain} [${domain.risk.toUpperCase()}]`, 20, y);
                y += 5;
            });
            y += 3;
        }

        // Phishing alerts
        if (dr.phishingRisk.alerts.length > 0) {
            y += 3;
            doc.setFillColor(COLORS.red[0], COLORS.red[1], COLORS.red[2]);
            doc.rect(15, y - 3, pageWidth - 30, 8, 'F');
            doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
            doc.setFontSize(7);
            doc.text(`⚠ ${dr.phishingRisk.alerts[0].substring(0, 80)}`, 20, y + 2);
            y += 12;
        }
    } else {
        doc.setFontSize(9);
        doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
        doc.text('Domain security data not available', 20, y);
        y += 10;
    }

    // ==========================================
    // CATEGORY: SUPPLY CHAIN SECURITY
    // ==========================================
    drawCategoryHeader('Supply Chain Security');

    if (result.issues.supplyChain) {
        const sc = result.issues.supplyChain;
        const scColor = sc.score >= 80 ? COLORS.green : sc.score >= 50 ? COLORS.gold : COLORS.red;

        // Score Overview
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(scColor[0], scColor[1], scColor[2]);
        doc.text(`Supply Chain Score: ${sc.score}/100`, 20, y);
        y += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
        doc.text(`Total Scripts: ${sc.totalDependencies} | Unknown Origins: ${sc.unknownOrigins} | Risk: ${sc.riskLevel.toUpperCase()}`, 20, y);
        y += 8;

        // Category breakdown
        if (sc.categories.length > 0) {
            drawSubHeader('Dependency Categories');
            const catText = sc.categories.map(c => `${c.name}: ${c.count}`).join(' | ');
            doc.setFontSize(8);
            doc.text(catText.substring(0, 100), 20, y);
            y += 6;
        }

        // Critical scripts
        if (sc.criticalDependencies.length > 0) {
            y += 2;
            doc.setFillColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
            doc.rect(15, y - 3, pageWidth - 30, 8, 'F');
            doc.setTextColor(COLORS.navy[0], COLORS.navy[1], COLORS.navy[2]);
            doc.setFontSize(7);
            doc.text(`⚠ Critical Dependencies: ${sc.criticalDependencies.slice(0, 5).join(', ')}`, 20, y + 2);
            y += 12;
        }

        // Recommendations
        if (sc.recommendations.length > 0) {
            drawSubHeader('Recommendations');
            sc.recommendations.slice(0, 3).forEach(rec => {
                checkNewPage(5);
                doc.setFontSize(7);
                doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
                doc.text(`• ${rec.substring(0, 80)}`, 20, y);
                y += 5;
            });
        }
    } else {
        doc.setFontSize(9);
        doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
        doc.text('Supply chain data not available', 20, y);
        y += 10;
    }

    // ==========================================
    // CATEGORY: HIDDEN COSTS AUDIT
    // ==========================================
    drawCategoryHeader('Hidden Costs Audit');

    if (result.issues.hiddenCosts) {
        const hc = result.issues.hiddenCosts;
        const hcColor = hc.score >= 80 ? COLORS.green : hc.score >= 50 ? COLORS.gold : COLORS.red;

        // Cost Overview
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(hcColor[0], hcColor[1], hcColor[2]);
        doc.text(`Cost Efficiency Score: ${hc.score}/100`, 20, y);
        y += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
        doc.text(`Estimated: ${hc.currency}${hc.estimatedMonthlyCost}/mo | Savings: ${hc.currency}${hc.potentialSavings}/mo | Services: ${hc.services.length}`, 20, y);
        y += 8;

        // Redundancies warning
        if (hc.redundancies.length > 0) {
            y += 2;
            doc.setFillColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
            doc.rect(15, y - 3, pageWidth - 30, 8, 'F');
            doc.setTextColor(COLORS.navy[0], COLORS.navy[1], COLORS.navy[2]);
            doc.setFontSize(7);
            const redundancyText = hc.redundancies.map(r => `${r.category}: ${r.services.join(', ')}`).slice(0, 2).join(' | ');
            doc.text(`⚠ Redundant: ${redundancyText.substring(0, 80)}`, 20, y + 2);
            y += 12;
        }

        // Recommendations
        if (hc.recommendations.length > 0) {
            drawSubHeader('Cost Recommendations');
            hc.recommendations.slice(0, 3).forEach(rec => {
                checkNewPage(5);
                doc.setFontSize(7);
                doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
                const savings = rec.savings > 0 ? ` (Save ${hc.currency}${rec.savings}/mo)` : '';
                doc.text(`• ${rec.description.substring(0, 70)}${savings}`, 20, y);
                y += 5;
            });
        }
    } else {
        doc.setFontSize(9);
        doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
        doc.text('Cost analysis data not available', 20, y);
        y += 10;
    }

    // ==========================================
    // CATEGORY: EMAIL DELIVERABILITY AUDIT
    // ==========================================
    drawCategoryHeader('Email Deliverability');

    if (result.issues.emailDeliverability) {
        const ed = result.issues.emailDeliverability;
        const edColor = ed.score >= 80 ? COLORS.green : ed.score >= 50 ? COLORS.gold : COLORS.red;

        // Grade and Score
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(edColor[0], edColor[1], edColor[2]);
        doc.text(`Deliverability Grade: ${ed.grade} (${ed.score}/100)`, 20, y);
        y += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
        doc.text(`SPF: ${ed.spf.exists ? '✓' : '✗'} | DKIM: ${ed.dkim.exists ? '✓' : '✗'} | DMARC: ${ed.dmarc.exists ? '✓' : '✗'} | MX: ${ed.mxRecords.exists ? '✓' : '✗'}`, 20, y);
        y += 6;

        if (ed.mxRecords.provider) {
            doc.text(`Email Provider: ${ed.mxRecords.provider}`, 20, y);
            y += 6;
        }

        // Alerts
        if (ed.alerts.length > 0) {
            y += 2;
            doc.setFillColor(COLORS.red[0], COLORS.red[1], COLORS.red[2]);
            doc.rect(15, y - 3, pageWidth - 30, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(7);
            const alertText = ed.alerts.slice(0, 2).map(a => a.message.substring(0, 50)).join(' | ');
            doc.text(`⚠ ${alertText}`, 20, y + 2);
            y += 12;
        }

        // Recommendations
        if (ed.recommendations.length > 0) {
            drawSubHeader('Recommendations');
            ed.recommendations.slice(0, 3).forEach(rec => {
                checkNewPage(5);
                doc.setFontSize(7);
                doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
                doc.text(`• [${rec.priority.toUpperCase()}] ${rec.title}: ${rec.impact.substring(0, 50)}`, 20, y);
                y += 5;
            });
        }
    } else {
        doc.setFontSize(9);
        doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
        doc.text('Email deliverability data not available', 20, y);
        y += 10;
    }

    // ==========================================
    // CATEGORY: AI USAGE & COMPLIANCE
    // ==========================================
    drawCategoryHeader('AI Usage & Compliance');

    if (result.issues.aiUsage) {
        const ai = result.issues.aiUsage;
        const aiColor = ai.euAiActStatus === 'compliant' ? COLORS.green :
            ai.euAiActStatus === 'action-needed' ? COLORS.gold : COLORS.red;

        // Status and Score
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(aiColor[0], aiColor[1], aiColor[2]);
        const statusLabel = ai.euAiActStatus === 'compliant' ? '✓ Compliant' :
            ai.euAiActStatus === 'action-needed' ? '⚠ Action Needed' :
                ai.euAiActStatus === 'high-risk' ? '🔶 High Risk' : '🚨 Critical';
        doc.text(`EU AI Act Status: ${statusLabel} (${ai.score}/100)`, 20, y);
        y += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
        doc.text(`AI Systems Detected: ${ai.aiSystemsDetected} | High-Risk: ${ai.riskBreakdown.highRisk} | Limited: ${ai.riskBreakdown.limitedRisk}`, 20, y);
        y += 6;

        // Systems list (top 3)
        if (ai.systems.length > 0) {
            y += 2;
            ai.systems.slice(0, 3).forEach(system => {
                checkNewPage(5);
                doc.setFontSize(7);
                doc.text(`• ${system.name} [${system.riskLevel.toUpperCase()}] - ${system.purpose.substring(0, 40)}`, 20, y);
                y += 4;
            });
        }

        // Alerts
        if (ai.alerts.length > 0) {
            y += 2;
            doc.setFillColor(COLORS.red[0], COLORS.red[1], COLORS.red[2]);
            doc.rect(15, y - 3, pageWidth - 30, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(7);
            const alertText = ai.alerts.slice(0, 2).map(a => a.regulation).join(' | ');
            doc.text(`⚠ ${alertText}`, 20, y + 2);
            y += 12;
        }
    } else {
        doc.setFontSize(9);
        doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
        doc.text('AI usage data not available', 20, y);
        y += 10;
    }

    // ==========================================
    // CATEGORY: TECHNOLOGY STACK SECURITY
    // ==========================================
    drawCategoryHeader('Technology Stack');

    if (result.issues.technologyStack) {
        const tech = result.issues.technologyStack;

        // Security Score
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const techColor = tech.score >= 80 ? COLORS.green : tech.score >= 60 ? COLORS.gold : COLORS.red;
        doc.setTextColor(techColor[0], techColor[1], techColor[2]);
        doc.text(`Technology Security Score: ${tech.score}/100`, 20, y);
        y += 6;

        // CMS Detection
        if (tech.cms) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
            const cmsStatus = tech.cms.isOutdated ? '⚠ OUTDATED' : '✓ Current';
            doc.text(`CMS: ${tech.cms.name}${tech.cms.version ? ' v' + tech.cms.version : ''} [${cmsStatus}]`, 20, y);
            y += 5;

            if (tech.cms.isOutdated && tech.cms.latestVersion) {
                doc.setFontSize(8);
                doc.setTextColor(COLORS.red[0], COLORS.red[1], COLORS.red[2]);
                doc.text(`   Update required: latest version is ${tech.cms.latestVersion}`, 20, y);
                y += 5;
            }
        }

        // Framework
        if (tech.framework) {
            doc.setFontSize(8);
            doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
            doc.text(`Framework: ${tech.framework.name}${tech.framework.version ? ' v' + tech.framework.version : ''}`, 20, y);
            y += 4;
        }

        // Server
        if (tech.server?.software) {
            doc.text(`Server: ${tech.server.software}${tech.server.version ? ' v' + tech.server.version : ''}`, 20, y);
            y += 4;
        }

        // Outdated Components Alert
        if (tech.outdatedComponents.length > 0) {
            y += 2;
            doc.setFillColor(COLORS.red[0], COLORS.red[1], COLORS.red[2]);
            doc.rect(15, y - 3, pageWidth - 30, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(7);
            doc.text(`⚠ ${tech.outdatedComponents.length} outdated component(s) detected`, 20, y + 2);
            y += 12;
        }

        y += 4;
    } else {
        doc.setFontSize(9);
        doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
        doc.text('Technology detection data not available', 20, y);
        y += 10;
    }

    // ==========================================
    // CATEGORY: COOKIES & TRACKING
    // ==========================================
    drawCategoryHeader('Cookies & Tracking');

    // ============ EXTERNAL RESOURCES ============
    if (result.issues.externalResources) {
        const er = result.issues.externalResources;
        const totalExternal = er.scripts.length + er.fonts.length + er.iframes.length;
        if (totalExternal > 0) {
            drawSectionHeader('EXTERNAL RESOURCES');

            doc.setFontSize(8);
            doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
            doc.text(`Scripts: ${er.scripts.length} | Fonts: ${er.fonts.length} | Iframes: ${er.iframes.length}`, 20, y);
            y += 6;

            if (er.scripts.length > 0) {
                drawSubHeader('External Scripts');
                er.scripts.slice(0, 5).forEach(s => {
                    checkNewPage(5);
                    doc.setFontSize(7);
                    doc.text(`• ${s.provider}: ${s.src.substring(0, 50)}`, 20, y);
                    y += 4;
                });
            }

            if (er.iframes.length > 0) {
                y += 2;
                drawSubHeader('Iframes');
                er.iframes.slice(0, 3).forEach(s => {
                    checkNewPage(5);
                    doc.setFontSize(7);
                    doc.text(`• ${s.provider}: ${s.src.substring(0, 50)}`, 20, y);
                    y += 4;
                });
            }
            y += 5;
        }
    }

    // ============ THIRD-PARTY TRACKERS ============
    if (result.issues.trackers.length > 0) {
        drawSectionHeader('THIRD-PARTY TRACKERS');

        doc.setFontSize(8);
        doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);

        result.issues.trackers.slice(0, 15).forEach(tracker => {
            checkNewPage(5);
            doc.text(`• ${tracker}`, 20, y);
            y += 5;
        });
        y += 5;
    }

    // ==========================================
    // CATEGORY: VENDORS & DATA FLOW
    // ==========================================
    drawCategoryHeader('Vendors & Data Flow');

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
        drawSectionHeader('⚠ DATA BREACHES DETECTED');

        doc.setTextColor(COLORS.red[0], COLORS.red[1], COLORS.red[2]);
        doc.setFontSize(9);
        doc.text(`This domain has been involved in ${result.issues.dataBreaches.length} known data breach(es):`, 20, y);
        y += 6;

        doc.setTextColor(COLORS.darkGray[0], COLORS.darkGray[1], COLORS.darkGray[2]);
        doc.setFontSize(8);
        result.issues.dataBreaches.forEach(breach => {
            checkNewPage(5);
            doc.text(`• ${breach.name} (${breach.date}) - ${breach.count.toLocaleString()} records`, 20, y);
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
            doc.text(`• ${email}`, 20, y);
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
