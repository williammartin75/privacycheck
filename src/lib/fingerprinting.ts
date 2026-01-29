/**
 * Canvas Fingerprinting Detection Module
 * 
 * Detects browser fingerprinting techniques used to track users without cookies.
 * These are considered highly invasive and may violate GDPR's consent requirements.
 * 
 * Detects:
 * - Canvas fingerprinting (toDataURL, getImageData)
 * - WebGL fingerprinting
 * - Audio fingerprinting (AudioContext)
 * - Font fingerprinting
 * - Screen/device fingerprinting
 */

export interface FingerprintingIssue {
    type: 'canvas' | 'webgl' | 'audio' | 'font' | 'device' | 'battery' | 'connection';
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    scriptSrc?: string;
    evidence?: string;
    gdprImpact: string;
    recommendation: string;
}

export interface FingerprintingResult {
    detected: boolean;
    totalTechniques: number;
    score: number; // 0-100, higher is better (no fingerprinting)
    issues: FingerprintingIssue[];
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
}

// Fingerprinting detection patterns
const FINGERPRINT_PATTERNS = {
    canvas: [
        /\.toDataURL\s*\(/gi,
        /\.getImageData\s*\(/gi,
        /canvas.*toBlob/gi,
        /CanvasRenderingContext2D/gi,
        /measureText\s*\([^)]*\).*width/gi,
        /fillText\s*\([^)]{50,}/gi, // Long fillText often used for fingerprinting
    ],
    webgl: [
        /getExtension\s*\(\s*['"]WEBGL/gi,
        /getSupportedExtensions\s*\(/gi,
        /getParameter\s*\(\s*gl\./gi,
        /UNMASKED_VENDOR_WEBGL/gi,
        /UNMASKED_RENDERER_WEBGL/gi,
        /webglcontextcreationerror/gi,
    ],
    audio: [
        /AudioContext\s*\(/gi,
        /webkitAudioContext/gi,
        /createOscillator\s*\(/gi,
        /createAnalyser\s*\(/gi,
        /createDynamicsCompressor/gi,
        /destination\.context/gi,
    ],
    font: [
        /measureText[\s\S]*width[\s\S]*measureText/gi,
        /font-family.*sans-serif.*serif.*monospace/gi,
        /offsetWidth.*offsetHeight/gi,
        /FontFace\s*\(/gi,
        /document\.fonts\.check/gi,
    ],
    device: [
        /navigator\.plugins/gi,
        /navigator\.mimeTypes/gi,
        /screen\.colorDepth/gi,
        /screen\.pixelDepth/gi,
        /navigator\.hardwareConcurrency/gi,
        /navigator\.deviceMemory/gi,
        /navigator\.maxTouchPoints/gi,
    ],
    battery: [
        /getBattery\s*\(/gi,
        /navigator\.battery/gi,
        /BatteryManager/gi,
    ],
    connection: [
        /navigator\.connection/gi,
        /NetworkInformation/gi,
        /connection\.effectiveType/gi,
    ]
};

// Known fingerprinting library patterns
const KNOWN_FINGERPRINT_LIBS = [
    { pattern: /fingerprintjs/i, name: 'FingerprintJS', severity: 'critical' as const },
    { pattern: /fingerprint2/i, name: 'Fingerprint2', severity: 'critical' as const },
    { pattern: /clientjs/i, name: 'ClientJS', severity: 'high' as const },
    { pattern: /imprint\.js/i, name: 'ImprintJS', severity: 'high' as const },
    { pattern: /valve\.fingerprint/i, name: 'Valve Fingerprint', severity: 'high' as const },
    { pattern: /evercookie/i, name: 'Evercookie', severity: 'critical' as const },
    { pattern: /supercookie/i, name: 'Supercookie', severity: 'critical' as const },
];

/**
 * Detect fingerprinting techniques in HTML/JavaScript
 */
export function detectFingerprinting(html: string, scripts?: string[]): FingerprintingResult {
    const issues: FingerprintingIssue[] = [];
    const byType = {
        canvas: 0,
        webgl: 0,
        audio: 0,
        font: 0,
        device: 0,
        other: 0
    };

    // Combine all content for analysis
    const content = [html, ...(scripts || [])].join('\n');

    // Check for known fingerprinting libraries
    for (const lib of KNOWN_FINGERPRINT_LIBS) {
        if (lib.pattern.test(content)) {
            issues.push({
                type: 'canvas',
                description: `Known fingerprinting library detected: ${lib.name}`,
                severity: lib.severity,
                evidence: lib.name,
                gdprImpact: 'Browser fingerprinting requires explicit consent under GDPR',
                recommendation: `Remove ${lib.name} or obtain explicit consent before loading`
            });
            byType.canvas++;
        }
    }

    // Check for canvas fingerprinting
    for (const pattern of FINGERPRINT_PATTERNS.canvas) {
        const matches = content.match(pattern);
        if (matches && matches.length > 0) {
            // Check context - multiple canvas operations indicate fingerprinting
            if (matches.length >= 2 || content.includes('fingerprint') || content.includes('hash')) {
                issues.push({
                    type: 'canvas',
                    description: 'Canvas fingerprinting technique detected',
                    severity: 'high',
                    evidence: matches[0].substring(0, 100),
                    gdprImpact: 'Canvas fingerprinting creates a unique device identifier without consent',
                    recommendation: 'Remove canvas fingerprinting or implement consent-first approach'
                });
                byType.canvas++;
                break; // Only flag once per type
            }
        }
    }

    // Check for WebGL fingerprinting
    let webglCount = 0;
    for (const pattern of FINGERPRINT_PATTERNS.webgl) {
        if (pattern.test(content)) {
            webglCount++;
        }
    }
    if (webglCount >= 2) {
        issues.push({
            type: 'webgl',
            description: 'WebGL fingerprinting technique detected',
            severity: 'high',
            gdprImpact: 'WebGL fingerprinting reveals GPU information for tracking',
            recommendation: 'Remove WebGL fingerprinting code or gate behind consent'
        });
        byType.webgl++;
    }

    // Check for audio fingerprinting
    let audioCount = 0;
    for (const pattern of FINGERPRINT_PATTERNS.audio) {
        if (pattern.test(content)) {
            audioCount++;
        }
    }
    if (audioCount >= 3) {
        issues.push({
            type: 'audio',
            description: 'Audio fingerprinting technique detected',
            severity: 'high',
            gdprImpact: 'AudioContext fingerprinting tracks users without cookies',
            recommendation: 'Remove audio fingerprinting or require explicit opt-in'
        });
        byType.audio++;
    }

    // Check for font fingerprinting
    let fontCount = 0;
    for (const pattern of FINGERPRINT_PATTERNS.font) {
        if (pattern.test(content)) {
            fontCount++;
        }
    }
    if (fontCount >= 2) {
        issues.push({
            type: 'font',
            description: 'Font fingerprinting technique detected',
            severity: 'medium',
            gdprImpact: 'Font enumeration creates a trackable device signature',
            recommendation: 'Avoid enumerating installed fonts for tracking purposes'
        });
        byType.font++;
    }

    // Check for device fingerprinting
    let deviceCount = 0;
    for (const pattern of FINGERPRINT_PATTERNS.device) {
        if (pattern.test(content)) {
            deviceCount++;
        }
    }
    if (deviceCount >= 3) {
        issues.push({
            type: 'device',
            description: 'Device/hardware fingerprinting detected',
            severity: 'medium',
            gdprImpact: 'Collecting device properties creates a trackable fingerprint',
            recommendation: 'Minimize collection of device properties to what is necessary'
        });
        byType.device++;
    }

    // Check battery/connection API (rarely legitimate)
    for (const pattern of FINGERPRINT_PATTERNS.battery) {
        if (pattern.test(content)) {
            issues.push({
                type: 'battery',
                description: 'Battery API accessed (potential fingerprinting)',
                severity: 'low',
                gdprImpact: 'Battery status can contribute to device fingerprinting',
                recommendation: 'Remove Battery API usage unless essential for functionality'
            });
            byType.other++;
            break;
        }
    }

    // Calculate score
    let score = 100;
    for (const issue of issues) {
        switch (issue.severity) {
            case 'critical': score -= 30; break;
            case 'high': score -= 20; break;
            case 'medium': score -= 10; break;
            case 'low': score -= 5; break;
        }
    }
    score = Math.max(0, score);

    // Determine risk level
    const riskLevel: FingerprintingResult['riskLevel'] =
        issues.some(i => i.severity === 'critical') ? 'critical' :
            issues.some(i => i.severity === 'high') ? 'high' :
                issues.some(i => i.severity === 'medium') ? 'medium' :
                    issues.length > 0 ? 'low' : 'none';

    // Generate recommendations
    const recommendations: string[] = [];
    if (issues.some(i => i.type === 'canvas')) {
        recommendations.push('Remove or gate canvas fingerprinting behind explicit consent');
    }
    if (issues.some(i => i.type === 'webgl')) {
        recommendations.push('Avoid using WebGL for device identification');
    }
    if (issues.some(i => i.type === 'audio')) {
        recommendations.push('Remove AudioContext fingerprinting code');
    }
    if (issues.length === 0) {
        recommendations.push('No fingerprinting techniques detected');
    }

    return {
        detected: issues.length > 0,
        totalTechniques: Object.values(byType).reduce((a, b) => a + b, 0),
        score,
        issues,
        byType,
        riskLevel,
        recommendations
    };
}

/**
 * Get Pro/Pro+ step-by-step fix instructions
 */
export function getFingerprintingFix(issue: FingerprintingIssue): string[] {
    const steps: string[] = [];

    switch (issue.type) {
        case 'canvas':
            steps.push('1. Search your codebase for toDataURL() and getImageData() calls');
            steps.push('2. If using a fingerprinting library, remove it from package.json');
            steps.push('3. If fingerprinting is needed for fraud prevention:');
            steps.push('   a) Add to your cookie consent banner as a toggle');
            steps.push('   b) Only execute fingerprinting AFTER user consent');
            steps.push('   c) Disclose this in your privacy policy');
            steps.push('4. Consider server-side fraud detection alternatives');
            steps.push('5. Test with FingerprintJS detector browser extensions');
            break;

        case 'webgl':
            steps.push('1. Search for getExtension("WEBGL") and getSupportedExtensions()');
            steps.push('2. Remove UNMASKED_VENDOR_WEBGL and UNMASKED_RENDERER_WEBGL calls');
            steps.push('3. If WebGL is needed for graphics, avoid collecting GPU info');
            steps.push('4. Ensure WebGL usage is disclosed in privacy policy');
            break;

        case 'audio':
            steps.push('1. Search for AudioContext and createOscillator() calls');
            steps.push('2. Remove audio fingerprinting code entirely');
            steps.push('3. If audio is needed for functionality, ensure consent first');
            break;

        case 'font':
            steps.push('1. Avoid measuring text width across multiple fonts');
            steps.push('2. Use web fonts instead of detecting installed fonts');
            steps.push('3. Remove offsetWidth/offsetHeight font detection loops');
            break;

        case 'device':
            steps.push('1. Minimize use of navigator properties');
            steps.push('2. Only collect device info necessary for functionality');
            steps.push('3. Document legitimate purpose in privacy policy');
            steps.push('4. Add to consent management where appropriate');
            break;

        default:
            steps.push('1. Review the flagged code for privacy implications');
            steps.push('2. Remove or gate behind consent as appropriate');
    }

    return steps;
}

/**
 * Get risk level styling
 */
export function getRiskLevelInfo(level: FingerprintingResult['riskLevel']): { color: string; bgColor: string; label: string } {
    const info = {
        none: { color: 'text-green-700', bgColor: 'bg-green-100', label: 'Clean' },
        low: { color: 'text-blue-700', bgColor: 'bg-blue-100', label: 'Low' },
        medium: { color: 'text-yellow-700', bgColor: 'bg-yellow-100', label: 'Medium' },
        high: { color: 'text-orange-700', bgColor: 'bg-orange-100', label: 'High' },
        critical: { color: 'text-red-700', bgColor: 'bg-red-100', label: 'Critical' }
    };
    return info[level];
}
