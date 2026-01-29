/**
 * Mixed Content Detection Module
 * 
 * Detects HTTP resources loaded on HTTPS pages.
 * Mixed content is a security vulnerability that can:
 * - Allow man-in-the-middle attacks
 * - Expose user data
 * - Cause browser warnings
 */

export interface MixedContentItem {
    type: 'script' | 'style' | 'image' | 'iframe' | 'font' | 'media' | 'xhr' | 'form';
    url: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    blocked: boolean; // Browsers block some mixed content types
    description: string;
    recommendation: string;
}

export interface MixedContentResult {
    detected: boolean;
    totalIssues: number;
    blockedCount: number; // Scripts, iframes - blocked by browsers
    warningCount: number; // Images, media - show warning but load
    issues: MixedContentItem[];
    score: number; // 0-100
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
}

// Resource types and their severity
const RESOURCE_SEVERITY: Record<string, { severity: 'low' | 'medium' | 'high' | 'critical'; blocked: boolean }> = {
    script: { severity: 'critical', blocked: true },
    iframe: { severity: 'critical', blocked: true },
    style: { severity: 'high', blocked: true },
    font: { severity: 'high', blocked: true },
    xhr: { severity: 'high', blocked: true },
    form: { severity: 'critical', blocked: false }, // Forms can submit to HTTP
    image: { severity: 'medium', blocked: false },
    media: { severity: 'medium', blocked: false },
};

/**
 * Detect mixed content in HTML
 */
export function detectMixedContent(html: string, pageUrl?: string): MixedContentResult {
    const issues: MixedContentItem[] = [];
    const byType = {
        scripts: 0,
        styles: 0,
        images: 0,
        iframes: 0,
        fonts: 0,
        media: 0,
        forms: 0,
        other: 0
    };

    // Skip if page is HTTP (mixed content only applies to HTTPS)
    if (pageUrl && pageUrl.startsWith('http://')) {
        return {
            detected: false,
            totalIssues: 0,
            blockedCount: 0,
            warningCount: 0,
            issues: [],
            score: 100,
            byType,
            recommendations: ['Page is served over HTTP - consider upgrading to HTTPS']
        };
    }

    // Detect HTTP scripts
    const scriptPattern = /<script[^>]+src\s*=\s*["']?(http:\/\/[^"'\s>]+)/gi;
    let match: RegExpExecArray | null;
    while ((match = scriptPattern.exec(html)) !== null) {
        issues.push(createMixedContentItem('script', match[1]));
        byType.scripts++;
    }

    // Detect HTTP stylesheets
    const stylePattern = /<link[^>]+href\s*=\s*["']?(http:\/\/[^"'\s>]+)[^>]+rel\s*=\s*["']?stylesheet/gi;
    const stylePattern2 = /<link[^>]+rel\s*=\s*["']?stylesheet[^>]+href\s*=\s*["']?(http:\/\/[^"'\s>]+)/gi;
    while ((match = stylePattern.exec(html)) !== null) {
        issues.push(createMixedContentItem('style', match[1]));
        byType.styles++;
    }
    while ((match = stylePattern2.exec(html)) !== null) {
        const matchUrl = match[1];
        if (!issues.some(i => i.url === matchUrl)) {
            issues.push(createMixedContentItem('style', matchUrl));
            byType.styles++;
        }
    }

    // Detect HTTP images
    const imgPattern = /<img[^>]+src\s*=\s*["']?(http:\/\/[^"'\s>]+)/gi;
    while ((match = imgPattern.exec(html)) !== null) {
        issues.push(createMixedContentItem('image', match[1]));
        byType.images++;
    }

    // Detect HTTP iframes
    const iframePattern = /<iframe[^>]+src\s*=\s*["']?(http:\/\/[^"'\s>]+)/gi;
    while ((match = iframePattern.exec(html)) !== null) {
        issues.push(createMixedContentItem('iframe', match[1]));
        byType.iframes++;
    }

    // Detect HTTP fonts in CSS
    const fontPattern = /url\s*\(\s*["']?(http:\/\/[^"')]+\.(woff2?|ttf|otf|eot))/gi;
    while ((match = fontPattern.exec(html)) !== null) {
        issues.push(createMixedContentItem('font', match[1]));
        byType.fonts++;
    }

    // Detect HTTP video/audio
    const mediaPattern = /<(video|audio)[^>]+src\s*=\s*["']?(http:\/\/[^"'\s>]+)/gi;
    const sourcePattern = /<source[^>]+src\s*=\s*["']?(http:\/\/[^"'\s>]+)/gi;
    while ((match = mediaPattern.exec(html)) !== null) {
        issues.push(createMixedContentItem('media', match[2]));
        byType.media++;
    }
    while ((match = sourcePattern.exec(html)) !== null) {
        issues.push(createMixedContentItem('media', match[1]));
        byType.media++;
    }

    // Detect HTTP form actions
    const formPattern = /<form[^>]+action\s*=\s*["']?(http:\/\/[^"'\s>]+)/gi;
    while ((match = formPattern.exec(html)) !== null) {
        issues.push(createMixedContentItem('form', match[1]));
        byType.forms++;
    }

    // Calculate counts
    const blockedCount = issues.filter(i => i.blocked).length;
    const warningCount = issues.filter(i => !i.blocked).length;

    // Calculate score
    let score = 100;
    for (const issue of issues) {
        switch (issue.severity) {
            case 'critical': score -= 25; break;
            case 'high': score -= 15; break;
            case 'medium': score -= 5; break;
        }
    }
    score = Math.max(0, score);

    // Generate recommendations
    const recommendations: string[] = [];
    if (byType.scripts > 0) {
        recommendations.push('CRITICAL: HTTP scripts are blocked by browsers - update to HTTPS');
    }
    if (byType.iframes > 0) {
        recommendations.push('CRITICAL: HTTP iframes are blocked - use HTTPS sources');
    }
    if (byType.forms > 0) {
        recommendations.push('CRITICAL: Form submits to HTTP - user data at risk');
    }
    if (byType.images > 0 || byType.media > 0) {
        recommendations.push('Update image and media URLs to HTTPS to avoid warnings');
    }
    if (issues.length === 0) {
        recommendations.push('No mixed content detected - all resources loaded securely');
    }

    return {
        detected: issues.length > 0,
        totalIssues: issues.length,
        blockedCount,
        warningCount,
        issues,
        score,
        byType,
        recommendations
    };
}

/**
 * Helper to create mixed content item
 */
function createMixedContentItem(type: MixedContentItem['type'], url: string): MixedContentItem {
    const config = RESOURCE_SEVERITY[type] || { severity: 'medium', blocked: false };

    const descriptions: Record<string, string> = {
        script: 'HTTP script blocked by browser - will not execute',
        style: 'HTTP stylesheet blocked - styles will not apply',
        image: 'HTTP image loads with warning - may show broken in some browsers',
        iframe: 'HTTP iframe blocked - embedded content will not display',
        font: 'HTTP font blocked - fallback font will be used',
        media: 'HTTP media may not play in all browsers',
        form: 'Form submits data over unencrypted HTTP connection',
        xhr: 'XHR/fetch to HTTP endpoint blocked'
    };

    return {
        type,
        url: url.substring(0, 150),
        severity: config.severity,
        blocked: config.blocked,
        description: descriptions[type] || 'Insecure HTTP resource',
        recommendation: `Update to HTTPS: ${url.replace('http://', 'https://').substring(0, 100)}`
    };
}

/**
 * Get step-by-step fix (Pro)
 */
export function getMixedContentFix(item: MixedContentItem): string[] {
    const steps: string[] = [];

    steps.push(`1. Locate the ${item.type} with URL: ${item.url.substring(0, 80)}`);
    steps.push('2. Change the URL from http:// to https://');
    steps.push('3. If the resource doesn\'t support HTTPS:');
    steps.push('   a) Host the resource on your own server');
    steps.push('   b) Find an alternative HTTPS source');
    steps.push('   c) Download and serve locally');
    steps.push('4. Use protocol-relative URLs (//example.com/resource) as fallback');
    steps.push('5. Add Content-Security-Policy: upgrade-insecure-requests header');

    return steps;
}
