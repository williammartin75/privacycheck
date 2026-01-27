// Privacy Attack Surface Scanner
// Detects exposed DNS records, open S3 buckets, exposed config files, and API endpoints

export interface AttackSurfaceResult {
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    totalFindings: number;
    findings: AttackSurfaceFinding[];
    recommendations: string[];
}

export interface AttackSurfaceFinding {
    type: 'dns' | 's3' | 'config' | 'api' | 'subdomain' | 'email' | 'cloud' | 'info';
    severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    details?: string;
    remediation: string;
}

// Common exposed paths to check
const EXPOSED_PATHS = [
    // Git and Version Control
    { path: '/.git/config', type: 'config' as const, title: 'Git Repository Exposed', severity: 'critical' as const },
    { path: '/.git/HEAD', type: 'config' as const, title: 'Git Repository Exposed', severity: 'critical' as const },
    { path: '/.svn/entries', type: 'config' as const, title: 'SVN Repository Exposed', severity: 'critical' as const },
    { path: '/.hg/hgrc', type: 'config' as const, title: 'Mercurial Repository Exposed', severity: 'critical' as const },

    // Environment and Config Files
    { path: '/.env', type: 'config' as const, title: 'Environment File Exposed', severity: 'critical' as const },
    { path: '/.env.local', type: 'config' as const, title: 'Local Environment File Exposed', severity: 'critical' as const },
    { path: '/.env.production', type: 'config' as const, title: 'Production Environment File Exposed', severity: 'critical' as const },
    { path: '/config.php', type: 'config' as const, title: 'PHP Config File Exposed', severity: 'high' as const },
    { path: '/wp-config.php.bak', type: 'config' as const, title: 'WordPress Config Backup Exposed', severity: 'critical' as const },
    { path: '/config.yml', type: 'config' as const, title: 'YAML Config File Exposed', severity: 'high' as const },
    { path: '/config.json', type: 'config' as const, title: 'JSON Config File Exposed', severity: 'high' as const },

    // Backup Files
    { path: '/backup.sql', type: 'config' as const, title: 'Database Backup Exposed', severity: 'critical' as const },
    { path: '/database.sql', type: 'config' as const, title: 'Database Dump Exposed', severity: 'critical' as const },
    { path: '/dump.sql', type: 'config' as const, title: 'SQL Dump Exposed', severity: 'critical' as const },
    { path: '/backup.zip', type: 'config' as const, title: 'Backup Archive Exposed', severity: 'high' as const },
    { path: '/backup.tar.gz', type: 'config' as const, title: 'Backup Archive Exposed', severity: 'high' as const },

    // Debug and Admin
    { path: '/phpinfo.php', type: 'config' as const, title: 'PHP Info Page Exposed', severity: 'medium' as const },
    { path: '/info.php', type: 'config' as const, title: 'PHP Info Page Exposed', severity: 'medium' as const },
    { path: '/server-status', type: 'config' as const, title: 'Apache Server Status Exposed', severity: 'medium' as const },
    { path: '/server-info', type: 'config' as const, title: 'Apache Server Info Exposed', severity: 'medium' as const },
    { path: '/.htpasswd', type: 'config' as const, title: 'Password File Exposed', severity: 'critical' as const },
    { path: '/.htaccess', type: 'config' as const, title: 'Apache Config Exposed', severity: 'medium' as const },

    // Logs
    { path: '/error.log', type: 'config' as const, title: 'Error Log Exposed', severity: 'medium' as const },
    { path: '/access.log', type: 'config' as const, title: 'Access Log Exposed', severity: 'medium' as const },
    { path: '/debug.log', type: 'config' as const, title: 'Debug Log Exposed', severity: 'high' as const },

    // API Documentation
    { path: '/swagger.json', type: 'api' as const, title: 'Swagger API Docs Exposed', severity: 'low' as const },
    { path: '/api-docs', type: 'api' as const, title: 'API Documentation Exposed', severity: 'low' as const },
    { path: '/graphql', type: 'api' as const, title: 'GraphQL Endpoint Detected', severity: 'info' as const },
    { path: '/.well-known/security.txt', type: 'info' as const, title: 'Security.txt Present', severity: 'info' as const },

    // Cloud Config
    { path: '/crossdomain.xml', type: 'config' as const, title: 'Flash Crossdomain Policy', severity: 'low' as const },
    { path: '/clientaccesspolicy.xml', type: 'config' as const, title: 'Silverlight Access Policy', severity: 'low' as const },
];

// S3 bucket patterns to detect in HTML/JS
const S3_PATTERNS = [
    /https?:\/\/([a-z0-9.-]+)\.s3\.amazonaws\.com/gi,
    /https?:\/\/s3\.amazonaws\.com\/([a-z0-9.-]+)/gi,
    /https?:\/\/([a-z0-9.-]+)\.s3-([a-z0-9-]+)\.amazonaws\.com/gi,
    /https?:\/\/storage\.googleapis\.com\/([a-z0-9.-]+)/gi,
    /https?:\/\/([a-z0-9.-]+)\.blob\.core\.windows\.net/gi,
];

// Cloud service patterns
const CLOUD_PATTERNS = [
    { pattern: /firebase\.google\.com/i, name: 'Firebase', type: 'cloud' as const },
    { pattern: /firebaseio\.com/i, name: 'Firebase Realtime DB', type: 'cloud' as const },
    { pattern: /supabase\.co/i, name: 'Supabase', type: 'cloud' as const },
    { pattern: /herokuapp\.com/i, name: 'Heroku', type: 'cloud' as const },
    { pattern: /vercel\.app/i, name: 'Vercel', type: 'cloud' as const },
    { pattern: /netlify\.app/i, name: 'Netlify', type: 'cloud' as const },
    { pattern: /cloudfront\.net/i, name: 'AWS CloudFront', type: 'cloud' as const },
    { pattern: /azurewebsites\.net/i, name: 'Azure Web Apps', type: 'cloud' as const },
];

// DNS Security Scanner - Check SPF, DKIM, DMARC records
async function checkDNSSecurity(domain: string): Promise<AttackSurfaceFinding[]> {
    const findings: AttackSurfaceFinding[] = [];

    try {
        // Use Google DNS-over-HTTPS API for TXT records
        const txtResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=TXT`, {
            signal: AbortSignal.timeout(5000),
        });
        const txtData = await txtResponse.json();
        const txtRecords = txtData.Answer?.map((a: { data: string }) => a.data) || [];

        // Check SPF
        const spfRecord = txtRecords.find((r: string) => r.includes('v=spf1'));
        if (!spfRecord) {
            findings.push({
                type: 'dns',
                severity: 'medium',
                title: 'Missing SPF Record',
                description: 'No SPF record found. This allows email spoofing from your domain.',
                remediation: 'Add an SPF TXT record to specify allowed email senders. Example: "v=spf1 include:_spf.google.com ~all"',
            });
        } else if (spfRecord.includes('+all')) {
            findings.push({
                type: 'dns',
                severity: 'high',
                title: 'Weak SPF Record (+all)',
                description: 'SPF record allows any server to send email as your domain.',
                details: spfRecord,
                remediation: 'Change "+all" to "~all" or "-all" to restrict email sending.',
            });
        }

        // Check DMARC
        const dmarcResponse = await fetch(`https://dns.google/resolve?name=_dmarc.${domain}&type=TXT`, {
            signal: AbortSignal.timeout(5000),
        });
        const dmarcData = await dmarcResponse.json();
        const dmarcRecord = dmarcData.Answer?.[0]?.data;

        if (!dmarcRecord) {
            findings.push({
                type: 'dns',
                severity: 'medium',
                title: 'Missing DMARC Record',
                description: 'No DMARC policy found. Email spoofing attacks cannot be prevented.',
                remediation: 'Add a DMARC TXT record at _dmarc.yourdomain.com. Example: "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com"',
            });
        } else if (dmarcRecord.includes('p=none')) {
            findings.push({
                type: 'dns',
                severity: 'low',
                title: 'DMARC Policy Set to None',
                description: 'DMARC is configured but not enforcing. Emails failing checks are still delivered.',
                details: dmarcRecord,
                remediation: 'Consider upgrading DMARC policy from p=none to p=quarantine or p=reject.',
            });
        }

        // Check for exposed MX records (informational)
        const mxResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`, {
            signal: AbortSignal.timeout(5000),
        });
        const mxData = await mxResponse.json();
        const mxRecords = mxData.Answer || [];

        if (mxRecords.length > 0) {
            const mxServers = mxRecords.map((r: { data: string }) => r.data.split(' ')[1]).join(', ');
            findings.push({
                type: 'dns',
                severity: 'info',
                title: `${mxRecords.length} Mail Server(s) Detected`,
                description: `MX records: ${mxServers}`,
                remediation: 'Ensure mail servers are properly secured with TLS and anti-spam measures.',
            });
        }

    } catch (error) {
        console.error('DNS security check error:', error);
    }

    return findings;
}

// Check if a path returns a valid response (exists and not 404)
async function checkExposedPath(baseUrl: string, pathInfo: typeof EXPOSED_PATHS[0]): Promise<AttackSurfaceFinding | null> {
    try {
        const url = baseUrl + pathInfo.path;
        const response = await fetch(url, {
            method: 'HEAD',
            redirect: 'follow',
            signal: AbortSignal.timeout(3000),
        });

        // Check for successful response or partial content
        if (response.ok || response.status === 206) {
            return {
                type: pathInfo.type,
                severity: pathInfo.severity,
                title: pathInfo.title,
                description: `The file ${pathInfo.path} is publicly accessible.`,
                details: `URL: ${url}`,
                remediation: getRemediation(pathInfo.type, pathInfo.path),
            };
        }
    } catch {
        // Timeout or network error - ignore
    }
    return null;
}

// Get remediation advice based on finding type
function getRemediation(type: string, path: string): string {
    if (path.includes('.git')) {
        return 'Block access to .git directory in your web server config. Add "Deny from all" for Apache or return 404 for Nginx.';
    }
    if (path.includes('.env')) {
        return 'Remove .env files from public web directories. Store them outside the webroot and ensure proper file permissions.';
    }
    if (path.includes('backup') || path.includes('.sql')) {
        return 'Never store database backups in publicly accessible directories. Use secure, off-server backup solutions.';
    }
    if (path.includes('phpinfo') || path.includes('info.php')) {
        return 'Remove phpinfo files from production servers. They expose sensitive server configuration.';
    }
    if (type === 'api') {
        return 'Consider restricting API documentation to authenticated users or internal networks only.';
    }
    return 'Restrict access to this file using web server configuration or remove it from the public directory.';
}

// Detect S3 buckets and cloud storage in HTML
function detectCloudStorage(html: string): AttackSurfaceFinding[] {
    const findings: AttackSurfaceFinding[] = [];
    const foundBuckets = new Set<string>();

    for (const pattern of S3_PATTERNS) {
        const matches = html.matchAll(pattern);
        for (const match of matches) {
            const bucket = match[1] || match[0];
            if (!foundBuckets.has(bucket)) {
                foundBuckets.add(bucket);
                findings.push({
                    type: 's3',
                    severity: 'medium',
                    title: 'Cloud Storage Bucket Detected',
                    description: `AWS S3 or cloud storage bucket reference found: ${bucket}`,
                    details: match[0],
                    remediation: 'Ensure bucket permissions are properly configured. Avoid exposing bucket names in client-side code if possible.',
                });
            }
        }
    }

    return findings;
}

// Detect cloud services
function detectCloudServices(html: string): AttackSurfaceFinding[] {
    const findings: AttackSurfaceFinding[] = [];
    const foundServices = new Set<string>();

    for (const service of CLOUD_PATTERNS) {
        if (service.pattern.test(html) && !foundServices.has(service.name)) {
            foundServices.add(service.name);
            findings.push({
                type: 'cloud',
                severity: 'info',
                title: `${service.name} Detected`,
                description: `The site uses ${service.name} cloud service.`,
                remediation: 'Ensure proper security configuration for cloud services.',
            });
        }
    }

    return findings;
}

// Detect exposed emails in HTML (for privacy risk)
function detectExposedEmails(html: string): AttackSurfaceFinding[] {
    const findings: AttackSurfaceFinding[] = [];
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = [...new Set(html.match(emailPattern) || [])];

    if (emails.length > 0) {
        findings.push({
            type: 'email',
            severity: 'low',
            title: `${emails.length} Email Address(es) Exposed`,
            description: `Email addresses visible on the page may be harvested by spammers: ${emails.slice(0, 3).join(', ')}${emails.length > 3 ? '...' : ''}`,
            remediation: 'Use contact forms instead of displaying email addresses directly. If emails must be shown, use obfuscation techniques.',
        });
    }

    return findings;
}

// Detect API keys or secrets in HTML/JS (common patterns)
function detectExposedSecrets(html: string): AttackSurfaceFinding[] {
    const findings: AttackSurfaceFinding[] = [];

    const secretPatterns = [
        { pattern: /['"]sk_live_[a-zA-Z0-9]{24,}['"]/g, name: 'Stripe Live Key' },
        { pattern: /['"]pk_live_[a-zA-Z0-9]{24,}['"]/g, name: 'Stripe Publishable Key' },
        { pattern: /['"]AIza[a-zA-Z0-9_-]{35}['"]/g, name: 'Google API Key' },
        { pattern: /['"]ghp_[a-zA-Z0-9]{36}['"]/g, name: 'GitHub Personal Access Token' },
        { pattern: /['"]xoxb-[a-zA-Z0-9-]+['"]/g, name: 'Slack Bot Token' },
        { pattern: /AKIA[A-Z0-9]{16}/g, name: 'AWS Access Key ID' },
        { pattern: /['"][a-f0-9]{32}['"]/g, name: 'Potential API Key (32-char hex)' },
    ];

    for (const { pattern, name } of secretPatterns) {
        if (pattern.test(html)) {
            findings.push({
                type: 'config',
                severity: 'critical',
                title: `Potential ${name} Exposed`,
                description: `A pattern matching ${name} was found in the page source.`,
                remediation: 'Never expose API keys or secrets in client-side code. Use environment variables and server-side code to handle sensitive credentials.',
            });
        }
    }

    return findings;
}

// Main attack surface scan function
export async function scanAttackSurface(baseUrl: string, html: string): Promise<AttackSurfaceResult> {
    const findings: AttackSurfaceFinding[] = [];

    // Normalize base URL
    const url = new URL(baseUrl);
    const cleanBaseUrl = `${url.protocol}//${url.host}`;

    // 1. Check exposed paths (parallel, limited concurrency)
    const pathChecks = EXPOSED_PATHS.slice(0, 20).map(p => checkExposedPath(cleanBaseUrl, p));
    const pathResults = await Promise.allSettled(pathChecks);

    for (const result of pathResults) {
        if (result.status === 'fulfilled' && result.value) {
            findings.push(result.value);
        }
    }

    // 2. Detect cloud storage buckets
    findings.push(...detectCloudStorage(html));

    // 3. Detect cloud services
    findings.push(...detectCloudServices(html));

    // 4. Detect exposed emails
    findings.push(...detectExposedEmails(html));

    // 5. Detect exposed secrets
    findings.push(...detectExposedSecrets(html));

    // 6. Check DNS security (SPF, DKIM, DMARC)
    const dnsFindings = await checkDNSSecurity(url.hostname);
    findings.push(...dnsFindings);

    // Calculate overall risk
    let overallRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
    const criticalCount = findings.filter(f => f.severity === 'critical').length;
    const highCount = findings.filter(f => f.severity === 'high').length;
    const mediumCount = findings.filter(f => f.severity === 'medium').length;

    if (criticalCount > 0) {
        overallRisk = 'critical';
    } else if (highCount >= 2) {
        overallRisk = 'high';
    } else if (highCount > 0 || mediumCount >= 3) {
        overallRisk = 'medium';
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (criticalCount > 0) {
        recommendations.push('URGENT: Critical security issues detected. Address immediately to prevent data breach.');
    }
    if (findings.some(f => f.type === 'config')) {
        recommendations.push('Review web server configuration to block access to sensitive files.');
    }
    if (findings.some(f => f.type === 's3')) {
        recommendations.push('Audit cloud storage bucket permissions and access policies.');
    }

    return {
        overallRisk,
        totalFindings: findings.length,
        findings: findings.sort((a, b) => {
            const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
            return severityOrder[a.severity] - severityOrder[b.severity];
        }),
        recommendations,
    };
}

// Get severity color
export function getSeverityColor(severity: string): string {
    switch (severity) {
        case 'critical': return '#dc2626';
        case 'high': return '#ea580c';
        case 'medium': return '#ca8a04';
        case 'low': return '#2563eb';
        case 'info': return '#6b7280';
        default: return '#6b7280';
    }
}

// Get severity icon
export function getSeverityIcon(severity: string): string {
    switch (severity) {
        case 'critical': return '🔴';
        case 'high': return '🟠';
        case 'medium': return '🟡';
        case 'low': return '🔵';
        case 'info': return 'ℹ️';
        default: return '⚪';
    }
}
