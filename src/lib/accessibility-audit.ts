/**
 * Accessibility Audit - EAA 2025 / WCAG 2.1 AA Compliance Checker
 * Uses pattern-based analysis (no browser required) for accessibility issues
 */

export interface AccessibilityViolation {
    id: string;
    impact: 'critical' | 'serious' | 'moderate' | 'minor';
    description: string;
    helpUrl: string;
    nodes: number;
    wcagCriteria: string;
    category: string;
}

export interface AccessibilityResult {
    score: number;
    totalIssues: number;
    criticalCount: number;
    seriousCount: number;
    moderateCount: number;
    minorCount: number;
    violations: AccessibilityViolation[];
    passes: string[];
}

// WCAG 2.1 AA checks we can perform via HTML analysis
const ACCESSIBILITY_CHECKS = {
    // Images
    'image-alt': {
        id: 'image-alt',
        wcag: '1.1.1',
        category: 'Images',
        impact: 'critical' as const,
        description: 'Images must have alternate text',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
        check: (html: string) => {
            const imgWithoutAlt = html.match(/<img(?![^>]*alt=)[^>]*>/gi) || [];
            const imgWithEmptyAlt = html.match(/<img[^>]*alt=["']\s*["'][^>]*>/gi) || [];
            // Filter decorative images (likely have role="presentation" or aria-hidden)
            const problematic = imgWithoutAlt.filter(img =>
                !img.includes('role="presentation"') &&
                !img.includes('aria-hidden="true"')
            );
            return problematic.length;
        }
    },

    // Forms
    'label': {
        id: 'label',
        wcag: '1.3.1',
        category: 'Forms',
        impact: 'critical' as const,
        description: 'Form elements must have labels',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html',
        check: (html: string) => {
            // Find inputs without associated labels or aria-label
            const inputs = html.match(/<input[^>]*type=["'](?:text|email|password|tel|number|search)[^>]*>/gi) || [];
            const unlabeled = inputs.filter(input =>
                !input.includes('aria-label') &&
                !input.includes('aria-labelledby') &&
                !input.includes('id=') // No id means no label can reference it
            );
            return unlabeled.length;
        }
    },

    // Document structure
    'html-has-lang': {
        id: 'html-has-lang',
        wcag: '3.1.1',
        category: 'Language',
        impact: 'serious' as const,
        description: 'Page must have a lang attribute',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/language-of-page.html',
        check: (html: string) => {
            const hasLang = /<html[^>]*lang=["'][a-z]{2,}["'][^>]*>/i.test(html);
            return hasLang ? 0 : 1;
        }
    },

    'document-title': {
        id: 'document-title',
        wcag: '2.4.2',
        category: 'Document',
        impact: 'serious' as const,
        description: 'Document must have a title element',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/page-titled.html',
        check: (html: string) => {
            const hasTitle = /<title[^>]*>[^<]+<\/title>/i.test(html);
            return hasTitle ? 0 : 1;
        }
    },

    // Headings
    'heading-order': {
        id: 'heading-order',
        wcag: '1.3.1',
        category: 'Structure',
        impact: 'moderate' as const,
        description: 'Heading levels should increase by one',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html',
        check: (html: string) => {
            const headings = html.match(/<h[1-6][^>]*>/gi) || [];
            let issues = 0;
            let lastLevel = 0;

            for (const h of headings) {
                const level = parseInt(h.charAt(2));
                if (lastLevel > 0 && level > lastLevel + 1) {
                    issues++;
                }
                lastLevel = level;
            }
            return issues;
        }
    },

    'page-has-heading-one': {
        id: 'page-has-heading-one',
        wcag: '1.3.1',
        category: 'Structure',
        impact: 'moderate' as const,
        description: 'Page should have at least one h1 heading',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html',
        check: (html: string) => {
            const hasH1 = /<h1[^>]*>/i.test(html);
            return hasH1 ? 0 : 1;
        }
    },

    // Links
    'link-name': {
        id: 'link-name',
        wcag: '2.4.4',
        category: 'Links',
        impact: 'serious' as const,
        description: 'Links must have discernible text',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html',
        check: (html: string) => {
            // Find empty links or links with only images without alt
            const emptyLinks = html.match(/<a[^>]*>\s*<\/a>/gi) || [];
            const iconOnlyLinks = html.match(/<a[^>]*>\s*<(?:i|span|svg)[^>]*(?:class=["'][^"']*(?:icon|fa-|material)[^"']*["'])[^>]*>\s*<\/(?:i|span|svg)>\s*<\/a>/gi) || [];
            return emptyLinks.length + iconOnlyLinks.filter(l => !l.includes('aria-label')).length;
        }
    },

    // Color contrast (heuristic - check for known bad patterns)
    'color-contrast': {
        id: 'color-contrast',
        wcag: '1.4.3',
        category: 'Color',
        impact: 'serious' as const,
        description: 'Text must have sufficient color contrast',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html',
        check: (html: string) => {
            // Detect common low-contrast patterns in inline styles
            const lowContrastPatterns = [
                /color:\s*#[a-f0-9]{3,6}[^;]*;\s*background[^:]*:\s*#[a-f0-9]{3,6}/gi,
                /color:\s*(?:lightgray|lightgrey|silver|#(?:ccc|ddd|eee|aaa|bbb))/gi,
            ];
            let issues = 0;
            for (const pattern of lowContrastPatterns) {
                const matches = html.match(pattern) || [];
                issues += matches.length;
            }
            return Math.min(issues, 5); // Cap at 5 to avoid false positives
        }
    },

    // ARIA
    'aria-valid-attr': {
        id: 'aria-valid-attr',
        wcag: '4.1.2',
        category: 'ARIA',
        impact: 'critical' as const,
        description: 'ARIA attributes must be valid',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html',
        check: (html: string) => {
            const invalidAria = html.match(/aria-[a-z]+(?:=""|\s*=\s*["']\s*["'])/gi) || [];
            return invalidAria.length;
        }
    },

    'button-name': {
        id: 'button-name',
        wcag: '4.1.2',
        category: 'Forms',
        impact: 'critical' as const,
        description: 'Buttons must have discernible text',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html',
        check: (html: string) => {
            const emptyButtons = html.match(/<button[^>]*>\s*<\/button>/gi) || [];
            const iconButtons = html.match(/<button[^>]*>\s*<(?:i|span|svg)[^>]*>\s*<\/(?:i|span|svg)>\s*<\/button>/gi) || [];
            const unlabeled = iconButtons.filter(b => !b.includes('aria-label') && !b.includes('title='));
            return emptyButtons.length + unlabeled.length;
        }
    },

    // Tables
    'td-headers-attr': {
        id: 'td-headers-attr',
        wcag: '1.3.1',
        category: 'Tables',
        impact: 'serious' as const,
        description: 'Data tables should have headers',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html',
        check: (html: string) => {
            const tables = html.match(/<table[^>]*>[\s\S]*?<\/table>/gi) || [];
            let issues = 0;
            for (const table of tables) {
                // Check if table has data rows but no th elements
                const hasTd = /<td[^>]*>/i.test(table);
                const hasTh = /<th[^>]*>/i.test(table);
                const isLayoutTable = table.includes('role="presentation"') || table.includes('role="none"');

                if (hasTd && !hasTh && !isLayoutTable) {
                    issues++;
                }
            }
            return issues;
        }
    },

    // Skip links
    'skip-link': {
        id: 'skip-link',
        wcag: '2.4.1',
        category: 'Navigation',
        impact: 'minor' as const, // Reduced from moderate - many modern SPAs handle navigation differently
        description: 'Page should have a skip link',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks.html',
        check: (html: string) => {
            // Check for skip links or main landmark (which also satisfies bypass requirement)
            const hasSkipLink = /skip[^"']*(?:nav|link|content|main)/i.test(html) ||
                /#(?:main|content|skip)/i.test(html);
            const hasMainLandmark = /<main[^>]*>/i.test(html) || /role=["']main["']/i.test(html);
            const hasSkipToMain = /href=["']#main-content["']/i.test(html);
            return (hasSkipLink || hasMainLandmark || hasSkipToMain) ? 0 : 1;
        }
    },

    // Focus visible (check for outline:none without alternative)
    'focus-visible': {
        id: 'focus-visible',
        wcag: '2.4.7',
        category: 'Focus',
        impact: 'serious' as const,
        description: 'Focus must be visible',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html',
        check: (html: string) => {
            // Check for outline:none or outline:0 in styles without :focus-visible
            const dangerousOutline = html.match(/outline:\s*(?:none|0)[^;]*;/gi) || [];
            // This is a heuristic - actual focus visibility requires runtime testing
            return Math.min(dangerousOutline.length, 3);
        }
    },

    // Meta viewport
    'meta-viewport': {
        id: 'meta-viewport',
        wcag: '1.4.4',
        category: 'Responsive',
        impact: 'moderate' as const,
        description: 'Viewport must allow zooming',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html',
        check: (html: string) => {
            const viewport = html.match(/<meta[^>]*name=["']viewport["'][^>]*>/i);
            if (!viewport) return 0; // No viewport is fine

            const content = viewport[0];
            const disablesZoom = /user-scalable\s*=\s*(?:no|0)/i.test(content) ||
                /maximum-scale\s*=\s*1(?:\.0)?/i.test(content);
            return disablesZoom ? 1 : 0;
        }
    },

    // Landmarks
    'landmark-main': {
        id: 'landmark-main',
        wcag: '1.3.1',
        category: 'Landmarks',
        impact: 'moderate' as const,
        description: 'Page should have a main landmark',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html',
        check: (html: string) => {
            const hasMain = /<main[^>]*>/i.test(html) ||
                /role=["']main["']/i.test(html);
            return hasMain ? 0 : 1;
        }
    },

    // Tabindex usage (minor - best practice)
    'tabindex-positive': {
        id: 'tabindex-positive',
        wcag: '2.4.3',
        category: 'Focus',
        impact: 'minor' as const,
        description: 'Avoid positive tabindex values',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/focus-order.html',
        check: (html: string) => {
            // Check for tabindex > 0 which disrupts natural focus order
            const positiveTabindex = html.match(/tabindex=["']\s*[1-9]\d*\s*["']/gi) || [];
            return Math.min(positiveTabindex.length, 3);
        }
    },
};

/**
 * Analyze HTML for accessibility issues (WCAG 2.1 AA)
 */
export function analyzeAccessibility(html: string): AccessibilityResult {
    const violations: AccessibilityViolation[] = [];
    const passes: string[] = [];

    let criticalCount = 0;
    let seriousCount = 0;
    let moderateCount = 0;
    let minorCount = 0;

    for (const [, check] of Object.entries(ACCESSIBILITY_CHECKS)) {
        const issueCount = check.check(html);

        if (issueCount > 0) {
            violations.push({
                id: check.id,
                impact: check.impact,
                description: check.description,
                helpUrl: check.helpUrl,
                nodes: issueCount,
                wcagCriteria: check.wcag,
                category: check.category,
            });

            switch (check.impact) {
                case 'critical': criticalCount += issueCount; break;
                case 'serious': seriousCount += issueCount; break;
                case 'moderate': moderateCount += issueCount; break;
                case 'minor': minorCount += issueCount; break;
            }
        } else {
            passes.push(check.description);
        }
    }

    // Calculate score (weighted by impact)
    const totalChecks = Object.keys(ACCESSIBILITY_CHECKS).length;
    const passedChecks = passes.length;

    // Penalty-based scoring - reduced penalties for modern framework compatibility
    // Modern frameworks often trigger technical violations that don't affect real accessibility
    const criticalPenalty = criticalCount * 8;  // Reduced from 15
    const seriousPenalty = seriousCount * 5;    // Reduced from 8
    const moderatePenalty = moderateCount * 2;  // Reduced from 4
    const minorPenalty = minorCount * 0.5;      // Reduced from 1

    const totalPenalty = criticalPenalty + seriousPenalty + moderatePenalty + minorPenalty;
    const baseScore = (passedChecks / totalChecks) * 100;
    const score = Math.max(0, Math.round(baseScore - totalPenalty));

    const totalIssues = criticalCount + seriousCount + moderateCount + minorCount;

    return {
        score,
        totalIssues,
        criticalCount,
        seriousCount,
        moderateCount,
        minorCount,
        violations: violations.sort((a, b) => {
            const impactOrder = { critical: 0, serious: 1, moderate: 2, minor: 3 };
            return impactOrder[a.impact] - impactOrder[b.impact];
        }),
        passes,
    };
}

