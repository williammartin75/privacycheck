/**
 * Technology & CMS Detection Module
 * Detects CMS platforms, frameworks, and versions for security assessment
 * For PrivacyChecker - Lightweight security scan
 */

// ============ INTERFACES ============

export interface TechnologyResult {
    score: number; // 0-100 security score
    cms: CMSDetection | null;
    framework: FrameworkDetection | null;
    server: ServerDetection | null;
    technologies: DetectedTechnology[];
    outdatedComponents: OutdatedComponent[];
    alerts: TechnologyAlert[];
    recommendations: string[];
    summary: string;
}

export interface CMSDetection {
    name: string;
    version: string | null;
    confidence: 'high' | 'medium' | 'low';
    isOutdated: boolean;
    latestVersion: string | null;
    securityRisk: 'low' | 'medium' | 'high' | 'critical';
    cveCount?: number;
}

export interface FrameworkDetection {
    name: string;
    version: string | null;
    type: 'frontend' | 'backend' | 'fullstack';
}

export interface ServerDetection {
    software: string | null;
    version: string | null;
    os: string | null;
}

export interface DetectedTechnology {
    name: string;
    category: 'cms' | 'framework' | 'library' | 'analytics' | 'cdn' | 'hosting' | 'security' | 'ecommerce' | 'other';
    version: string | null;
    confidence: 'high' | 'medium' | 'low';
}

export interface OutdatedComponent {
    name: string;
    currentVersion: string;
    latestVersion: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    recommendation: string;
}

export interface TechnologyAlert {
    severity: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
}

// ============ CMS PATTERNS ============

interface CMSPattern {
    name: string;
    patterns: RegExp[];
    versionPatterns: RegExp[];
    latestVersion: string;
    securityUrl: string;
}

const CMS_PATTERNS: CMSPattern[] = [
    {
        name: 'WordPress',
        patterns: [
            /wp-content\//i,
            /wp-includes\//i,
            /<meta name="generator" content="WordPress/i,
            /\/wp-json\//i,
            /wp-embed\.min\.js/i,
            /class="wp-/i,
            /id="wp-/i,
        ],
        versionPatterns: [
            /<meta name="generator" content="WordPress ([\d.]+)"/i,
            /ver=([\d.]+)/,
            /wp-emoji-release\.min\.js\?ver=([\d.]+)/i,
        ],
        latestVersion: '6.4.2',
        securityUrl: 'https://wordpress.org/news/category/security/'
    },
    {
        name: 'Drupal',
        patterns: [
            /Drupal\.settings/i,
            /\/sites\/default\/files/i,
            /<meta name="Generator" content="Drupal/i,
            /drupal\.js/i,
            /\/core\/misc\/drupal/i,
        ],
        versionPatterns: [
            /<meta name="Generator" content="Drupal ([\d.]+)"/i,
        ],
        latestVersion: '10.2.2',
        securityUrl: 'https://www.drupal.org/security'
    },
    {
        name: 'Joomla',
        patterns: [
            /\/media\/jui\//i,
            /<meta name="generator" content="Joomla/i,
            /\/administrator\/index\.php/i,
            /Joomla\.JText/i,
        ],
        versionPatterns: [
            /<meta name="generator" content="Joomla! ([\d.]+)"/i,
        ],
        latestVersion: '5.0.2',
        securityUrl: 'https://developer.joomla.org/security-centre.html'
    },
    {
        name: 'Shopify',
        patterns: [
            /cdn\.shopify\.com/i,
            /myshopify\.com/i,
            /Shopify\.theme/i,
            /shopify-section/i,
        ],
        versionPatterns: [],
        latestVersion: 'SaaS',
        securityUrl: 'https://www.shopify.com/security'
    },
    {
        name: 'Magento',
        patterns: [
            /\/skin\/frontend\//i,
            /Mage\.Cookies/i,
            /\/static\/frontend\//i,
            /requirejs-min-resolver/i,
        ],
        versionPatterns: [],
        latestVersion: '2.4.6',
        securityUrl: 'https://helpx.adobe.com/security/products/magento.html'
    },
    {
        name: 'PrestaShop',
        patterns: [
            /prestashop/i,
            /\/modules\/ps_/i,
            /\/themes\/classic\//i,
            /PrestaShop/i,
        ],
        versionPatterns: [],
        latestVersion: '8.1.2',
        securityUrl: 'https://www.prestashop.com/en/security'
    },
    {
        name: 'Wix',
        patterns: [
            /static\.wixstatic\.com/i,
            /wix\.com/i,
            /_wix_/i,
        ],
        versionPatterns: [],
        latestVersion: 'SaaS',
        securityUrl: 'https://www.wix.com/about/privacy'
    },
    {
        name: 'Squarespace',
        patterns: [
            /static\.squarespace\.com/i,
            /squarespace\.com/i,
            /sqs-/i,
        ],
        versionPatterns: [],
        latestVersion: 'SaaS',
        securityUrl: 'https://www.squarespace.com/security'
    },
    {
        name: 'Webflow',
        patterns: [
            /webflow\.com/i,
            /assets\.website-files\.com/i,
            /data-wf-/i,
        ],
        versionPatterns: [],
        latestVersion: 'SaaS',
        securityUrl: 'https://webflow.com/security'
    },
    {
        name: 'Ghost',
        patterns: [
            /<meta name="generator" content="Ghost/i,
            /ghost-/i,
            /\/ghost\/api\//i,
        ],
        versionPatterns: [
            /<meta name="generator" content="Ghost ([\d.]+)"/i,
        ],
        latestVersion: '5.75.0',
        securityUrl: 'https://ghost.org/changelog/'
    },
];

// ============ FRAMEWORK PATTERNS ============

interface FrameworkPattern {
    name: string;
    type: 'frontend' | 'backend' | 'fullstack';
    patterns: RegExp[];
    versionPatterns: RegExp[];
}

const FRAMEWORK_PATTERNS: FrameworkPattern[] = [
    {
        name: 'React',
        type: 'frontend',
        patterns: [/data-reactroot/i, /__NEXT_DATA__/i, /react/i],
        versionPatterns: [/react@([\d.]+)/i],
    },
    {
        name: 'Next.js',
        type: 'fullstack',
        patterns: [/__NEXT_DATA__/i, /_next\/static/i, /next\.js/i],
        versionPatterns: [],
    },
    {
        name: 'Vue.js',
        type: 'frontend',
        patterns: [/data-v-[a-f0-9]/i, /vue\.js/i, /__VUE__/i],
        versionPatterns: [/vue@([\d.]+)/i],
    },
    {
        name: 'Nuxt',
        type: 'fullstack',
        patterns: [/__NUXT__/i, /_nuxt\//i],
        versionPatterns: [],
    },
    {
        name: 'Angular',
        type: 'frontend',
        patterns: [/ng-version/i, /angular\.io/i, /\[ng/i],
        versionPatterns: [/ng-version="([\d.]+)"/i],
    },
    {
        name: 'Svelte',
        type: 'frontend',
        patterns: [/svelte-/i, /__svelte/i],
        versionPatterns: [],
    },
    {
        name: 'jQuery',
        type: 'frontend',
        patterns: [/jquery/i],
        versionPatterns: [/jquery[.-]([\d.]+)/i, /jQuery v([\d.]+)/i],
    },
    {
        name: 'Bootstrap',
        type: 'frontend',
        patterns: [/bootstrap/i, /class="(container|row|col-)/i],
        versionPatterns: [/bootstrap[.-]([\d.]+)/i, /Bootstrap v([\d.]+)/i],
    },
    {
        name: 'Tailwind CSS',
        type: 'frontend',
        patterns: [/tailwindcss/i, /class="[^"]*(?:flex|grid|p-\d|m-\d|text-|bg-|rounded)/i],
        versionPatterns: [],
    },
    {
        name: 'Laravel',
        type: 'backend',
        patterns: [/laravel/i, /csrf-token/i, /_token/i],
        versionPatterns: [],
    },
    {
        name: 'Ruby on Rails',
        type: 'backend',
        patterns: [/csrf-token/i, /data-turbo/i, /turbolinks/i],
        versionPatterns: [],
    },
];

// ============ SERVER PATTERNS ============

const SERVER_PATTERNS: { pattern: RegExp; name: string }[] = [
    { pattern: /nginx/i, name: 'nginx' },
    { pattern: /apache/i, name: 'Apache' },
    { pattern: /cloudflare/i, name: 'Cloudflare' },
    { pattern: /microsoft-iis/i, name: 'Microsoft IIS' },
    { pattern: /litespeed/i, name: 'LiteSpeed' },
    { pattern: /gunicorn/i, name: 'Gunicorn' },
    { pattern: /express/i, name: 'Express.js' },
];

// ============ OUTDATED VERSION CHECKS ============

interface VersionInfo {
    current: string;
    latest: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

function compareVersions(current: string, latest: string): 'outdated' | 'current' | 'unknown' {
    if (!current || !latest || latest === 'SaaS') return 'unknown';

    const currentParts = current.split('.').map(p => parseInt(p, 10) || 0);
    const latestParts = latest.split('.').map(p => parseInt(p, 10) || 0);

    for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
        const curr = currentParts[i] || 0;
        const lat = latestParts[i] || 0;

        if (curr < lat) return 'outdated';
        if (curr > lat) return 'current';
    }

    return 'current';
}

function getVersionSeverity(cmsName: string, current: string, latest: string): 'low' | 'medium' | 'high' | 'critical' {
    if (!current || !latest) return 'low';

    const comparison = compareVersions(current, latest);
    if (comparison !== 'outdated') return 'low';

    const currentMajor = parseInt(current.split('.')[0], 10);
    const latestMajor = parseInt(latest.split('.')[0], 10);

    // Major version difference = critical
    if (latestMajor - currentMajor >= 2) return 'critical';
    if (latestMajor - currentMajor >= 1) return 'high';

    // Minor version difference
    const currentMinor = parseInt(current.split('.')[1], 10) || 0;
    const latestMinor = parseInt(latest.split('.')[1], 10) || 0;

    if (latestMinor - currentMinor >= 5) return 'high';
    if (latestMinor - currentMinor >= 2) return 'medium';

    return 'low';
}

// ============ MAIN DETECTION FUNCTION ============

export function detectTechnologies(
    html: string,
    headers: Record<string, string | undefined>
): TechnologyResult {
    const technologies: DetectedTechnology[] = [];
    const alerts: TechnologyAlert[] = [];
    const outdatedComponents: OutdatedComponent[] = [];
    const recommendations: string[] = [];

    let cms: CMSDetection | null = null;
    let framework: FrameworkDetection | null = null;
    let server: ServerDetection | null = null;

    // ========== DETECT CMS ==========
    for (const cmsPattern of CMS_PATTERNS) {
        const matchCount = cmsPattern.patterns.filter(p => p.test(html)).length;

        if (matchCount >= 2) {
            // Extract version
            let version: string | null = null;
            for (const vp of cmsPattern.versionPatterns) {
                const match = html.match(vp);
                if (match && match[1]) {
                    version = match[1];
                    break;
                }
            }

            const isOutdated = version ? compareVersions(version, cmsPattern.latestVersion) === 'outdated' : false;
            const severity = version ? getVersionSeverity(cmsPattern.name, version, cmsPattern.latestVersion) : 'low';

            cms = {
                name: cmsPattern.name,
                version,
                confidence: matchCount >= 3 ? 'high' : 'medium',
                isOutdated,
                latestVersion: cmsPattern.latestVersion,
                securityRisk: severity,
            };

            technologies.push({
                name: cmsPattern.name,
                category: 'cms',
                version,
                confidence: cms.confidence,
            });

            // Add alerts for outdated CMS
            if (isOutdated && version) {
                if (severity === 'critical') {
                    alerts.push({
                        severity: 'critical',
                        title: `${cmsPattern.name} critically outdated`,
                        description: `Version ${version} is multiple major versions behind ${cmsPattern.latestVersion}. Critical security vulnerabilities likely.`
                    });
                } else if (severity === 'high') {
                    alerts.push({
                        severity: 'high',
                        title: `${cmsPattern.name} outdated`,
                        description: `Version ${version} should be updated to ${cmsPattern.latestVersion} for security patches.`
                    });
                }

                outdatedComponents.push({
                    name: cmsPattern.name,
                    currentVersion: version,
                    latestVersion: cmsPattern.latestVersion,
                    severity,
                    recommendation: `Update ${cmsPattern.name} to version ${cmsPattern.latestVersion}`
                });
            }

            break; // Only detect one CMS
        }
    }

    // ========== DETECT FRAMEWORKS ==========
    for (const fp of FRAMEWORK_PATTERNS) {
        const matchCount = fp.patterns.filter(p => p.test(html)).length;

        if (matchCount >= 1) {
            let version: string | null = null;
            for (const vp of fp.versionPatterns) {
                const match = html.match(vp);
                if (match && match[1]) {
                    version = match[1];
                    break;
                }
            }

            // Set primary framework (only one)
            if (!framework) {
                framework = {
                    name: fp.name,
                    version,
                    type: fp.type,
                };
            }

            technologies.push({
                name: fp.name,
                category: fp.type === 'frontend' ? 'library' : 'framework',
                version,
                confidence: matchCount >= 2 ? 'high' : 'medium',
            });
        }
    }

    // ========== DETECT SERVER ==========
    const serverHeader = headers['server'] || headers['Server'] || '';
    const poweredBy = headers['x-powered-by'] || headers['X-Powered-By'] || '';

    for (const sp of SERVER_PATTERNS) {
        if (sp.pattern.test(serverHeader) || sp.pattern.test(poweredBy)) {
            const versionMatch = serverHeader.match(/[\d.]+/);
            server = {
                software: sp.name,
                version: versionMatch ? versionMatch[0] : null,
                os: null,
            };

            technologies.push({
                name: sp.name,
                category: 'hosting',
                version: server.version,
                confidence: 'high',
            });
            break;
        }
    }

    // ========== SERVER HEADER EXPOSURE CHECK ==========
    if (serverHeader && /[\d.]+/.test(serverHeader)) {
        alerts.push({
            severity: 'medium',
            title: 'Server version exposed',
            description: `Server header reveals software version: "${serverHeader}". This helps attackers target known vulnerabilities.`
        });
        recommendations.push('Hide server version in HTTP headers');
    }

    if (poweredBy) {
        alerts.push({
            severity: 'low',
            title: 'X-Powered-By header exposed',
            description: `Technology stack revealed: "${poweredBy}". Consider removing for security.`
        });
        recommendations.push('Remove X-Powered-By header');
    }

    // ========== WORDPRESS SPECIFIC CHECKS ==========
    if (cms?.name === 'WordPress') {
        // Check for exposed wp-config
        if (html.includes('wp-config') || html.includes('xmlrpc.php')) {
            alerts.push({
                severity: 'medium',
                title: 'WordPress XML-RPC enabled',
                description: 'xmlrpc.php can be used for brute force attacks. Consider disabling if not needed.'
            });
        }

        // Check for admin exposure
        if (html.includes('/wp-admin/') || html.includes('/wp-login.php')) {
            recommendations.push('Consider hiding /wp-admin with a security plugin');
        }

        // Check for theme/plugin versions in URLs
        const pluginVersions = html.match(/wp-content\/plugins\/[^/]+\/[^"?]+\?ver=([\d.]+)/gi);
        if (pluginVersions && pluginVersions.length > 0) {
            recommendations.push('Remove version numbers from plugin asset URLs');
        }
    }

    // ========== CALCULATE SCORE ==========
    let score = 100;

    // Deductions for alerts
    for (const alert of alerts) {
        switch (alert.severity) {
            case 'critical': score -= 25; break;
            case 'high': score -= 15; break;
            case 'medium': score -= 8; break;
            case 'low': score -= 3; break;
        }
    }

    // Deductions for outdated components
    for (const component of outdatedComponents) {
        switch (component.severity) {
            case 'critical': score -= 20; break;
            case 'high': score -= 12; break;
            case 'medium': score -= 6; break;
            case 'low': score -= 2; break;
        }
    }

    score = Math.max(0, Math.min(100, score));

    // ========== GENERATE RECOMMENDATIONS ==========
    if (cms?.isOutdated) {
        recommendations.push(`Update ${cms.name} from ${cms.version} to ${cms.latestVersion}`);
    }

    if (technologies.length > 10) {
        recommendations.push('Consider reducing the number of third-party technologies');
    }

    if (alerts.length === 0 && outdatedComponents.length === 0) {
        recommendations.push('Technology stack appears reasonably secure');
    }

    // ========== GENERATE SUMMARY ==========
    let summary: string;
    if (cms) {
        summary = `${cms.name}${cms.version ? ` ${cms.version}` : ''} detected`;
        if (cms.isOutdated) {
            summary += ` (outdated - latest: ${cms.latestVersion})`;
        }
    } else if (technologies.length > 0) {
        summary = `${technologies.length} technologies detected`;
    } else {
        summary = 'No specific CMS or framework detected';
    }

    if (alerts.length > 0) {
        summary += `. ${alerts.length} security concern(s) found.`;
    }

    return {
        score,
        cms,
        framework,
        server,
        technologies,
        outdatedComponents,
        alerts,
        recommendations,
        summary,
    };
}
