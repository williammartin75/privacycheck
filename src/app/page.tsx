'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { recommendations } from '@/lib/recommendations';
import { generatePDF } from '@/lib/pdf-generator';
import { detectComplianceDrift, DriftReport } from '@/lib/drift-detection';
import { LanguageSelector } from '@/components/LanguageSelector';
import { MaskedText, MaskedEmail } from '@/components/ProGate';
import { UpgradeCTA } from '@/components/UpgradeCTA';

interface Cookie {
  name: string;
  category: 'necessary' | 'analytics' | 'marketing' | 'preferences' | 'unknown';
  description: string;
  provider: string;
}

interface PageScan {
  url: string;
  title: string;
  cookiesFound: number;
  trackersFound: string[];
}

interface AuditResult {
  score: number;
  domain: string;
  pagesScanned: number;
  pages: PageScan[];
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
    // P0 Security modules
    ssl?: {
      valid: boolean;
      hsts: boolean;
      hstsMaxAge: number | null;
    };
    securityHeaders?: {
      csp: boolean;
      xFrameOptions: boolean;
      xContentType: boolean;
      strictTransportSecurity: boolean;
      referrerPolicy: boolean;
      permissionsPolicy: boolean;
    };
    emailSecurity?: {
      spf: boolean;
      dmarc: boolean;
      domain: string;
    };
    // Email Exposure
    exposedEmails?: string[];
    // External Resources
    externalResources?: {
      scripts: { src: string; provider: string }[];
      fonts: { src: string; provider: string }[];
      iframes: { src: string; provider: string }[];
    };
    // Social Trackers
    socialTrackers?: { name: string; risk: 'high' | 'medium' | 'low' }[];
    // Data Breaches
    dataBreaches?: { name: string; date: string; count: number }[];
    // Vendor Risk Assessment
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
    // Consent Behavior Analysis
    consentBehavior?: {
      detected: boolean;
      hasRejectButton: boolean;
      hasAcceptButton: boolean;
      rejectButtonLabels: string[];
      acceptButtonLabels: string[];
      darkPatterns: {
        type: string;
        description: string;
        severity: 'low' | 'medium' | 'high';
      }[];
      preConsentCookies: {
        name: string;
        category: string;
        droppedBeforeConsent: boolean;
        violation: boolean;
      }[];
      consentProvider: string | null;
      score: number;
      issues: string[];
    };
    // Privacy Policy AI Analysis
    policyAnalysis?: {
      found: boolean;
      policyUrl: string | null;
      lastUpdated: string | null;
      overallScore: number;
      overallStatus: 'compliant' | 'partial' | 'non-compliant' | 'not-found';
      sections: {
        legalBasis: { found: boolean; score: number; status: string; details: string[]; issues: string[] };
        dataRetention: { found: boolean; score: number; status: string; details: string[]; issues: string[] };
        userRights: { found: boolean; score: number; status: string; details: string[]; issues: string[] };
        thirdPartySharing: { found: boolean; score: number; status: string; details: string[]; issues: string[] };
        internationalTransfers: { found: boolean; score: number; status: string; details: string[]; issues: string[] };
        contactInfo: { found: boolean; score: number; status: string; details: string[]; issues: string[] };
        cookiePolicy: { found: boolean; score: number; status: string; details: string[]; issues: string[] };
        childrenPrivacy: { found: boolean; score: number; status: string; details: string[]; issues: string[] };
      };
      missingElements: string[];
      recommendations: string[];
      gdprArticles: { article: string; status: 'compliant' | 'partial' | 'missing' }[];
    };
    // Site-wide Dark Patterns Detection
    darkPatterns?: {
      detected: boolean;
      totalCount: number;
      score: number;
      bySeverity: {
        critical: number;
        high: number;
        medium: number;
        low: number;
      };
      byCategory: Record<string, number>;
      patterns: {
        type: string;
        category: string;
        description: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        element?: string;
        gdprRelevance: boolean;
        recommendation: string;
      }[];
      gdprViolations: {
        type: string;
        category: string;
        description: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        gdprRelevance: boolean;
        recommendation: string;
      }[];
      recommendations: string[];
    };
    // Opt-in Forms Analysis
    optInForms?: {
      formsAnalyzed: number;
      totalIssues: number;
      score: number;
      issues: {
        type: 'pre-checked' | 'hidden-consent' | 'bundled-consent' | 'unclear-label' | 'forced-consent';
        description: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        element?: string;
        recommendation: string;
        gdprArticle?: string;
      }[];
      preCheckedCount: number;
      hiddenConsentCount: number;
      bundledConsentCount: number;
      compliant: boolean;
      recommendations: string[];
    };
    // Cookie Lifespan Analysis
    cookieLifespan?: {
      totalCookiesAnalyzed: number;
      compliantCount: number;
      issuesCount: number;
      score: number;
      issues: {
        name: string;
        currentLifespan: number;
        recommendedLifespan: number;
        severity: 'low' | 'medium' | 'high' | 'critical';
        category: string;
        recommendation: string;
      }[];
      longestCookie: { name: string; days: number } | null;
      averageLifespan: number;
      compliant: boolean;
      recommendations: string[];
    };
    // Fingerprinting Detection
    fingerprinting?: {
      detected: boolean;
      totalTechniques: number;
      score: number;
      issues: {
        type: string;
        description: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        evidence?: string;
        gdprImpact: string;
        recommendation: string;
      }[];
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
    };
    // Security Headers Extended
    securityHeadersExtended?: {
      score: number;
      totalHeaders: number;
      presentCount: number;
      missingCount: number;
      issues: {
        header: string;
        status: 'missing' | 'weak' | 'misconfigured' | 'present';
        severity: 'low' | 'medium' | 'high' | 'critical';
        currentValue?: string;
        recommendation: string;
        privacyImpact: string;
      }[];
      grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
      headers: Record<string, { present: boolean; value?: string }>;
      recommendations: string[];
    };
    // Storage Audit
    storageAudit?: {
      totalItems: number;
      localStorage: { count: number; riskItems: number };
      sessionStorage: { count: number; riskItems: number };
      issues: {
        key: string;
        type: 'localStorage' | 'sessionStorage';
        category: string;
        risk: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        recommendation: string;
      }[];
      score: number;
      compliant: boolean;
      recommendations: string[];
    };
    // Mixed Content
    mixedContent?: {
      detected: boolean;
      totalIssues: number;
      blockedCount: number;
      warningCount: number;
      issues: {
        type: string;
        url: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        blocked: boolean;
        description: string;
        recommendation: string;
      }[];
      score: number;
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
    };
    // Form Security
    formSecurity?: {
      totalForms: number;
      secureCount: number;
      issuesCount: number;
      issues: {
        formId?: string;
        type: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        field?: string;
        recommendation: string;
      }[];
      score: number;
      hasLoginForm: boolean;
      hasPaymentForm: boolean;
      compliant: boolean;
      recommendations: string[];
    };
  };
  regulations: string[];
  scoreBreakdown?: { item: string; points: number; passed: boolean }[];
  // Risk Prediction - GDPR Fine Estimation
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
  // Attack Surface Scanner results
  attackSurface?: {
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    totalFindings: number;
    findings: {
      type: 'dns' | 's3' | 'config' | 'api' | 'subdomain' | 'email' | 'cloud' | 'info';
      severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
      title: string;
      description: string;
      details?: string;
      remediation: string;
    }[];
    recommendations: string[];
  };
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState('');
  const [showCookies, setShowCookies] = useState(false);
  const [showPages, setShowPages] = useState(false);
  const [showPassedChecks, setShowPassedChecks] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [expandedRec, setExpandedRec] = useState<string | null>(null);
  const [tier, setTier] = useState<'free' | 'pro' | 'pro_plus'>('free');
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 20, status: '' });
  const [isScheduled, setIsScheduled] = useState(false);
  const [schedulingLoading, setSchedulingLoading] = useState(false);
  const [driftReport, setDriftReport] = useState<DriftReport | null>(null);

  // Collapsible sections state (all closed by default)
  const [showVendorRisk, setShowVendorRisk] = useState(false);
  const [showSocialTrackers, setShowSocialTrackers] = useState(false);
  const [showExternalResources, setShowExternalResources] = useState(false);
  const [showSecurityChecks, setShowSecurityChecks] = useState(false);
  const [showComplianceChecklist, setShowComplianceChecklist] = useState(false);
  const [showSecurityExposure, setShowSecurityExposure] = useState(false);
  const [showComplianceDrift, setShowComplianceDrift] = useState(false);
  const [showRiskAssessment, setShowRiskAssessment] = useState(false);
  const [showEmailExposure, setShowEmailExposure] = useState(false);
  const [showTrackers, setShowTrackers] = useState(false);
  const [showConsentBehavior, setShowConsentBehavior] = useState(false);
  const [showPolicyAnalysis, setShowPolicyAnalysis] = useState(false);
  const [showDarkPatterns, setShowDarkPatterns] = useState(false);
  const [showDataBreaches, setShowDataBreaches] = useState(false);
  const [showDataTransfers, setShowDataTransfers] = useState(false);
  const [showOptInForms, setShowOptInForms] = useState(false);
  const [showCookieLifespan, setShowCookieLifespan] = useState(false);
  const [showFingerprinting, setShowFingerprinting] = useState(false);
  const [showSecurityHeadersExt, setShowSecurityHeadersExt] = useState(false);
  const [showStorageAudit, setShowStorageAudit] = useState(false);
  const [showMixedContent, setShowMixedContent] = useState(false);
  const [showFormSecurity, setShowFormSecurity] = useState(false);

  // Cookie consent banner state
  const [showCookieConsent, setShowCookieConsent] = useState(false);

  // Check cookie consent on mount
  useEffect(() => {
    const hasConsent = localStorage.getItem('cookieConsent');
    if (!hasConsent) {
      setShowCookieConsent(true);
    }
  }, []);

  // Load cached scan result on mount (prevents re-scan on refresh)
  useEffect(() => {
    try {
      const cachedResult = localStorage.getItem('lastScanResult');
      const cachedUrl = localStorage.getItem('lastScanUrl');
      if (cachedResult && cachedUrl) {
        const parsed = JSON.parse(cachedResult);
        setResult(parsed);
        setUrl(cachedUrl);
      }
    } catch (e) {
      console.error('Failed to load cached scan result:', e);
    }
  }, []);

  // Save scan result to localStorage when it changes
  useEffect(() => {
    if (result && url) {
      try {
        localStorage.setItem('lastScanResult', JSON.stringify(result));
        localStorage.setItem('lastScanUrl', url);
        localStorage.setItem('lastScanTime', Date.now().toString());
      } catch (e) {
        console.error('Failed to cache scan result:', e);
      }
    }
  }, [result, url]);

  const supabase = createClient();

  // Helper for tier checks
  const isPro = tier === 'pro' || tier === 'pro_plus';
  const isProPlus = tier === 'pro_plus';

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Check subscription status and tier via API (uses service role to bypass RLS)
        try {
          const tierResponse = await fetch('/api/subscription');
          const tierData = await tierResponse.json();
          console.log('[PrivacyChecker] Subscription API response:', tierData);
          if (tierData.tier && tierData.tier !== 'free') {
            console.log('[PrivacyChecker] Setting tier to:', tierData.tier);
            setTier(tierData.tier);
          }
        } catch (err) {
          console.error('Failed to fetch tier:', err);
        }
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setTier('free');
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleCheckout = async (tier: 'pro' | 'pro_plus' = 'pro') => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, tier }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Require login before audit
    if (!user) {
      window.location.href = '/login';
      return;
    }

    // Check scan limit for all tiers (Free: 10, Pro: 50, Pro+: 200 per month)
    const scanLimits = { free: 10, pro: 50, pro_plus: 200 };
    const scanLimit = scanLimits[tier];
    const scanCountKey = `${tier}ScanCount`;
    const scanMonthKey = `${tier}ScanMonth`;
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const storedMonth = localStorage.getItem(scanMonthKey);
    let scanCount = parseInt(localStorage.getItem(scanCountKey) || '0', 10);

    // Reset counter if new month
    if (storedMonth !== currentMonth) {
      scanCount = 0;
      localStorage.setItem(scanMonthKey, currentMonth);
      localStorage.setItem(scanCountKey, '0');
    }

    if (scanCount >= scanLimit) {
      const upgradeMsg = tier === 'free'
        ? 'Upgrade to Pro for 50 scans/month!'
        : tier === 'pro'
          ? 'Upgrade to Pro+ for 200 scans/month!'
          : 'Contact us for enterprise plans.';
      setError(`You have reached your ${scanLimit} scans this month. ${upgradeMsg}`);
      return;
    }

    // Increment scan count
    localStorage.setItem(scanCountKey, (scanCount + 1).toString());

    setLoading(true);
    setError('');
    setResult(null);

    // Initialize progress - page limits by tier
    const maxPages = isProPlus ? 1000 : (isPro ? 200 : 20);
    setScanProgress({ current: 0, total: maxPages, status: 'Connecting...' });

    // Simulate progress during scan
    const statuses = [
      'Fetching main page...',
      'Analyzing cookies...',
      'Detecting trackers...',
      'Checking security headers...',
      'Scanning linked pages...',
      'Extracting emails...',
      'Calculating score...',
    ];
    let statusIndex = 0;
    let simulatedPages = 0;
    const progressInterval = setInterval(() => {
      simulatedPages = Math.min(simulatedPages + Math.floor(Math.random() * 3) + 1, maxPages - 1);
      statusIndex = Math.min(statusIndex + 1, statuses.length - 1);
      setScanProgress({ current: simulatedPages, total: maxPages, status: statuses[statusIndex] });
    }, 800);

    // Normalize URL: add https:// if missing
    let normalizedUrl = url.trim();
    if (!normalizedUrl.match(/^https?:\/\//i)) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    try {
      console.log('[PrivacyChecker] Calling audit API with tier:', tier);
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl, tier }),
      });

      if (!response.ok) throw new Error('Audit failed');

      const data = await response.json();
      clearInterval(progressInterval);
      setScanProgress({ current: data.pagesScanned, total: data.pagesScanned, status: 'Complete!' });
      setResult(data);

      // Compliance Drift Detection - compare with previous scan
      try {
        const historyKey = `privacychecker_history_${data.domain}`;
        const previousScan = localStorage.getItem(historyKey);
        let parsedPrevious = null;

        if (previousScan) {
          parsedPrevious = JSON.parse(previousScan);
        }

        // Create snapshot for comparison
        const currentSnapshot = {
          score: data.score,
          timestamp: new Date().toISOString(),
          issues: {
            consentBanner: data.issues.consentBanner,
            privacyPolicy: data.issues.privacyPolicy,
            https: data.issues.https,
            cookies: data.issues.cookies,
            trackers: data.issues.trackers,
            legalMentions: data.issues.legalMentions,
            dpoContact: data.issues.dpoContact,
            dataDeleteLink: data.issues.dataDeleteLink,
            cookiePolicy: data.issues.cookiePolicy,
            secureforms: data.issues.secureforms,
            optOutMechanism: data.issues.optOutMechanism,
          },
          vendorRisks: data.issues.vendorRisks?.map((v: { name: string; riskScore: number }) => ({ name: v.name, riskScore: v.riskScore })),
        };

        // Calculate drift
        const drift = detectComplianceDrift(parsedPrevious, currentSnapshot);
        setDriftReport(drift);

        // Save current scan as history for next comparison
        localStorage.setItem(historyKey, JSON.stringify(currentSnapshot));
      } catch (driftError) {
        console.error('Drift detection error:', driftError);
      }

      // Save scan to database if user is logged in
      if (user) {
        await supabase.from('scans').insert({
          user_id: user.id,
          domain: data.domain,
          score: data.score,
          pages_scanned: data.pagesScanned,
          result: data,
        });
      }
    } catch {
      clearInterval(progressInterval);
      setScanProgress({ current: 0, total: maxPages, status: 'Error' });
      setError('Failed to audit site. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!result || !user || !isPro) return;

    setSchedulingLoading(true);
    try {
      if (isScheduled) {
        // Get schedule ID first
        const res = await fetch('/api/schedules');
        const { schedules } = await res.json();
        const schedule = schedules?.find((s: { domain: string }) => s.domain === result.domain);
        if (schedule) {
          await fetch(`/api/schedules?id=${schedule.id}`, { method: 'DELETE' });
        }
        setIsScheduled(false);
      } else {
        // Pro+ gets weekly scans, Pro gets monthly
        const frequency = isProPlus ? 'weekly' : 'monthly';
        await fetch('/api/schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain: result.domain, frequency }),
        });
        setIsScheduled(true);
      }
    } catch (err) {
      console.error('Schedule error:', err);
    } finally {
      setSchedulingLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-700';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-700';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { label: 'Compliant', sublabel: 'Low Risk', bg: 'border border-green-600', text: 'text-green-600' };
    if (score >= 50) return { label: 'Improvements Required', sublabel: 'Medium Risk', bg: 'border border-amber-600', text: 'text-amber-600' };
    return { label: 'Non-Compliant', sublabel: 'High Risk', bg: 'border border-red-600', text: 'text-red-600' };
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'necessary': return 'bg-white text-slate-700';
      case 'analytics': return 'bg-blue-600 text-white';
      case 'marketing': return 'bg-sky-200 text-sky-800';
      case 'preferences': return 'bg-amber-400 text-amber-900';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const CheckItem = ({ passed, label, recKey }: { passed: boolean; label: string; recKey?: string }) => {
    const rec = recKey ? recommendations[recKey] : null;
    const isExpanded = expandedRec === recKey;

    return (
      <div className={`rounded-lg ${passed ? 'bg-white border border-slate-200' : 'bg-white border border-slate-300'}`}>
        <div
          className={`p-4 flex items-center gap-3 ${!passed && rec ? 'cursor-pointer hover:bg-white' : ''}`}
          onClick={() => !passed && rec && setExpandedRec(isExpanded ? null : recKey!)}
        >
          {passed ? (
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="text-slate-800 font-medium flex-1 text-sm">{label}</span>
          {!passed && rec && (
            <svg className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
        {isExpanded && rec && (
          <div className="px-4 pb-4">
            {isPro ? (
              <div className="bg-white rounded-lg p-4 border border-red-100">
                <h4 className="font-semibold text-gray-900 mb-2">{rec.title}</h4>
                <p className="text-gray-600 text-sm mb-3">{rec.description}</p>
                <h5 className="font-medium text-gray-900 mb-2 text-sm">How to fix:</h5>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  {rec.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-4 border border-red-100 text-center">
                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-gray-600 text-sm mb-3">Upgrade to Pro to see step-by-step fix instructions</p>
                <button onClick={() => handleCheckout()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                  Upgrade to Pro - €19/mo
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <img src="/logo.png" alt="PrivacyChecker" className="w-8 h-8 sm:w-12 sm:h-12 sm:scale-150" />
            <span className="text-lg sm:text-2xl font-bold text-gray-900 notranslate">PrivacyChecker</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <a href="#pricing" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition">Pricing</a>
            <a href="#faq" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition">FAQ</a>
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition text-sm">
                  Dashboard
                </Link>
                <span className="text-gray-600 text-sm">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900 transition text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                Sign In
              </Link>
            )}
            <LanguageSelector />
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Is your website{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
              privacy compliant?
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Check your site against GDPR, CCPA, and 50+ global privacy regulations. Avoid fines and build customer trust.
          </p>

          {/* Audit Form */}
          <form onSubmit={handleAudit} className="max-w-2xl mx-auto mb-12">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter your website URL (e.g., https://example.com)"
                className="flex-1 px-6 py-4 rounded-md bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-md transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Scanning...
                  </>
                ) : (
                  <>Check Now</>
                )}
              </button>
            </div>
          </form>

          {/* Progress Bar */}
          {loading && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-white border border-gray-200 rounded-md p-6 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center animate-pulse">
                      <svg className="w-5 h-5 text-blue-600 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Scanning in progress...</p>
                      <p className="text-sm text-gray-500">{scanProgress.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{scanProgress.current}</p>
                    <p className="text-xs text-gray-500">/ {scanProgress.total} pages</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${Math.min((scanProgress.current / scanProgress.total) * 100, 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-400 text-center">
                  {isProPlus ? 'Pro+ scan: up to 1,000 pages' : (isPro ? 'Pro scan: up to 200 pages' : 'Free scan: up to 20 pages')}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="max-w-2xl mx-auto mb-8 p-4 text-red-600 text-center">
              {error}
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-lg p-8 shadow-sm text-left">
              {/* Report Metadata */}
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-100">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Privacy Audit Report</p>
                  <p className="text-[10px] text-slate-400 mt-1">Ref: RPT-{new Date().toISOString().slice(0, 10).replace(/-/g, '')}-{result.domain.slice(0, 4).toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">Generated: {new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Audit Engine v2.1</p>
                </div>
              </div>
              {/* Header with Score Gauge */}
              <div className="flex flex-col md:flex-row items-center gap-8 mb-8 pb-8 border-b border-slate-100">
                {/* Score Circle - Corporate Navy Style */}
                <div className="relative">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="#e2e8f0" strokeWidth="8" fill="none" />
                    <circle
                      cx="64" cy="64" r="56"
                      stroke={result.score >= 80 ? '#16a34a' : result.score >= 50 ? '#d97706' : '#dc2626'}
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${result.score * 3.52} 352`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span style={{ color: result.score >= 80 ? '#16a34a' : result.score >= 50 ? '#d97706' : '#dc2626' }} className="text-3xl font-bold">{result.score}</span>
                    <span style={{ color: result.score >= 80 ? '#16a34a' : result.score >= 50 ? '#d97706' : '#dc2626' }} className="text-xl font-bold">%</span>
                  </div>
                </div>

                {/* Site Info */}
                <div className="flex-1 text-center md:text-left">
                  <p className="text-slate-800 text-2xl font-semibold mb-3">{result.domain}</p>
                  <div className={`inline-block px-3 py-1.5 rounded text-xs font-semibold ${getScoreLabel(result.score).bg} ${getScoreLabel(result.score).text}`}>
                    {getScoreLabel(result.score).label} • {getScoreLabel(result.score).sublabel}
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap justify-center md:justify-start">
                    {result.regulations?.map((reg, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white text-slate-600 text-xs rounded font-medium border border-slate-300">
                        {reg}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="flex-shrink-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">Summary</p>
                  <div className="grid grid-cols-1 gap-2 min-w-[220px]">
                    {/* Issues Found - Red indicator */}
                    <div className="flex items-center justify-between px-3 py-2 bg-white rounded border border-slate-300">
                      <span className="text-xs text-red-600">Issues Found</span>
                      <span className="font-bold text-red-600">{Object.values(result.issues).filter(v => !v).length}</span>
                    </div>
                    {/* Checks Passed - Blue indicator */}
                    <div className="flex items-center justify-between px-3 py-2 bg-white rounded border border-slate-300">
                      <div className="flex items-center gap-2">

                        <span className="text-xs text-slate-700">Checks Passed</span>
                      </div>
                      <span className="font-bold text-slate-800">{Object.values(result.issues).filter(v => v).length}</span>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 bg-white rounded border border-slate-300">
                      <span className="text-xs text-slate-700">Pages Scanned</span>
                      <span className="font-bold text-slate-800">{result.pagesScanned}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PDF Button */}
              <div className="flex justify-center gap-3 mb-8">
                <button
                  onClick={() => isPro ? generatePDF(result) : handleCheckout()}
                  className={`flex items-center gap-3 px-6 py-3 rounded-lg transition font-semibold text-sm bg-white text-slate-700 hover:bg-slate-50 border border-slate-200`}
                >
                  {isPro ? (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM8.5 13h7v1h-7v-1zm0 2h7v1h-7v-1zm0 2h4v1h-4v-1z" />
                      </svg>
                      Download Full PDF Report
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Download PDF Compliance Report (Pro)
                    </>
                  )}
                </button>

                {/* Schedule Button (Pro only) */}
                {isPro && (
                  <button
                    onClick={handleSchedule}
                    disabled={schedulingLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium text-sm ${isScheduled
                      ? 'bg-white text-blue-700 border border-blue-200 hover:bg-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-white'
                      }`}
                  >
                    {schedulingLoading ? (
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : isScheduled ? (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                        Scheduled {isProPlus ? 'Weekly' : 'Monthly'}
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Schedule {isProPlus ? 'Weekly' : 'Monthly'} Scan
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Passed Checks List - Always visible */}
              {result && (
                <div className="mb-6 p-4 bg-white rounded-lg border border-slate-300">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Checks Passed</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {result.issues.https && <span className="flex items-center gap-2 text-xs text-slate-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>HTTPS Enabled</span>}
                    {result.issues.privacyPolicy && <span className="flex items-center gap-2 text-xs text-slate-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Privacy Policy</span>}
                    {result.issues.cookiePolicy && <span className="flex items-center gap-2 text-xs text-slate-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Cookie Policy</span>}
                    {result.issues.consentBanner && <span className="flex items-center gap-2 text-xs text-slate-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Cookie Consent</span>}
                    {result.issues.legalMentions && <span className="flex items-center gap-2 text-xs text-slate-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Legal Mentions</span>}
                    {result.issues.dpoContact && <span className="flex items-center gap-2 text-xs text-slate-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>DPO Contact</span>}
                    {result.issues.dataDeleteLink && <span className="flex items-center gap-2 text-xs text-slate-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Data Deletion</span>}
                    {result.issues.optOutMechanism && <span className="flex items-center gap-2 text-xs text-slate-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Opt-out Option</span>}
                    {result.issues.secureforms && <span className="flex items-center gap-2 text-xs text-slate-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Secure Forms</span>}
                    {result.issues.ssl?.valid && <span className="flex items-center gap-2 text-xs text-slate-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>SSL Certificate</span>}
                    {result.issues.emailSecurity?.spf && <span className="flex items-center gap-2 text-xs text-slate-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>SPF Record</span>}
                    {result.issues.emailSecurity?.dmarc && <span className="flex items-center gap-2 text-xs text-slate-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>DMARC Record</span>}
                  </div>
                </div>
              )}

              {/* Key Issues Summary */}
              {Object.values(result.issues).filter(v => !v).length > 0 && (
                <div className="mb-6 p-4 rounded-lg border border-slate-300">
                  <h4 className="text-sm font-semibold text-red-600 mb-3">Issues Found</h4>
                  <div className="flex flex-wrap gap-2">
                    {!result.issues.consentBanner && <span className="px-2 py-1 text-xs text-red-600">✕ Cookie Consent Banner</span>}
                    {!result.issues.cookiePolicy && <span className="px-2 py-1 text-xs text-red-600">✕ Cookie Policy</span>}
                    {!result.issues.dpoContact && <span className="px-2 py-1 text-xs text-red-600">✕ DPO Contact</span>}
                    {!result.issues.secureforms && <span className="px-2 py-1 text-xs text-red-600">✕ Secure Forms</span>}
                    {!result.issues.privacyPolicy && <span className="px-2 py-1 text-xs text-red-600">✕ Privacy Policy</span>}
                    {result.issues.cookies.undeclared > 0 && <span className="px-2 py-1 text-xs text-red-600">✕ Undeclared Cookies ({result.issues.cookies.undeclared})</span>}
                  </div>
                </div>
              )}

              {/* Score Breakdown */}
              {result.scoreBreakdown && result.scoreBreakdown.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Score Breakdown</h3>
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {result.scoreBreakdown.filter(b => b.points !== 0 || !b.passed).map((item, i) => (
                        <div key={i} className={`flex items-center justify-between px-3 py-2 rounded border ${item.passed ? 'bg-white border-slate-200' : 'bg-white border-slate-300'}`}>
                          <span className={`text-sm ${item.passed ? 'text-slate-700' : 'text-slate-600'}`}>
                            {item.item}
                          </span>
                          <span className={`text-sm font-semibold ${item.passed ? 'text-slate-700' : 'text-slate-500'}`}>
                            {item.points > 0 ? '+' : ''}{item.points}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-slate-600 font-medium text-sm">Final Score</span>
                      <span className="text-xl font-bold text-slate-800">{result.score}/100</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Risk Assessment */}
              {result.riskPrediction && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowRiskAssessment(!showRiskAssessment)}
                    className="section-btn"
                  >
                    <span className="flex items-center gap-2">
                      <span className="section-btn-title">GDPR Fine Estimation</span>
                      <span className={result.riskPrediction.riskLevel === 'critical' || result.riskPrediction.riskLevel === 'high' ? 'badge-failed' :
                        result.riskPrediction.riskLevel === 'medium' ? 'badge-warning' : 'badge-passed'
                      }>
                        €{result.riskPrediction.minFine >= 1000 ? (result.riskPrediction.minFine / 1000).toFixed(0) + 'k' : result.riskPrediction.minFine} - €{result.riskPrediction.maxFine >= 1000000 ? (result.riskPrediction.maxFine / 1000000).toFixed(1) + 'M' : result.riskPrediction.maxFine >= 1000 ? (result.riskPrediction.maxFine / 1000).toFixed(0) + 'k' : result.riskPrediction.maxFine}
                      </span>
                    </span>
                    <svg className={`w-5 h-5 text-slate-400 transition-transform ${showRiskAssessment ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showRiskAssessment && (
                    <div className="rounded-lg p-6 border border-slate-200 bg-white">
                      {/* Fine Estimation Header */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Potential GDPR Fine Range</p>
                          <p className={`text-3xl font-bold ${result.riskPrediction.riskLevel === 'critical' ? 'text-red-700' :
                            result.riskPrediction.riskLevel === 'high' ? 'text-orange-700' :
                              result.riskPrediction.riskLevel === 'medium' ? 'text-yellow-700' :
                                'text-blue-700'
                            }`}>
                            €{result.riskPrediction.minFine >= 1000 ? (result.riskPrediction.minFine / 1000).toFixed(0) + 'k' : result.riskPrediction.minFine}
                            {' - '}
                            €{result.riskPrediction.maxFine >= 1000000 ? (result.riskPrediction.maxFine / 1000000).toFixed(1) + 'M' : result.riskPrediction.maxFine >= 1000 ? (result.riskPrediction.maxFine / 1000).toFixed(0) + 'k' : result.riskPrediction.maxFine}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-500 mb-1">Risk Level</p>
                          <span className={`inline-block px-4 py-2 rounded-full text-lg font-bold ${result.riskPrediction.riskLevel === 'critical' ? 'text-red-700' :
                            result.riskPrediction.riskLevel === 'high' ? 'text-orange-600' :
                              result.riskPrediction.riskLevel === 'medium' ? 'text-yellow-700' :
                                'text-blue-600'
                            }`}>
                            {result.riskPrediction.riskLevel.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-500 mb-1">Enforcement Probability</p>
                          <span style={{ color: result.riskPrediction.probability >= 70 ? '#b91c1c' : result.riskPrediction.probability >= 40 ? '#b45309' : '#15803d' }} className="text-lg font-bold">{result.riskPrediction.probability}%</span>
                        </div>
                      </div>

                      {/* Risk Factors */}
                      {result.riskPrediction.factors.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-600 mb-2">Risk Factors Identified:</p>
                          <div className="space-y-2">
                            {result.riskPrediction.factors.slice(0, 5).map((factor, i) => (
                              <div key={i} className="flex items-center justify-between bg-white rounded-lg px-4 py-2 shadow-sm">
                                <div className="flex items-center gap-3">
                                  <span className={`w-2 h-2 rounded-full ${factor.severity === 'critical' ? 'bg-white0' :
                                    factor.severity === 'high' ? 'bg-white0' :
                                      factor.severity === 'medium' ? 'bg-white0' :
                                        'bg-white0'
                                    }`}></span>
                                  <div>
                                    <p className="font-medium text-gray-800">{factor.issue}</p>
                                    {factor.gdprArticle && (
                                      <p className="text-xs text-gray-500">GDPR {factor.gdprArticle}</p>
                                    )}
                                  </div>
                                </div>
                                <span className="text-red-700 font-semibold">
                                  +€{factor.fineContribution >= 1000 ? (factor.fineContribution / 1000).toFixed(0) + 'k' : factor.fineContribution}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendation */}
                      <div className="mt-4 p-4 rounded-lg bg-white border border-slate-200">
                        <p className="text-sm font-medium text-slate-700">
                          <strong>Recommendation:</strong> {result.riskPrediction.recommendation}
                        </p>
                      </div>

                      <p className="text-xs text-slate-400 mt-3">
                        * Estimates based on GDPR enforcement patterns and detected violations. Actual fines depend on DPA discretion, company size, and specifics of the case.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Compliance Drift Detection */}
              {driftReport && driftReport.hasChanges && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowComplianceDrift(!showComplianceDrift)}
                    className="section-btn"
                  >
                    <span className="flex items-center gap-2">
                      <span className="section-btn-title">Compliance Drift Detection</span>
                      <span className={driftReport.overallTrend === 'declining' ? 'badge-warning' : 'badge-passed'}>
                        {driftReport.changes.length} change{driftReport.changes.length > 1 ? 's' : ''}
                      </span>
                    </span>
                    <svg className={`w-5 h-5 text-slate-400 transition-transform ${showComplianceDrift ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showComplianceDrift && (
                    <div className="rounded-lg p-5 border border-slate-200 bg-white">
                      {/* Header with trend */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${driftReport.overallTrend === 'improving' ? 'bg-white' : driftReport.overallTrend === 'declining' ? 'bg-white' : 'bg-white'}`}>
                            <svg className={`w-5 h-5 ${driftReport.overallTrend === 'improving' ? 'text-blue-600' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={driftReport.overallTrend === 'improving' ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' : driftReport.overallTrend === 'declining' ? 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6' : 'M5 12h14'} />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">
                              {driftReport.overallTrend === 'improving' ? 'Privacy Improving' :
                                driftReport.overallTrend === 'declining' ? 'Privacy Declining' : 'No Significant Change'}
                            </p>
                            <p className="text-sm text-slate-500">{driftReport.changes.length} change(s) detected since last scan</p>
                          </div>
                        </div>
                        {driftReport.scoreDelta !== 0 && (
                          <div className={`px-3 py-1.5 rounded ${driftReport.scoreDelta > 0 ? 'bg-white text-blue-700 border border-blue-200' : 'bg-white text-slate-700 border border-slate-200'}`}>
                            <span className="text-lg font-bold">
                              {driftReport.scoreDelta > 0 ? '+' : ''}{driftReport.scoreDelta}
                            </span>
                            <span className="text-xs ml-1">points</span>
                          </div>
                        )}
                      </div>

                      {/* Changes list */}
                      <div className="space-y-2">
                        {driftReport.changes.slice(0, 6).map((change, i) => (
                          <div key={i} className={`flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow-sm border-l-4 ${change.impact === 'negative' ? 'border-red-500' :
                            change.impact === 'positive' ? 'border-blue-500' :
                              'border-gray-300'
                            }`}>
                            <div className="flex items-center gap-3">
                              <span className={`font-bold ${change.impact === 'positive' ? 'text-blue-600' : change.impact === 'negative' ? 'text-red-600' : 'text-gray-500'}`}>
                                {change.impact === 'positive' ? '✓' : change.impact === 'negative' ? '✕' : '–'}
                              </span>
                              <div>
                                <p className="font-medium text-gray-800">{change.field}</p>
                                <p className="text-sm text-gray-500">{change.description}</p>
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${change.type === 'improvement' ? 'bg-white text-blue-700' :
                              change.type === 'regression' ? 'bg-white text-red-700' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                              {change.category}
                            </span>
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-gray-400 mt-3">
                        * Changes compared to your previous scan of this domain. Scan history is stored locally in your browser.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Security Exposure Analysis */}
              {result.attackSurface && result.attackSurface.totalFindings > 0 && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowSecurityExposure(!showSecurityExposure)}
                    className="section-btn"
                  >
                    <span className="flex items-center gap-2">
                      <span className="section-btn-title">Security Exposure Analysis</span>
                      <span className={result.attackSurface.overallRisk === 'critical' || result.attackSurface.overallRisk === 'high' ? 'badge-failed' :
                        result.attackSurface.overallRisk === 'medium' ? 'badge-warning' : 'badge-passed'
                      }>
                        {result.attackSurface.totalFindings} finding{result.attackSurface.totalFindings > 1 ? 's' : ''}
                      </span>
                    </span>
                    <svg className={`w-5 h-5 text-slate-400 transition-transform ${showSecurityExposure ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showSecurityExposure && (
                    <div className="rounded-lg p-5 border border-slate-200 bg-white">
                      {/* Header */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center">
                            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">Security & Privacy Exposure Check</p>
                            <p className="text-sm text-slate-500">{result.attackSurface.totalFindings} finding(s) detected</p>
                          </div>
                        </div>
                        <span className={`text-sm font-semibold ${result.attackSurface.overallRisk === 'critical' ? 'text-red-600' :
                          result.attackSurface.overallRisk === 'high' ? 'text-red-600' :
                            result.attackSurface.overallRisk === 'medium' ? 'text-yellow-500' :
                              'text-blue-600'
                          }`}>
                          {result.attackSurface.overallRisk.charAt(0).toUpperCase() + result.attackSurface.overallRisk.slice(1)} Risk
                        </span>
                      </div>

                      {/* Findings list */}
                      <div className="space-y-2">
                        {result.attackSurface.findings.slice(0, 6).map((finding, i) => (
                          <div key={i} className="bg-white rounded-lg px-4 py-3 border border-slate-200">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-3">
                                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${finding.severity === 'critical' ? 'bg-slate-800' :
                                  finding.severity === 'high' ? 'bg-slate-600' :
                                    finding.severity === 'medium' ? 'bg-slate-400' : 'bg-slate-300'
                                  }`}></span>
                                <div>
                                  <p className="font-medium text-slate-800 text-sm">{finding.title}</p>
                                  <p className="text-xs text-slate-500">{finding.description}</p>
                                  {finding.details && (
                                    <code className="text-xs bg-white px-2 py-1 rounded mt-1 block text-slate-600 break-all">
                                      {finding.details}
                                    </code>
                                  )}
                                </div>
                              </div>
                              <span className="text-xs px-2 py-0.5 rounded flex-shrink-0 bg-white text-slate-600">
                                {finding.type.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-2 bg-white p-2 rounded">
                              <strong>Recommendation:</strong> {finding.remediation}
                            </p>
                          </div>
                        ))}
                      </div>

                      {result.attackSurface.recommendations.length > 0 && (
                        <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
                          <p className="text-sm font-semibold text-slate-700 mb-2">Top Recommendations:</p>
                          <ul className="text-sm text-slate-600 space-y-1">
                            {result.attackSurface.recommendations.map((rec, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-slate-400">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <p className="text-xs text-gray-400 mt-3">
                        * Checks for exposed config files, cloud storage, API endpoints, and security misconfigurations.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Consent Behavior Test */}
              {result.issues.consentBehavior && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowConsentBehavior(!showConsentBehavior)}
                    className="section-btn"
                  >
                    <span className="flex items-center gap-2">
                      <span className="section-btn-title">Consent Behavior Test</span>
                      <span className={result.issues.consentBehavior.issues.length === 0 ? 'badge-passed' :
                        result.issues.consentBehavior.issues.length <= 2 ? 'badge-warning' : 'badge-failed'}>
                        {result.issues.consentBehavior.issues.length === 0 ? '0 issues' : `${result.issues.consentBehavior.issues.length} issue${result.issues.consentBehavior.issues.length > 1 ? 's' : ''}`}
                      </span>
                    </span>
                    <svg className={`w-5 h-5 text-slate-400 transition-transform ${showConsentBehavior ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showConsentBehavior && (
                    <div className="rounded-lg p-5 border border-slate-200 bg-white">
                      {/* Header */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${result.issues.consentBehavior.score >= 80 ? 'bg-white' : 'bg-white'}`}>
                            <svg className={`w-5 h-5 ${result.issues.consentBehavior.score >= 80 ? 'text-blue-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={result.issues.consentBehavior.score >= 80 ? 'M5 13l4 4L19 7' : 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'} />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">Consent Implementation Quality</p>
                            <p className="text-sm text-slate-500">
                              {result.issues.consentBehavior.consentProvider ? `Using ${result.issues.consentBehavior.consentProvider}` : 'Consent banner detected'}
                            </p>
                          </div>
                        </div>
                        <span className={`text-2xl font-bold ${result.issues.consentBehavior.score >= 80 ? 'text-blue-600' :
                          result.issues.consentBehavior.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {result.issues.consentBehavior.score}/100
                        </span>
                      </div>

                      {/* Quick checks */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${result.issues.consentBehavior.detected ? 'bg-white text-blue-700' : 'bg-white text-red-700'}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={result.issues.consentBehavior.detected ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'} />
                          </svg>
                          <span className="text-xs font-medium">Banner Present</span>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${result.issues.consentBehavior.hasRejectButton ? 'bg-white text-blue-700' : 'bg-white text-red-700'}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={result.issues.consentBehavior.hasRejectButton ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'} />
                          </svg>
                          <span className="text-xs font-medium">Reject Button</span>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${result.issues.consentBehavior.darkPatterns.length === 0 ? 'bg-white text-blue-700' : 'bg-white text-red-700'}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={result.issues.consentBehavior.darkPatterns.length === 0 ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'} />
                          </svg>
                          <span className="text-xs font-medium">No Dark Patterns</span>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${result.issues.consentBehavior.preConsentCookies.filter(c => c.violation).length === 0 ? 'bg-white text-blue-700' : 'bg-white text-red-700'}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={result.issues.consentBehavior.preConsentCookies.filter(c => c.violation).length === 0 ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'} />
                          </svg>
                          <span className="text-xs font-medium">Consent-Gated</span>
                        </div>
                      </div>

                      {/* Issues found */}
                      {result.issues.consentBehavior.issues.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-slate-700 mb-2">Issues Detected:</p>
                          <div className="space-y-2">
                            {result.issues.consentBehavior.issues.slice(0, 5).map((issue, i) => (
                              <div key={i} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg">
                                <span className="w-2 h-2 rounded-full bg-white0"></span>
                                <span className="text-sm text-red-700">{issue}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Dark patterns detail with recommendations */}
                      {result.issues.consentBehavior.darkPatterns.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-slate-700 mb-2">Dark Patterns Found:</p>
                          <div className="space-y-2">
                            {result.issues.consentBehavior.darkPatterns.map((pattern, i) => (
                              <div
                                key={i}
                                className={`bg-white rounded-lg border border-orange-200 overflow-hidden ${isPro ? 'cursor-pointer hover:bg-white' : ''}`}
                                onClick={() => isPro && setExpandedRec(expandedRec === `darkPattern-${i}` ? null : `darkPattern-${i}`)}
                              >
                                <div className="flex items-center justify-between px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-orange-500">⚠️</span>
                                    <span className="text-sm text-orange-800">{pattern.description}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-0.5 rounded ${pattern.severity === 'high' ? 'bg-white text-red-700' :
                                      pattern.severity === 'medium' ? 'bg-white text-orange-700' : 'bg-white text-yellow-700'}`}>
                                      {pattern.severity.toUpperCase()}
                                    </span>
                                    {isPro && (
                                      <svg className={`w-4 h-4 text-orange-400 transition-transform ${expandedRec === `darkPattern-${i}` ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                                {expandedRec === `darkPattern-${i}` && isPro && (
                                  <div className="px-3 pb-3">
                                    <div className="bg-white rounded-lg p-4 border border-orange-200">
                                      <h4 className="font-semibold text-gray-900 mb-2">{recommendations.darkPatterns?.title || 'Fix Dark Pattern'}</h4>
                                      <p className="text-gray-600 text-sm mb-3">{recommendations.darkPatterns?.description}</p>
                                      <h5 className="font-medium text-gray-900 mb-2 text-sm">How to fix:</h5>
                                      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                                        {recommendations.darkPatterns?.steps.map((step, si) => (
                                          <li key={si}>{step}</li>
                                        ))}
                                      </ol>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          {!isPro && (
                            <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                              <p className="text-slate-600 text-xs mb-2">Upgrade to Pro for step-by-step fix instructions</p>
                              <button onClick={() => handleCheckout()} className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition">
                                Upgrade - €19/mo
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Pre-consent cookies with recommendations */}
                      {result.issues.consentBehavior.preConsentCookies.filter(c => c.violation).length > 0 && (
                        <div className="mb-4">
                          <div
                            className={`${isPro ? 'cursor-pointer' : ''}`}
                            onClick={() => isPro && setExpandedRec(expandedRec === 'preConsentCookies' ? null : 'preConsentCookies')}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-semibold text-slate-700">Cookies Loaded Before Consent:</p>
                              {isPro && (
                                <svg className={`w-4 h-4 text-slate-400 transition-transform ${expandedRec === 'preConsentCookies' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {result.issues.consentBehavior.preConsentCookies.filter(c => c.violation).map((cookie, i) => (
                                <MaskedText text={`${cookie.name} (${cookie.category})`} show={isPro} />
                              ))}
                            </div>
                          </div>
                          {expandedRec === 'preConsentCookies' && isPro && (
                            <div className="mt-3 bg-white rounded-lg p-4 border border-red-100">
                              <h4 className="font-semibold text-gray-900 mb-2">{recommendations.preConsentCookies?.title || 'Fix Pre-Consent Cookies'}</h4>
                              <p className="text-gray-600 text-sm mb-3">{recommendations.preConsentCookies?.description}</p>
                              <h5 className="font-medium text-gray-900 mb-2 text-sm">How to fix:</h5>
                              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                                {recommendations.preConsentCookies?.steps.map((step, si) => (
                                  <li key={si}>{step}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                          {!isPro && (
                            <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                              <p className="text-slate-600 text-xs mb-2">Upgrade to Pro for step-by-step fix instructions</p>
                              <button onClick={() => handleCheckout()} className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition">
                                Upgrade - €19/mo
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Missing reject button recommendation */}
                      {!result.issues.consentBehavior.hasRejectButton && result.issues.consentBehavior.detected && (
                        <div className="mb-4">
                          <div
                            className={`bg-white rounded-lg border border-red-200 overflow-hidden ${isPro ? 'cursor-pointer hover:bg-white' : ''}`}
                            onClick={() => isPro && setExpandedRec(expandedRec === 'missingRejectButton' ? null : 'missingRejectButton')}
                          >
                            <div className="flex items-center justify-between px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span className="text-red-500">❌</span>
                                <span className="text-sm text-red-800">Missing clear reject button</span>
                              </div>
                              {isPro && (
                                <svg className={`w-4 h-4 text-red-400 transition-transform ${expandedRec === 'missingRejectButton' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              )}
                            </div>
                            {expandedRec === 'missingRejectButton' && isPro && (
                              <div className="px-3 pb-3">
                                <div className="bg-white rounded-lg p-4 border border-red-200">
                                  <h4 className="font-semibold text-gray-900 mb-2">{recommendations.missingRejectButton?.title || 'Add Reject Button'}</h4>
                                  <p className="text-gray-600 text-sm mb-3">{recommendations.missingRejectButton?.description}</p>
                                  <h5 className="font-medium text-gray-900 mb-2 text-sm">How to fix:</h5>
                                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                                    {recommendations.missingRejectButton?.steps.map((step, si) => (
                                      <li key={si}>{step}</li>
                                    ))}
                                  </ol>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-gray-400 mt-3">
                        * Checks consent banner implementation, presence of dark patterns, and whether tracking scripts await user consent.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Privacy Policy AI Analysis */}
              {result.issues.policyAnalysis && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowPolicyAnalysis(!showPolicyAnalysis)}
                    className="section-btn"
                  >
                    <span className="flex items-center gap-2">
                      <span className="section-btn-title">Privacy Policy Analysis</span>
                      <span className={result.issues.policyAnalysis.overallStatus === 'compliant' ? 'badge-passed' :
                        result.issues.policyAnalysis.overallStatus === 'partial' ? 'badge-warning' :
                          result.issues.policyAnalysis.overallStatus === 'not-found' ? 'badge-info' :
                            'badge-failed'
                      }>
                        {result.issues.policyAnalysis.overallScore}%
                      </span>
                    </span>
                    <svg className={`w-5 h-5 text-slate-400 transition-transform ${showPolicyAnalysis ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showPolicyAnalysis && (
                    <div className="bg-white rounded-lg border border-slate-200 p-4">
                      {/* Overall Status */}
                      <div className={`flex items-center gap-3 p-3 rounded-lg mb-4 ${result.issues.policyAnalysis.overallStatus === 'compliant' ? 'bg-white' :
                        result.issues.policyAnalysis.overallStatus === 'partial' ? 'bg-white' :
                          result.issues.policyAnalysis.overallStatus === 'not-found' ? 'bg-gray-50' :
                            'bg-white'
                        }`}>
                        <span className="text-sm font-bold uppercase tracking-wider">
                          {result.issues.policyAnalysis.overallStatus === 'compliant' ? <span className="text-blue-600">PASS</span> :
                            result.issues.policyAnalysis.overallStatus === 'partial' ? <span className="text-amber-600">REVIEW</span> :
                              result.issues.policyAnalysis.overallStatus === 'not-found' ? <span className="text-slate-500">N/A</span> : <span className="text-red-600">FAIL</span>}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {result.issues.policyAnalysis.overallStatus === 'compliant' ? 'Privacy Policy is GDPR Compliant' :
                              result.issues.policyAnalysis.overallStatus === 'partial' ? 'Privacy Policy Needs Improvement' :
                                result.issues.policyAnalysis.overallStatus === 'not-found' ? 'No Privacy Policy Found' :
                                  'Privacy Policy is Non-Compliant'}
                          </p>
                          <p className="text-sm text-slate-600">
                            Score: {result.issues.policyAnalysis.overallScore}/100
                            {result.issues.policyAnalysis.lastUpdated && ` • Last Updated: ${result.issues.policyAnalysis.lastUpdated}`}
                          </p>
                        </div>
                      </div>

                      {/* GDPR Articles Compliance */}
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-slate-700 mb-2">GDPR Article Compliance:</p>
                        <div className="flex flex-wrap gap-2">
                          {result.issues.policyAnalysis.gdprArticles.map((article, i) => (
                            <span
                              key={i}
                              className={`text-xs px-3 py-1.5 rounded-full border ${article.status === 'compliant' ? 'bg-white text-slate-700 border-slate-300' :
                                article.status === 'partial' ? 'bg-white text-amber-700 border-amber-200' :
                                  'bg-white text-red-700 border-red-200'
                                }`}
                            >
                              {article.article}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Policy Sections Grid */}
                      <div className="grid md:grid-cols-2 gap-3 mb-4">
                        {Object.entries(result.issues.policyAnalysis.sections).map(([key, section]) => {
                          const sectionNames: Record<string, string> = {
                            legalBasis: 'Legal Basis',
                            dataRetention: 'Data Retention',
                            userRights: 'User Rights',
                            thirdPartySharing: 'Third-Party Sharing',
                            internationalTransfers: 'International Transfers',
                            contactInfo: 'Contact Information',
                            cookiePolicy: 'Cookie Policy',
                            childrenPrivacy: 'Children Privacy',
                          };
                          return (
                            <div
                              key={key}
                              className={`p-3 rounded-lg border ${section.status === 'compliant' ? 'bg-white border-slate-200' :
                                section.status === 'partial' ? 'bg-white border-amber-200' :
                                  'bg-white border-red-200'
                                }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-slate-700">{sectionNames[key] || key}</span>
                                <span className={`text-xs px-2 py-0.5 rounded font-bold ${section.status === 'compliant' ? 'bg-white text-slate-800' :
                                  section.status === 'partial' ? 'bg-white text-amber-800' :
                                    'bg-white text-red-800'
                                  }`}>
                                  {section.score}%
                                </span>
                              </div>
                              {section.details.length > 0 && (
                                <p className="text-xs text-slate-600 truncate">{section.details[0]}</p>
                              )}
                              {section.issues.length > 0 && (
                                <p className="text-xs text-red-700 truncate mt-1">Warning: {section.issues[0]}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Missing Elements */}
                      {result.issues.policyAnalysis.missingElements.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-red-700 mb-2">Missing Elements:</p>
                          <div className="flex flex-wrap gap-2">
                            {result.issues.policyAnalysis.missingElements.map((element, i) => (
                              <span key={i} className="text-xs bg-white text-red-700 px-2 py-1 rounded-full">
                                {element}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations for Pro Users */}
                      {result.issues.policyAnalysis.recommendations.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-slate-700 mb-2">
                            {isPro ? 'Recommendations:' : 'Recommendations (Pro):'}
                          </p>
                          {isPro ? (
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                              <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700">
                                {result.issues.policyAnalysis.recommendations.map((rec, i) => (
                                  <li key={i}>{rec}</li>
                                ))}
                              </ol>
                            </div>
                          ) : (
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-center">
                              <p className="text-slate-600 text-sm mb-3">
                                Upgrade to Pro to see detailed recommendations for improving your privacy policy
                              </p>
                              <button
                                onClick={() => handleCheckout()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                              >
                                Upgrade to Pro - €19/mo
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Policy Link */}
                      {result.issues.policyAnalysis.policyUrl && (
                        <div className="pt-3 border-t border-slate-200">
                          <a
                            href={result.issues.policyAnalysis.policyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            View Privacy Policy
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      )}

                      <p className="text-xs text-gray-400 mt-3">
                        * Analyzes privacy policy content for GDPR compliance including legal basis, user rights, data retention, and contact information.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Dark Patterns Detection */}
              {result.issues.darkPatterns && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowDarkPatterns(!showDarkPatterns)}
                    className="section-btn"
                  >
                    <span className="flex items-center gap-2">
                      <span className="section-btn-title">Dark Patterns Detection</span>
                      {result.issues.darkPatterns.detected ? (
                        <span className="badge-failed">
                          {result.issues.darkPatterns.totalCount} found
                        </span>
                      ) : (
                        <span className="badge-passed">
                          Clean
                        </span>
                      )}
                    </span>
                    <svg className={`w-5 h-5 text-slate-400 transition-transform ${showDarkPatterns ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showDarkPatterns && (
                    <div className="bg-white rounded-lg border border-slate-200 p-4">
                      {/* Overall Status */}
                      <div className={`flex items-center gap-3 p-3 rounded-lg mb-4 ${!result.issues.darkPatterns.detected ? 'bg-white' :
                        result.issues.darkPatterns.bySeverity.critical > 0 ? 'bg-white' :
                          result.issues.darkPatterns.bySeverity.high > 0 ? 'bg-white' :
                            'bg-white'
                        }`}>
                        <span className="text-sm font-bold uppercase tracking-wider">
                          {!result.issues.darkPatterns.detected ? <span className="text-blue-600">OK</span> :
                            result.issues.darkPatterns.bySeverity.critical > 0 ? <span className="text-red-600">CRITICAL</span> :
                              result.issues.darkPatterns.bySeverity.high > 0 ? <span className="text-amber-600">ALERT</span> : <span className="text-slate-600">INFO</span>}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {!result.issues.darkPatterns.detected ? 'No Dark Patterns Detected!' :
                              result.issues.darkPatterns.bySeverity.critical > 0 ? 'Critical Dark Patterns Found' :
                                result.issues.darkPatterns.bySeverity.high > 0 ? 'Dark Patterns Require Attention' :
                                  'Minor Dark Patterns Detected'}
                          </p>
                          <p className="text-sm text-slate-600">
                            Score: {result.issues.darkPatterns.score}/100
                            {result.issues.darkPatterns.gdprViolations.length > 0 &&
                              ` • ${result.issues.darkPatterns.gdprViolations.length} GDPR-relevant`}
                          </p>
                        </div>
                      </div>

                      {/* Severity Breakdown */}
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        <div className={`p-2 rounded text-center ${result.issues.darkPatterns.bySeverity.critical > 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <p className={`text-lg font-bold ${result.issues.darkPatterns.bySeverity.critical > 0 ? 'text-red-700' : 'text-gray-400'}`}>
                            {result.issues.darkPatterns.bySeverity.critical}
                          </p>
                          <p className="text-xs text-slate-600">Critical</p>
                        </div>
                        <div className={`p-2 rounded text-center ${result.issues.darkPatterns.bySeverity.high > 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <p className={`text-lg font-bold ${result.issues.darkPatterns.bySeverity.high > 0 ? 'text-orange-700' : 'text-gray-400'}`}>
                            {result.issues.darkPatterns.bySeverity.high}
                          </p>
                          <p className="text-xs text-slate-600">High</p>
                        </div>
                        <div className={`p-2 rounded text-center ${result.issues.darkPatterns.bySeverity.medium > 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <p className={`text-lg font-bold ${result.issues.darkPatterns.bySeverity.medium > 0 ? 'text-yellow-700' : 'text-gray-400'}`}>
                            {result.issues.darkPatterns.bySeverity.medium}
                          </p>
                          <p className="text-xs text-slate-600">Medium</p>
                        </div>
                        <div className={`p-2 rounded text-center ${result.issues.darkPatterns.bySeverity.low > 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <p className={`text-lg font-bold ${result.issues.darkPatterns.bySeverity.low > 0 ? 'text-blue-700' : 'text-gray-400'}`}>
                            {result.issues.darkPatterns.bySeverity.low}
                          </p>
                          <p className="text-xs text-slate-600">Low</p>
                        </div>
                      </div>

                      {/* Detected Patterns List */}
                      {result.issues.darkPatterns.patterns.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-slate-700 mb-2">Detected Patterns:</p>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {result.issues.darkPatterns.patterns.slice(0, isPro ? 20 : 3).map((pattern, i) => (
                              <div
                                key={i}
                                className={`p-3 rounded-lg border ${pattern.severity === 'critical' ? 'bg-white border-red-200' :
                                  pattern.severity === 'high' ? 'bg-white border-orange-200' :
                                    pattern.severity === 'medium' ? 'bg-white border-yellow-200' :
                                      'bg-white border-blue-200'
                                  }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className={`text-xs px-2 py-0.5 rounded ${pattern.severity === 'critical' ? 'bg-white text-red-800' :
                                        pattern.severity === 'high' ? 'bg-white text-orange-800' :
                                          pattern.severity === 'medium' ? 'bg-white text-yellow-800' :
                                            'bg-white text-blue-800'
                                        }`}>
                                        {pattern.severity.toUpperCase()}
                                      </span>
                                      <span className="text-xs text-slate-500 capitalize">{pattern.type.replace(/-/g, ' ')}</span>
                                      {pattern.gdprRelevance && (
                                        <span className="text-xs bg-white text-slate-700 px-1.5 py-0.5 rounded">GDPR</span>
                                      )}
                                    </div>
                                    <p className="text-sm text-slate-700">{pattern.description}</p>
                                    {isPro && pattern.element && (
                                      <p className="text-xs text-slate-500 mt-1 font-mono bg-white px-2 py-1 rounded truncate">
                                        {pattern.element.slice(0, 100)}...
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {!isPro && result.issues.darkPatterns.patterns.length > 3 && (
                              <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <p className="text-slate-600 text-sm mb-2">
                                  +{result.issues.darkPatterns.patterns.length - 3} more patterns (Pro)
                                </p>
                                <button
                                  onClick={() => handleCheckout()}
                                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition"
                                >
                                  Upgrade to Pro
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {result.issues.darkPatterns.recommendations.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-slate-700 mb-2">
                            {isPro ? 'How to Fix:' : 'Recommendations (Pro):'}
                          </p>
                          {isPro ? (
                            <div className="bg-white rounded-lg p-4 border border-blue-200">
                              <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700">
                                {result.issues.darkPatterns.recommendations.map((rec, i) => (
                                  <li key={i}>{rec}</li>
                                ))}
                              </ol>
                            </div>
                          ) : (
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-center">
                              <p className="text-slate-600 text-sm mb-3">
                                Upgrade to Pro to see detailed recommendations for removing dark patterns
                              </p>
                              <button
                                onClick={() => handleCheckout()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                              >
                                Upgrade to Pro - €19/mo
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-gray-400 mt-3">
                        * Scans for manipulative UI patterns including confirmshaming, pre-checked boxes, hidden information, and more.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Opt-in Forms Analysis */}
              {result.issues.optInForms && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowOptInForms(!showOptInForms)}
                    className="section-btn"
                  >
                    <span className="flex items-center gap-2">
                      <span className="section-btn-title">Opt-in Forms Analysis</span>
                      {result.issues.optInForms.compliant ? (
                        <span className="badge-passed">0 issues</span>
                      ) : (
                        <span className="badge-failed">
                          {result.issues.optInForms.totalIssues} issue{result.issues.optInForms.totalIssues > 1 ? 's' : ''}
                        </span>
                      )}
                    </span>
                    <svg className={`w-5 h-5 text-slate-400 transition-transform ${showOptInForms ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showOptInForms && (
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                      {/* Summary */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className={`p-3 rounded-lg text-center ${result.issues.optInForms.preCheckedCount > 0 ? 'bg-white' : 'bg-white'}`}>
                          <p className={`text-2xl font-bold ${result.issues.optInForms.preCheckedCount > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                            {result.issues.optInForms.preCheckedCount}
                          </p>
                          <p className="text-xs text-slate-600">Pre-checked</p>
                        </div>
                        <div className={`p-3 rounded-lg text-center ${result.issues.optInForms.hiddenConsentCount > 0 ? 'bg-white' : 'bg-white'}`}>
                          <p className={`text-2xl font-bold ${result.issues.optInForms.hiddenConsentCount > 0 ? 'text-orange-600' : 'text-blue-600'}`}>
                            {result.issues.optInForms.hiddenConsentCount}
                          </p>
                          <p className="text-xs text-slate-600">Hidden consent</p>
                        </div>
                        <div className={`p-3 rounded-lg text-center ${result.issues.optInForms.bundledConsentCount > 0 ? 'bg-white' : 'bg-white'}`}>
                          <p className={`text-2xl font-bold ${result.issues.optInForms.bundledConsentCount > 0 ? 'text-yellow-600' : 'text-blue-600'}`}>
                            {result.issues.optInForms.bundledConsentCount}
                          </p>
                          <p className="text-xs text-slate-600">Bundled consent</p>
                        </div>
                      </div>

                      {result.issues.optInForms.compliant ? (
                        <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                          <span className="text-sm font-bold text-blue-600 uppercase">PASS</span>
                          <div>
                            <p className="font-semibold text-blue-800">All Forms Are Compliant</p>
                            <p className="text-sm text-blue-600">
                              No pre-checked consent boxes or hidden consent inputs found.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="bg-white border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-red-800 text-sm">
                              <strong>GDPR Article 7:</strong> Consent must be freely given. Pre-checked boxes do not constitute valid consent.
                            </p>
                          </div>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {result.issues.optInForms.issues.slice(0, isPro ? 10 : 2).map((issue, i) => (
                              <div
                                key={i}
                                className={`p-3 rounded-lg border ${issue.severity === 'critical' ? 'bg-white border-red-200' :
                                  issue.severity === 'high' ? 'bg-white border-orange-200' :
                                    'bg-white border-yellow-200'
                                  }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-xs px-2 py-0.5 rounded ${issue.severity === 'critical' ? 'bg-white text-red-800' :
                                    issue.severity === 'high' ? 'bg-white text-orange-800' :
                                      'bg-white text-yellow-800'
                                    }`}>
                                    {issue.severity.toUpperCase()}
                                  </span>
                                  <span className="text-xs text-slate-500">{issue.type.replace(/-/g, ' ')}</span>
                                  {issue.gdprArticle && (
                                    <span className="text-xs bg-white text-slate-700 px-1.5 py-0.5 rounded">
                                      {issue.gdprArticle.split(' - ')[0]}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-slate-700">{issue.description}</p>
                                {isPro && (
                                  <p className="text-xs text-blue-600 mt-2">💡 {issue.recommendation}</p>
                                )}
                              </div>
                            ))}
                            {!isPro && result.issues.optInForms.issues.length > 2 && (
                              <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <p className="text-slate-600 text-sm mb-2">
                                  +{result.issues.optInForms.issues.length - 2} more issues (Pro)
                                </p>
                                <button
                                  onClick={() => handleCheckout()}
                                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition"
                                >
                                  Upgrade to Pro
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      <p className="text-xs text-gray-400 mt-3">
                        * Scans form checkboxes for pre-selection, hidden consent fields, and bundled consent.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Cookie Lifespan Analysis */}
              {result.issues.cookieLifespan && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowCookieLifespan(!showCookieLifespan)}
                    className="section-btn"
                  >
                    <span className="flex items-center gap-2">
                      <span className="section-btn-title">Cookie Lifespan Analysis</span>
                      {result.issues.cookieLifespan.compliant ? (
                        <span className="badge-passed">0 issues</span>
                      ) : (
                        <span className="badge-warning">
                          {result.issues.cookieLifespan.issuesCount} issue{result.issues.cookieLifespan.issuesCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </span>
                    <svg className={`w-5 h-5 text-slate-400 transition-transform ${showCookieLifespan ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showCookieLifespan && (
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                      {/* Summary stats */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="p-3 rounded-lg text-center bg-slate-50">
                          <p className="text-2xl font-bold text-slate-700">{result.issues.cookieLifespan.totalCookiesAnalyzed}</p>
                          <p className="text-xs text-slate-500">Analyzed</p>
                        </div>
                        <div className={`p-3 rounded-lg text-center ${result.issues.cookieLifespan.issuesCount > 0 ? 'bg-white' : 'bg-white'}`}>
                          <p className={`text-2xl font-bold ${result.issues.cookieLifespan.issuesCount > 0 ? 'text-orange-600' : 'text-blue-600'}`}>
                            {result.issues.cookieLifespan.issuesCount}
                          </p>
                          <p className="text-xs text-slate-500">Excessive</p>
                        </div>
                        <div className="p-3 rounded-lg text-center bg-white">
                          <p className="text-2xl font-bold text-blue-600">
                            {result.issues.cookieLifespan.averageLifespan}d
                          </p>
                          <p className="text-xs text-slate-500">Avg lifespan</p>
                        </div>
                      </div>

                      {result.issues.cookieLifespan.longestCookie && (
                        <div className="bg-white border border-yellow-200 rounded-lg p-3 mb-4">
                          <p className="text-yellow-800 text-sm">
                            <strong>Longest cookie:</strong> "{result.issues.cookieLifespan.longestCookie.name}" - {result.issues.cookieLifespan.longestCookie.days} days
                            {result.issues.cookieLifespan.longestCookie.days > 390 && ' (exceeds 13 months)'}
                          </p>
                        </div>
                      )}

                      {result.issues.cookieLifespan.issues.length > 0 && (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {result.issues.cookieLifespan.issues.slice(0, isPro ? 10 : 2).map((issue, i) => (
                            <div key={i} className="p-3 bg-white rounded-lg border border-orange-100">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-slate-800">{issue.name}</p>
                                  <p className="text-xs text-orange-600">{issue.currentLifespan} days → {issue.recommendedLifespan} days max</p>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded ${issue.severity === 'critical' ? 'bg-white text-red-800' :
                                  issue.severity === 'high' ? 'bg-white text-orange-800' :
                                    'bg-white text-yellow-800'
                                  }`}>{issue.severity}</span>
                              </div>
                              {isPro && (
                                <p className="text-xs text-blue-600 mt-2">💡 {issue.recommendation}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-gray-400 mt-3">
                        * CNIL recommends max 13 months for consent and analytics cookies.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Fingerprinting Detection */}
              {result.issues.fingerprinting && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowFingerprinting(!showFingerprinting)}
                    className="section-btn"
                  >
                    <span className="flex items-center gap-2">
                      <span className="section-btn-title">Fingerprinting Detection</span>
                      {result.issues.fingerprinting.riskLevel === 'none' ? (
                        <span className="badge-passed">0 issues</span>
                      ) : (
                        <span className={result.issues.fingerprinting.riskLevel === 'critical' ? 'badge-failed' :
                          result.issues.fingerprinting.riskLevel === 'high' ? 'badge-failed' :
                            'badge-warning'
                        }>
                          {result.issues.fingerprinting.issues.length} issue{result.issues.fingerprinting.issues.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </span>
                    <svg className={`w-5 h-5 text-slate-400 transition-transform ${showFingerprinting ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showFingerprinting && (
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                      {result.issues.fingerprinting.detected ? (
                        <>
                          <div className="bg-white border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-red-800 text-sm">
                              <strong>⚠️ Privacy Alert:</strong> Browser fingerprinting techniques detected. These track users without cookies and require explicit GDPR consent.
                            </p>
                          </div>

                          {/* Breakdown by type */}
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
                            {Object.entries(result.issues.fingerprinting.byType).map(([type, count]) => (
                              <div key={type} className={`p-2 rounded text-center ${count > 0 ? 'bg-white' : 'bg-white'}`}>
                                <p className={`text-lg font-bold ${count > 0 ? 'text-red-600' : 'text-blue-600'}`}>{count}</p>
                                <p className="text-xs text-slate-500 capitalize">{type}</p>
                              </div>
                            ))}
                          </div>

                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {result.issues.fingerprinting.issues.slice(0, isPro ? 10 : 2).map((issue, i) => (
                              <div key={i} className={`p-3 rounded-lg border ${issue.severity === 'critical' ? 'bg-white border-red-200' :
                                issue.severity === 'high' ? 'bg-white border-orange-200' :
                                  'bg-white border-yellow-200'
                                }`}>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-semibold text-slate-700 uppercase">{issue.type}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded ${issue.severity === 'critical' ? 'bg-white text-red-800' : 'bg-white text-orange-800'
                                    }`}>{issue.severity}</span>
                                </div>
                                <p className="text-sm text-slate-700">{issue.description}</p>
                                <p className="text-xs text-red-600 mt-1">{issue.gdprImpact}</p>
                                {isPro && (
                                  <p className="text-xs text-blue-600 mt-2">💡 {issue.recommendation}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                          <span className="text-sm font-bold text-blue-600 uppercase">PASS</span>
                          <div>
                            <p className="font-semibold text-blue-800">No Fingerprinting Detected</p>
                            <p className="text-sm text-blue-600">
                              No canvas, WebGL, audio, or device fingerprinting techniques found.
                            </p>
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-gray-400 mt-3">
                        * Fingerprinting creates unique device identifiers that persist even when cookies are cleared.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Security & Infrastructure */}
              {result.issues.securityHeadersExtended && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowSecurityHeadersExt(!showSecurityHeadersExt)}
                    className="section-btn"
                  >
                    <span className="flex items-center gap-2">
                      <span className="section-btn-title">Security & Infrastructure</span>
                      <span className={result.issues.securityHeadersExtended.score >= 80 ? 'badge-passed' :
                        result.issues.securityHeadersExtended.score >= 50 ? 'badge-warning' :
                          'badge-failed'
                      }>
                        {result.issues.securityHeadersExtended.score}/100
                      </span>
                    </span>
                    <svg className={`w-5 h-5 text-slate-400 transition-transform ${showSecurityHeadersExt ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showSecurityHeadersExt && (
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                      {/* Grade Summary */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`text-4xl font-bold px-4 py-2 rounded-lg ${result.issues.securityHeadersExtended.score >= 80 ? 'bg-white text-slate-700' :
                          result.issues.securityHeadersExtended.score >= 50 ? 'bg-white text-amber-700' :
                            'bg-white text-red-700'
                          }`}>
                          {result.issues.securityHeadersExtended.score}/100
                        </div>
                        <div>
                          <p className="text-slate-700">
                            <strong>{result.issues.securityHeadersExtended.presentCount}</strong> of {result.issues.securityHeadersExtended.totalHeaders} headers present
                          </p>
                          <p className="text-sm text-slate-500">
                            Score: {result.issues.securityHeadersExtended.score}/100
                          </p>
                        </div>
                      </div>

                      {/* SSL/TLS & Email Security - Combined Grid */}
                      <div className="grid md:grid-cols-2 gap-3 mb-4">
                        {/* SSL/TLS */}
                        {result.issues.ssl && (
                          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                            <h4 className="font-medium text-slate-700 text-sm mb-2">SSL/TLS</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-600">HTTPS</span>
                                <span className={result.issues.ssl.valid ? 'text-slate-700 font-medium' : 'text-red-700 font-medium'}>
                                  {result.issues.ssl.valid ? 'Yes' : 'No'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">HSTS</span>
                                <span className={result.issues.ssl.hsts ? 'text-slate-700 font-medium' : 'text-red-700 font-medium'}>
                                  {result.issues.ssl.hsts ? 'Yes' : 'No'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Email Security */}
                        {result.issues.emailSecurity && (
                          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                            <h4 className="font-medium text-slate-700 text-sm mb-2">Email Security</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-600">SPF Record</span>
                                <span className={result.issues.emailSecurity.spf ? 'text-slate-700 font-medium' : 'text-red-700 font-medium'}>
                                  {result.issues.emailSecurity.spf ? 'Yes' : 'No'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">DMARC</span>
                                <span className={result.issues.emailSecurity.dmarc ? 'text-slate-700 font-medium' : 'text-red-700 font-medium'}>
                                  {result.issues.emailSecurity.dmarc ? 'Yes' : 'No'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Security Headers list */}
                      <h4 className="font-medium text-slate-700 text-sm mb-2">Security Headers</h4>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {Object.entries(result.issues.securityHeadersExtended.headers).slice(0, isPro ? 10 : 6).map(([header, info]) => (
                          <div key={header} className={`p-2 rounded-lg text-xs ${info.present ? 'bg-white border border-slate-200' : 'bg-white border border-red-200'}`}>
                            <div className="flex items-center gap-2">
                              {info.present ? (
                                <span className="text-slate-700">Yes</span>
                              ) : (
                                <span className="text-red-700">X</span>
                              )}
                              <span className={`font-medium ${info.present ? 'text-slate-800' : 'text-red-800'}`}>
                                {header.replace('Cross-Origin-', 'CO-')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pro recommendations */}
                      {isPro && result.issues.securityHeadersExtended.issues.length > 0 && (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mt-4">
                          <p className="text-sm text-slate-800 font-medium mb-2">Recommendations:</p>
                          <div className="space-y-2">
                            {result.issues.securityHeadersExtended.issues.slice(0, 3).map((issue, i) => (
                              <div key={i} className="text-xs text-slate-700">
                                <p><strong>{issue.header}:</strong> {issue.recommendation}</p>
                                <p className="text-slate-500 mt-0.5">- {issue.privacyImpact}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-gray-400 mt-3">
                        * SSL/TLS ensures encrypted connections. Security headers protect against XSS, clickjacking, and data leakage.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Storage Audit */}
              {result.issues.storageAudit && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowStorageAudit(!showStorageAudit)}
                    className="section-btn"
                  >
                    <span className="flex items-center gap-2">
                      <span className="section-btn-title">Client Storage Audit</span>
                      {result.issues.storageAudit.compliant ? (
                        <span className="badge-passed">0 issues</span>
                      ) : (
                        <span className="badge-warning">
                          {result.issues.storageAudit.issues.length} risk{result.issues.storageAudit.issues.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </span>
                    <svg className={`w-5 h-5 text-slate-400 transition-transform ${showStorageAudit ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showStorageAudit && (
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-3 rounded-lg bg-white text-center">
                          <p className="text-2xl font-bold text-slate-700">{result.issues.storageAudit.localStorage.count}</p>
                          <p className="text-xs text-slate-500">localStorage</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white text-center">
                          <p className="text-2xl font-bold text-blue-700">{result.issues.storageAudit.sessionStorage.count}</p>
                          <p className="text-xs text-slate-500">sessionStorage</p>
                        </div>
                      </div>

                      {result.issues.storageAudit.issues.length > 0 ? (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {result.issues.storageAudit.issues.slice(0, isPro ? 10 : 2).map((issue, i) => (
                            <div key={i} className={`p-3 rounded-lg border ${issue.risk === 'critical' ? 'bg-white border-red-200' :
                              issue.risk === 'high' ? 'bg-white border-orange-200' :
                                'bg-white border-yellow-200'
                              }`}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-mono text-sm text-slate-800">{issue.key}</p>
                                  <p className="text-xs text-slate-500">{issue.type} · {issue.category}</p>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded ${issue.risk === 'critical' ? 'bg-white text-red-800' : 'bg-white text-orange-800'
                                  }`}>{issue.risk}</span>
                              </div>
                              {isPro && (
                                <p className="text-xs text-blue-600 mt-2">💡 {issue.recommendation}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                          <span className="text-sm font-bold text-blue-600 uppercase">PASS</span>
                          <p className="font-semibold text-blue-800">No risky storage detected</p>
                        </div>
                      )}

                      <p className="text-xs text-gray-400 mt-3">
                        * localStorage persists indefinitely and requires consent like cookies.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Mixed Content */}
              {result.issues.mixedContent && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowMixedContent(!showMixedContent)}
                    className="section-btn"
                  >
                    <span className="flex items-center gap-2">
                      <span className="section-btn-title">Mixed Content Security</span>
                      {result.issues.mixedContent.detected ? (
                        <span className="badge-failed">
                          {result.issues.mixedContent.totalIssues} issue{result.issues.mixedContent.totalIssues > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="badge-passed">0 issues</span>
                      )}
                    </span>
                    <svg className={`w-5 h-5 text-slate-400 transition-transform ${showMixedContent ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showMixedContent && (
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                      {result.issues.mixedContent.detected ? (
                        <>
                          <div className="bg-white border border-red-200 rounded-lg p-3 mb-4">
                            <p className="text-red-800 text-sm">
                              <strong>⚠️ Security Risk:</strong> HTTP resources on HTTPS page.
                              {result.issues.mixedContent.blockedCount > 0 && ` ${result.issues.mixedContent.blockedCount} blocked by browser.`}
                            </p>
                          </div>

                          <div className="grid grid-cols-4 gap-2 mb-4 text-xs">
                            {Object.entries(result.issues.mixedContent.byType).filter(([, v]) => v > 0).map(([type, count]) => (
                              <div key={type} className="p-2 rounded bg-white text-center">
                                <p className="font-bold text-red-600">{count}</p>
                                <p className="text-slate-500">{type}</p>
                              </div>
                            ))}
                          </div>

                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {result.issues.mixedContent.issues.slice(0, isPro ? 8 : 2).map((issue, i) => (
                              <div key={i} className="p-2 bg-white rounded-lg border border-red-100 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-slate-700 uppercase">{issue.type}</span>
                                  {issue.blocked && <span className="px-1 bg-white text-red-800 rounded">BLOCKED</span>}
                                </div>
                                <p className="text-slate-600 truncate">{issue.url}</p>
                                {isPro && (
                                  <p className="text-blue-600 mt-1">→ {issue.recommendation}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                          <span className="text-sm font-bold text-blue-600 uppercase">PASS</span>
                          <div>
                            <p className="font-semibold text-blue-800">All Secure</p>
                            <p className="text-sm text-blue-600">No HTTP resources on HTTPS page.</p>
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-gray-400 mt-3">
                        * Mixed content exposes data to man-in-the-middle attacks.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Form Security */}
              {result.issues.formSecurity && result.issues.formSecurity.totalForms > 0 && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowFormSecurity(!showFormSecurity)}
                    className="section-btn"
                  >
                    <span className="flex items-center gap-2">
                      <span className="section-btn-title">Form Security Analysis</span>
                      {result.issues.formSecurity.compliant ? (
                        <span className="badge-passed">0 issues</span>
                      ) : (
                        <span className="badge-warning">
                          {result.issues.formSecurity.issuesCount} issue{result.issues.formSecurity.issuesCount > 1 ? 's' : ''}
                        </span>
                      )}
                      {result.issues.formSecurity.hasLoginForm && (
                        <span className="badge-info">Login</span>
                      )}
                      {result.issues.formSecurity.hasPaymentForm && (
                        <span className="badge-info">Payment</span>
                      )}
                    </span>
                    <svg className={`w-5 h-5 text-slate-400 transition-transform ${showFormSecurity ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showFormSecurity && (
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-lg bg-slate-50 text-center">
                          <p className="text-2xl font-bold text-slate-700">{result.issues.formSecurity.totalForms}</p>
                          <p className="text-xs text-slate-500">Forms</p>
                        </div>
                        <div className={`p-3 rounded-lg text-center ${result.issues.formSecurity.secureCount === result.issues.formSecurity.totalForms ? 'bg-white' : 'bg-white'}`}>
                          <p className={`text-2xl font-bold ${result.issues.formSecurity.secureCount === result.issues.formSecurity.totalForms ? 'text-slate-700' : 'text-red-700'}`}>
                            {result.issues.formSecurity.secureCount}/{result.issues.formSecurity.totalForms}
                          </p>
                          <p className="text-xs text-slate-500">Secure</p>
                        </div>
                      </div>

                      {result.issues.formSecurity.issues.length > 0 ? (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {result.issues.formSecurity.issues.slice(0, isPro ? 8 : 2).map((issue, i) => (
                            <div key={i} className={`p-3 rounded-lg border ${issue.severity === 'critical' ? 'bg-white border-red-200' :
                              issue.severity === 'high' ? 'bg-white border-orange-200' :
                                'bg-white border-yellow-200'
                              }`}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-slate-700 uppercase">{issue.type.replace(/-/g, ' ')}</span>
                                <span className={`text-xs px-2 py-0.5 rounded ${issue.severity === 'critical' ? 'bg-white text-red-800' : 'bg-white text-orange-800'
                                  }`}>{issue.severity}</span>
                              </div>
                              <p className="text-sm text-slate-700">{issue.description}</p>
                              {issue.field && <p className="text-xs text-slate-500">Field: {issue.field}</p>}
                              {isPro && (
                                <p className="text-xs text-slate-600 mt-2">Tip: {issue.recommendation}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                          <span className="text-sm font-bold text-slate-700 uppercase">PASS</span>
                          <p className="font-semibold text-slate-800">All forms follow security best practices</p>
                        </div>
                      )}

                      <p className="text-xs text-gray-400 mt-3">
                        * Forms with passwords or payments require HTTPS and CSRF protection.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Compliance Checks */}
              <div className="mb-6">
                <button
                  onClick={() => setShowComplianceChecklist(!showComplianceChecklist)}
                  className="w-full flex items-center justify-between text-lg font-semibold text-slate-800 mb-3 hover:text-slate-600 transition"
                >
                  <span>Compliance Checklist</span>
                  <svg className={`w-5 h-5 text-slate-500 transition-transform ${showComplianceChecklist ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showComplianceChecklist && (
                  <>
                    <p className="text-xs text-slate-500 mb-4">
                      Click on any failed item to view detailed fix instructions
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                      <CheckItem passed={result.issues.https} label="HTTPS Enabled" recKey="https" />
                      <CheckItem passed={result.issues.consentBanner} label="Cookie Consent Banner" recKey="consentBanner" />
                      <CheckItem passed={result.issues.privacyPolicy} label="Privacy Policy" recKey="privacyPolicy" />
                      <CheckItem passed={result.issues.cookiePolicy} label="Cookie Policy" recKey="cookiePolicy" />
                      <CheckItem passed={result.issues.legalMentions} label="Legal Mentions / Terms" recKey="legalMentions" />
                      <CheckItem passed={result.issues.dpoContact} label="DPO / Privacy Contact" recKey="dpoContact" />
                      <CheckItem passed={result.issues.dataDeleteLink} label="Data Deletion Option" recKey="dataDeleteLink" />
                      <CheckItem passed={result.issues.optOutMechanism} label="Opt-out Mechanism" recKey="optOutMechanism" />
                      <CheckItem passed={result.issues.secureforms} label="Form Consent Checkbox" recKey="secureforms" />
                      <CheckItem passed={result.issues.cookies.undeclared === 0} label={`Cookies Declared (${result.issues.cookies.count} found)`} />
                      {result.issues.ageVerification && (
                        <CheckItem passed={true} label="Age Verification" recKey="ageVerification" />
                      )}
                    </div>
                  </>
                )}
              </div>



              {/* Email Exposure Warning */}
              {result.issues.exposedEmails && result.issues.exposedEmails.length > 0 && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowEmailExposure(!showEmailExposure)}
                    className="w-full flex items-center justify-between text-lg font-semibold text-slate-800 mb-3 hover:text-slate-600 transition"
                  >
                    <span>Email Exposure Warning</span>
                    <svg className={`w-5 h-5 text-slate-500 transition-transform ${showEmailExposure ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showEmailExposure && (
                    <div className="p-4 bg-white border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center">
                          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">{result.issues.exposedEmails.length} Email{result.issues.exposedEmails.length > 1 ? 's' : ''} Exposed</h3>
                          <p className="text-slate-600 text-xs">Email addresses visible in page source may be harvested by spammers.</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.issues.exposedEmails.slice(0, isPro ? undefined : 2).map((email, i) => (
                          <span key={i} className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-700 text-xs font-mono">
                            <MaskedEmail email={email} show={isPro} />
                          </span>
                        ))}
                        {!isPro && result.issues.exposedEmails.length > 2 && (
                          <span className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-500 text-xs">
                            +{result.issues.exposedEmails.length - 2} more
                          </span>
                        )}
                      </div>
                      {!isPro && (
                        <UpgradeCTA feature="email addresses" hiddenCount={result.issues.exposedEmails.length} onUpgrade={() => handleCheckout()} />
                      )}
                      <p className="mt-3 text-slate-500 text-xs">
                        <strong>Recommendation:</strong> Use contact forms or obfuscate emails to prevent harvesting.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Third-Party Scripts & Tracking */}
              {((result.issues.externalResources &&
                (result.issues.externalResources.scripts.length > 0 ||
                  result.issues.externalResources.fonts.length > 0 ||
                  result.issues.externalResources.iframes.length > 0)) ||
                (result.issues.socialTrackers && result.issues.socialTrackers.length > 0)) && (
                  <div className="mb-4">
                    <button
                      onClick={() => setShowExternalResources(!showExternalResources)}
                      className="section-btn"
                    >
                      <span className="flex items-center gap-2">
                        <span className="section-btn-title">Third-Party Scripts & Tracking</span>
                        {result.issues.socialTrackers && result.issues.socialTrackers.length > 0 && (
                          <span className="badge-warning">
                            {result.issues.socialTrackers.length} tracker{result.issues.socialTrackers.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </span>
                      <svg className={`w-5 h-5 text-slate-400 transition-transform ${showExternalResources ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showExternalResources && (
                      <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <p className="text-slate-600 text-xs mb-4">
                          Third-party resources may track visitors and require explicit consent under GDPR.
                        </p>

                        {/* Social & Ad Trackers */}
                        {result.issues.socialTrackers && result.issues.socialTrackers.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium text-slate-700 text-sm mb-2 flex items-center gap-2">
                              <span className="px-1.5 py-0.5 bg-white border border-slate-300 text-slate-700 rounded text-xs">{result.issues.socialTrackers.length}</span>
                              Social & Ad Trackers
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {result.issues.socialTrackers.map((tracker, i) => (
                                <span
                                  key={i}
                                  className={`px-2 py-1 rounded text-xs font-medium ${tracker.risk === 'high'
                                    ? 'bg-white text-red-700 border border-red-200'
                                    : tracker.risk === 'medium'
                                      ? 'bg-white text-amber-700 border border-amber-200'
                                      : 'bg-white text-slate-700 border border-slate-200'
                                    }`}
                                >
                                  <MaskedText text={tracker.name} show={isPro} /> ({tracker.risk})
                                </span>
                              ))}
                            </div>
                            {!isPro && (
                              <UpgradeCTA feature="tracker details" hiddenCount={result.issues.socialTrackers.length} onUpgrade={() => handleCheckout()} />
                            )}
                          </div>
                        )}

                        {/* External Scripts */}
                        {result.issues.externalResources && result.issues.externalResources.scripts.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium text-slate-700 text-sm mb-2 flex items-center gap-2">
                              <span className="px-1.5 py-0.5 bg-white rounded text-xs">{result.issues.externalResources.scripts.length}</span>
                              External Scripts
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {[...new Set(result.issues.externalResources.scripts.map(s => s.provider))].slice(0, isPro ? undefined : 3).map((provider, i) => (
                                <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-700 text-sm">
                                  <MaskedText text={provider} show={isPro} />
                                </span>
                              ))}
                              {!isPro && [...new Set(result.issues.externalResources.scripts.map(s => s.provider))].length > 3 && (
                                <span className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-slate-500 text-sm">
                                  +{[...new Set(result.issues.externalResources.scripts.map(s => s.provider))].length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* External Fonts */}
                        {result.issues.externalResources && result.issues.externalResources.fonts.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium text-slate-700 text-sm mb-2 flex items-center gap-2">
                              <span className="px-1.5 py-0.5 bg-white rounded text-xs">{result.issues.externalResources.fonts.length}</span>
                              External Fonts
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {[...new Set(result.issues.externalResources.fonts.map(f => f.provider))].map((provider, i) => (
                                <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-700 text-sm">
                                  {provider}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Embedded Iframes */}
                        {result.issues.externalResources && result.issues.externalResources.iframes.length > 0 && (
                          <div>
                            <h4 className="font-medium text-slate-700 text-sm mb-2 flex items-center gap-2">
                              <span className="px-1.5 py-0.5 bg-white rounded text-xs">{result.issues.externalResources.iframes.length}</span>
                              Embedded Iframes
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {[...new Set(result.issues.externalResources.iframes.map(f => f.provider))].map((provider, i) => (
                                <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-700 text-sm">
                                  {provider}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <p className="text-xs text-gray-400 mt-3">
                          * All external resources may track visitors and impact page load performance.
                        </p>
                      </div>
                    )}
                  </div>
                )}

              {/* Vendor Risk Assessment */}
              {result.issues.vendorRisks && result.issues.vendorRisks.length > 0 && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowVendorRisk(!showVendorRisk)}
                    className="w-full flex items-center justify-between text-lg font-semibold text-slate-800 mb-3 hover:text-slate-600 transition"
                  >
                    <span>Vendor Risk Assessment</span>
                    <svg className={`w-5 h-5 text-slate-500 transition-transform ${showVendorRisk ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showVendorRisk && (
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                      <p className="text-slate-600 text-xs mb-4">
                        Privacy risk evaluation of third-party vendors. Higher scores indicate greater concerns.
                      </p>
                      <div className="space-y-3">
                        {result.issues.vendorRisks.map((vendor, i) => (
                          <div key={i} className={`bg-white border rounded-lg p-4 ${vendor.riskScore >= 8 ? 'border-red-300' :
                            vendor.riskScore >= 6 ? 'border-orange-300' :
                              vendor.riskScore >= 4 ? 'border-yellow-300' :
                                'border-blue-300'
                            }`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold text-white ${vendor.riskScore >= 8 ? 'bg-white0' :
                                  vendor.riskScore >= 6 ? 'bg-white0' :
                                    vendor.riskScore >= 4 ? 'bg-white0' :
                                      'bg-white0'
                                  }`}>
                                  {vendor.riskScore}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900"><MaskedText text={vendor.name} show={isPro} /></h4>
                                  <p className="text-xs text-gray-500 capitalize">{vendor.category} • <MaskedText text={vendor.jurisdiction} show={isPro} /></p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${vendor.riskLevel === 'critical' ? 'bg-white text-red-700' :
                                  vendor.riskLevel === 'high' ? 'bg-white text-orange-700' :
                                    vendor.riskLevel === 'medium' ? 'bg-white text-yellow-700' :
                                      'bg-white text-blue-700'
                                  }`}>
                                  {vendor.riskLevel.toUpperCase()}
                                </span>
                                {vendor.gdprCompliant ? (
                                  <span className="px-2 py-1 bg-white text-blue-700 rounded-full text-xs font-medium">GDPR ✓</span>
                                ) : (
                                  <span className="px-2 py-1 bg-white text-red-700 rounded-full text-xs font-medium">GDPR ✗</span>
                                )}
                              </div>
                            </div>
                            {vendor.concerns.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {vendor.concerns.map((concern, j) => (
                                  <span key={j} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                    {concern}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="mt-2 text-xs text-gray-400">
                              Data transfer: <span className={`font-medium ${vendor.dataTransfer === 'EU' ? 'text-blue-600' : vendor.dataTransfer === 'CN' ? 'text-red-600' : 'text-orange-600'}`}>
                                {vendor.dataTransfer === 'EU' ? 'EU (adequate)' : vendor.dataTransfer === 'US' ? 'USA' : vendor.dataTransfer === 'CN' ? 'China' : 'Other'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-white0"></span> 8-10: Critical</span>
                          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-white0"></span> 6-7: High</span>
                          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-white0"></span> 4-5: Medium</span>
                          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-white0"></span> 1-3: Low</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Data Transfers Outside EU */}
              {result.issues.vendorRisks && (() => {
                const nonEuTransfers = result.issues.vendorRisks.filter(v =>
                  v.dataTransfer === 'International' ||
                  v.jurisdiction === 'USA' ||
                  v.jurisdiction === 'China' ||
                  v.jurisdiction === 'Russia' ||
                  v.jurisdiction === 'India' ||
                  !v.gdprCompliant
                );
                return (
                  <div className="mb-4">
                    <button
                      onClick={() => setShowDataTransfers(!showDataTransfers)}
                      className="section-btn"
                    >
                      <span className="flex items-center gap-2">
                        <span className="section-btn-title">Data Transfers Outside EU</span>
                        {nonEuTransfers.length > 0 ? (
                          <span className="badge-warning">
                            {nonEuTransfers.length} vendor{nonEuTransfers.length > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="badge-passed">EU Only</span>
                        )}
                      </span>
                      <svg className={`w-5 h-5 text-slate-400 transition-transform ${showDataTransfers ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showDataTransfers && (
                      <div className="bg-white border border-slate-200 rounded-lg p-4">
                        {nonEuTransfers.length > 0 ? (
                          <>
                            <div className="bg-white border border-orange-200 rounded-lg p-4 mb-4">
                              <p className="text-orange-800 text-sm">
                                <strong>GDPR Article 44-49:</strong> Transfers to non-EU countries require adequate safeguards (SCCs, BCRs) or user consent.
                              </p>
                            </div>
                            <div className="space-y-3">
                              {nonEuTransfers.map((vendor, i) => (
                                <div key={i} className={`p-3 rounded-lg border ${!vendor.gdprCompliant ? 'bg-white border-red-200' :
                                  vendor.jurisdiction === 'USA' ? 'bg-white border-orange-200' :
                                    'bg-white border-yellow-200'
                                  }`}>
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-semibold text-slate-800">{vendor.name}</p>
                                      <p className="text-xs text-slate-500">{vendor.category}</p>
                                    </div>
                                    <div className="text-right">
                                      <span className={`text-xs px-2 py-1 rounded ${vendor.jurisdiction === 'USA' ? 'bg-slate-100 text-slate-700' :
                                        vendor.jurisdiction === 'EU' ? 'bg-slate-100 text-slate-700' :
                                          'bg-gray-100 text-gray-700'
                                        }`}>
                                        {vendor.jurisdiction}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="mt-2 flex items-center gap-2">
                                    {vendor.gdprCompliant ? (
                                      <span className="text-xs text-slate-600 flex items-center gap-1">
                                        ✓ GDPR compliant (uses SCCs)
                                      </span>
                                    ) : (
                                      <span className="text-xs text-red-600 flex items-center gap-1">
                                        ⚠ No GDPR adequacy decision
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            {isPro && (
                              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                <p className="text-sm text-slate-800 font-medium mb-2">Compliance Requirements:</p>
                                <ul className="text-xs text-slate-700 list-disc list-inside space-y-1">
                                  <li>Ensure Standard Contractual Clauses (SCCs) are in place</li>
                                  <li>Document Transfer Impact Assessments (TIAs)</li>
                                  <li>Disclose international transfers in your privacy policy</li>
                                  <li>Consider EU-based alternatives for non-compliant vendors</li>
                                </ul>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                            <span className="text-blue-600 font-bold text-lg">✓</span>
                            <div>
                              <p className="font-semibold text-blue-800">All Data Stays in EU</p>
                              <p className="text-sm text-blue-600">
                                No third-party vendors transfer data outside the European Union.
                              </p>
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-3">
                          * Based on vendor headquarters and known data processing locations.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Data Breaches */}
              <div className="mb-4">
                <button
                  onClick={() => setShowDataBreaches(!showDataBreaches)}
                  className="section-btn"
                >
                  <span className="flex items-center gap-2">
                    <span className="section-btn-title">Data Breach Check</span>
                    {result.issues.dataBreaches && result.issues.dataBreaches.length > 0 ? (
                      <span className="badge-failed">
                        {result.issues.dataBreaches.length} breach{result.issues.dataBreaches.length > 1 ? 'es' : ''}
                      </span>
                    ) : (
                      <span className="badge-passed">0 issues</span>
                    )}
                  </span>
                  <svg className={`w-5 h-5 text-slate-400 transition-transform ${showDataBreaches ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showDataBreaches && (
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    {result.issues.dataBreaches && result.issues.dataBreaches.length > 0 ? (
                      <>
                        <div className="bg-white border border-red-200 rounded-lg p-4 mb-4">
                          <p className="text-red-700 text-sm">
                            <strong>Warning:</strong> This domain has been involved in known data breaches. Users should be informed and passwords changed.
                          </p>
                        </div>
                        <div className="space-y-3">
                          {result.issues.dataBreaches.map((breach, i) => (
                            <div key={i} className="bg-white border border-red-100 rounded-lg p-3 flex justify-between items-center">
                              <div>
                                <p className="font-semibold text-red-800">{breach.name}</p>
                                <p className="text-xs text-red-600">Breach date: {breach.date}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-red-700">{breach.count.toLocaleString()}</p>
                                <p className="text-xs text-red-500">accounts affected</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <a
                          href={`https://haveibeenpwned.com/DomainSearch?domain=${result.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-4 text-sm text-red-700 hover:text-red-900"
                        >
                          View full details on HaveIBeenPwned →
                        </a>
                      </>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                        <span className="text-blue-600 font-bold text-lg">✓</span>
                        <div>
                          <p className="font-semibold text-blue-800">No Data Breaches Found</p>
                          <p className="text-sm text-blue-600">
                            This domain has not been found in any known data breaches.
                          </p>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-3">
                      * Checked against HaveIBeenPwned database of known breaches.
                    </p>
                  </div>
                )}
              </div>

              {/* Cookies Section */}
              <div className="mb-6">
                <button
                  onClick={() => setShowCookies(!showCookies)}
                  className="flex items-center gap-2 text-gray-900 font-semibold mb-4 hover:text-blue-600 transition"
                >
                  <svg className={`w-5 h-5 transition-transform ${showCookies ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Cookies Detected ({result.issues.cookies.count})
                </button>
                {showCookies && result.issues.cookies.list.length > 0 && (
                  <div className="bg-white rounded-md p-4 overflow-x-auto">
                    {/* Category Legend */}
                    <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b border-gray-200">
                      <span className="text-xs text-gray-500 font-medium">Categories:</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white text-slate-700">necessary</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">analytics</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-sky-200 text-sky-800">marketing</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-400 text-amber-900">preferences</span>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 border-b border-gray-200">
                          <th className="pb-2 pr-4">Name</th>
                          <th className="pb-2 pr-4">Category</th>
                          <th className="pb-2 pr-4">Provider</th>
                          <th className="pb-2">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.issues.cookies.list.map((cookie, i) => (
                          <tr key={i} className="border-b border-gray-100 last:border-0">
                            <td className="py-2 pr-4 font-mono text-gray-900"><MaskedText text={cookie.name} show={isPro} /></td>
                            <td className="py-2 pr-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(cookie.category)}`}>
                                {cookie.category}
                              </span>
                            </td>
                            <td className="py-2 pr-4 text-gray-600"><MaskedText text={cookie.provider} show={isPro} /></td>
                            <td className="py-2 text-gray-600"><MaskedText text={cookie.description} show={isPro} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Pages Scanned */}
              <div className="mb-6">
                <button
                  onClick={() => setShowPages(!showPages)}
                  className="flex items-center gap-2 text-gray-900 font-semibold mb-4 hover:text-blue-600 transition"
                >
                  <svg className={`w-5 h-5 transition-transform ${showPages ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Pages Scanned ({result.pagesScanned})
                </button>
                {showPages && (
                  <div className="bg-white rounded-md p-4 space-y-3">
                    {result.pages.map((page, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                        <div className="truncate flex-1 mr-4">
                          <p className="font-medium text-gray-900 truncate">{page.title}</p>
                          <p className="text-sm text-gray-500 truncate">{page.url}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <span className="px-2 py-1 bg-white text-blue-700 text-xs rounded-full">
                            {page.cookiesFound} cookies
                          </span>
                          <span className="px-2 py-1 bg-white text-black text-xs rounded-full">
                            {page.trackersFound.length} trackers
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Trackers */}
              {result.issues.trackers.length > 0 && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowTrackers(!showTrackers)}
                    className="w-full flex items-center justify-between text-lg font-semibold text-slate-800 mb-3 hover:text-slate-600 transition"
                  >
                    <span>Third-Party Trackers Detected</span>
                    <svg className={`w-5 h-5 text-slate-500 transition-transform ${showTrackers ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showTrackers && (
                    <div className="p-4 bg-white border border-slate-200 rounded-lg">
                      <p className="text-slate-600 text-sm mb-3">
                        {result.issues.trackers.length} tracker{result.issues.trackers.length > 1 ? 's' : ''} collecting user data - explicit consent required under GDPR.
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {result.issues.trackers.slice(0, isPro ? undefined : 2).map((tracker, i) => (
                          <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-700 text-sm font-medium">
                            <MaskedText text={tracker} show={isPro} />
                          </span>
                        ))}
                        {!isPro && result.issues.trackers.length > 2 && (
                          <span className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-slate-500 text-sm">
                            +{result.issues.trackers.length - 2} more
                          </span>
                        )}
                      </div>
                      {!isPro && (
                        <UpgradeCTA feature="tracker names" hiddenCount={result.issues.trackers.length} onUpgrade={() => handleCheckout()} />
                      )}
                      <p className="text-slate-500 text-xs mt-3">
                        Tip: Use our Cookie Banner to block these trackers until user consent is given.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* CTA */}
              <div className="mt-8 p-6 bg-slate-800 border border-slate-700 rounded-md text-center">
                <h4 className="text-lg font-semibold text-white mb-2 uppercase tracking-wider">Get the Full Audit Report</h4>
                <p className="text-slate-300 text-sm mb-4">Detailed recommendations, PDF export, and continuous monitoring</p>
                <button onClick={() => handleCheckout()} className="px-6 py-2.5 bg-white text-slate-800 font-semibold rounded-md hover:bg-white transition text-sm">
                  Upgrade to Pro
                </button>
              </div>

              {/* Disclaimer Footer */}
              <div className="mt-6 pt-4 border-t border-slate-200 text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                  This automated report does not constitute legal advice. For official compliance certification, consult a qualified DPO.
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Report generated by PrivacyChecker Audit Engine v2.1 • © {new Date().getFullYear()} PrivacyChecker
                </p>
              </div>
            </div>
          )}
        </div>

        {/* How It Works */}
        <section className="py-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">How it works</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">A complete privacy audit of your website in under 60 seconds</p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-8 bg-white rounded-lg border border-gray-100">
              <div className="text-4xl font-bold text-blue-600 mb-4">1</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Enter your website URL</h3>
              <p className="text-gray-600 text-sm mb-4">We crawl up to 1,000 pages and run a comprehensive analysis.</p>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Compliance checks</p>
              <ul className="text-gray-600 text-sm space-y-1 mb-4">
                <li>• Cookies, consent banner, privacy policy</li>
                <li>• HTTPS, DPO contact, data deletion</li>
                <li>• Legal mentions, opt-out mechanisms</li>
              </ul>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Security analysis</p>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• Third-party vendor risk scoring</li>
                <li>• Exposed files detection (.git, .env)</li>
                <li>• DNS security (SPF, DKIM, DMARC)</li>
              </ul>
            </div>
            <div className="p-8 bg-white rounded-lg border border-gray-100">
              <div className="text-4xl font-bold text-blue-600 mb-4">2</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Get your compliance score</h3>
              <p className="text-gray-600 text-sm mb-4">We check 20+ compliance criteria and calculate your privacy score from 0 to 100%.</p>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">What you&apos;ll see</p>
              <ul className="text-gray-600 text-sm space-y-1 mb-4">
                <li>• Applicable regulations (GDPR, CCPA, LGPD...)</li>
                <li>• Issues found with severity levels</li>
                <li>• Cookies and trackers detected</li>
              </ul>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Pro+ insights</p>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• AI Risk Predictor with fine estimation</li>
                <li>• Vendor risk scores (80+ third-parties)</li>
                <li>• Attack surface vulnerabilities</li>
              </ul>
            </div>
            <div className="p-8 bg-white rounded-lg border border-gray-100">
              <div className="text-4xl font-bold text-blue-600 mb-4">3</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Fix issues and stay compliant</h3>
              <p className="text-gray-600 text-sm mb-4">Pro users get everything to fix and maintain compliance over time.</p>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Fix tools</p>
              <ul className="text-gray-600 text-sm space-y-1 mb-4">
                <li>• Step-by-step fix recommendations</li>
                <li>• PDF compliance report</li>
                <li>• Cookie Banner Widget with geo-targeting</li>
              </ul>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Monitoring</p>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• Weekly or monthly auto-rescans</li>
                <li>• Email alerts if score drops</li>
                <li>• Compliance drift detection</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Simple pricing</h2>
          <p className="text-gray-600 text-center mb-12">Free to scan. Upgrade to unlock recommendations.</p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-8 bg-white rounded-lg border border-gray-100 flex flex-col">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Free</h3>
              <p className="text-4xl font-bold text-gray-900 mb-6">€0</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  10 scans/month
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  20 pages scanned
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Full compliance audit
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Privacy score
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Issues detected
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Cookies & trackers list
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  How to fix? Upgrade to Pro
                </li>
              </ul>
              <a href="/signup" className="block w-full py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition font-semibold text-center mt-auto">
                Start Free Audit
              </a>
            </div>

            <div className="p-8 bg-gradient-to-b from-blue-600 to-blue-700 rounded-lg border border-blue-400 relative shadow-xl flex flex-col">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white border border-blue-200 rounded-full text-sm font-medium text-blue-700 shadow-sm">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Pro</h3>
              <p className="text-4xl font-bold text-white mb-6">€19<span className="text-lg text-blue-100">/month</span></p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Everything in Free
                </li>
                <li className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <strong>50 scans</strong>/month
                </li>
                <li className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <strong>200 pages</strong> scanned
                </li>
                <li className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <strong>Step-by-step fix recommendations</strong>
                </li>
                <li className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  PDF compliance report
                </li>
                <li className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Email alerts if score drops
                </li>
                <li className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Monthly auto-scan
                </li>
                <li className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <strong>Cookie Banner Widget</strong>
                </li>
                <li className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <strong>Google Consent Mode v2</strong>
                </li>
              </ul>
              <button onClick={() => handleCheckout()} className="block w-full py-3 bg-white text-blue-600 font-semibold rounded-md hover:bg-white transition text-center mt-auto">
                Get Pro Now
              </button>
            </div>

            {/* Pro+ */}
            <div className="p-8 bg-gradient-to-b from-cyan-500 to-teal-600 rounded-lg border border-cyan-400 relative shadow-xl flex flex-col">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white border border-teal-200 rounded-full text-sm font-medium text-teal-700 shadow-sm">
                Best Value
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Pro+</h3>
              <p className="text-4xl font-bold text-white mb-6">€29<span className="text-lg text-cyan-100">/month</span></p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5 text-cyan-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Everything in Pro
                </li>
                <li className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5 text-cyan-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <strong>200 scans</strong>/month
                </li>
                <li className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <strong>1,000 pages</strong> scanned
                </li>
                <li className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <strong>Weekly</strong> auto-scan
                </li>
                <li className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <strong>Data Breach Detection</strong> (HIBP)
                </li>
                <li className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5 text-cyan-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Social Trackers (FB, TikTok, LinkedIn...)
                </li>
                <li className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5 text-cyan-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Security Headers Analysis
                </li>
                <li className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5 text-cyan-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Email Security (SPF/DKIM/DMARC)
                </li>
                <li className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5 text-cyan-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Exposed Emails Detection
                </li>
                <li className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <strong>AI Risk Predictor</strong>
                </li>
                <li className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <strong>Vendor Risk Score</strong>
                </li>
                <li className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <strong>Attack Surface Scanner</strong>
                </li>
                <li className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5 text-cyan-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Compliance Drift Detection
                </li>
              </ul>
              <button onClick={() => handleCheckout('pro_plus')} className="block w-full py-3 bg-white text-teal-600 font-semibold rounded-md hover:bg-teal-50 transition text-center mt-auto">
                Get Pro+ Now
              </button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What does PrivacyChecker scan?</h3>
              <p className="text-gray-600">We check 14+ compliance criteria including HTTPS, cookie consent banner, privacy policy, legal mentions, DPO contact, data deletion options, secure forms, and security headers. Plus: third-party vendor risk scores (80+ trackers), exposed files (.git, .env, backups), DNS security (SPF/DMARC), and AI-powered GDPR fine estimation.</p>
            </div>
            <div className="bg-white p-6 rounded-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Is the audit really free?</h3>
              <p className="text-gray-600">Yes! The full audit is 100% free. You'll see your privacy score and all issues detected. Pro unlocks step-by-step recommendations on how to fix each issue, plus PDF reports and email alerts.</p>
            </div>
            <div className="bg-white p-6 rounded-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How long does a scan take?</h3>
              <p className="text-gray-600">Usually 30-60 seconds depending on your website size. We analyze your pages in real-time to give you accurate results.</p>
            </div>
            <div className="bg-white p-6 rounded-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What regulations do you check?</h3>
              <p className="text-gray-600">We check compliance against GDPR (Europe), CCPA (California), LGPD (Brazil), and 50+ other global privacy regulations. Your results show which laws apply to your site based on its content.</p>
            </div>
            <div className="bg-white p-6 rounded-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What&apos;s included in Pro and Pro+?</h3>
              <p className="text-gray-600">Pro includes step-by-step fix recommendations, PDF reports, email alerts, monthly auto-scans, Cookie Banner Widget (geo-targeting 8 privacy laws), and Google Consent Mode v2. Pro+ adds: weekly scans, AI Risk Predictor (€ fine estimation), Vendor Risk Scores, Attack Surface Scanner (.git, .env, S3 exposed), DNS Security checks (SPF/DKIM/DMARC), and Compliance Drift Detection.</p>
            </div>
            <div className="bg-white p-6 rounded-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What is the Cookie Banner Widget?</h3>
              <p className="text-gray-600">It&apos;s a customizable cookie consent banner you can embed on your site with one line of code. It handles consent for Analytics, Marketing, and Functional cookies, and integrates with Google Consent Mode v2 to ensure your Google Analytics and Ads respect user choices.</p>
            </div>
            <div className="bg-white p-6 rounded-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I cancel my subscription anytime?</h3>
              <p className="text-gray-600">Yes, you can cancel at any time from your Dashboard or by emailing support@privacychecker.pro. Your access continues until the end of your billing period. There are no cancellation fees.</p>
            </div>
          </div>
        </section>

        {/* Regulations Covered */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">Regulations We Check</h2>
            <p className="text-gray-600 text-center mb-4">Comprehensive coverage for global privacy compliance</p>
            <div className="flex justify-center overflow-hidden" style={{ maxHeight: '95px' }}>
              <img
                src="/badges.png"
                alt="GDPR, CCPA, LGPD, PIPEDA, UK GDPR and 50+ more regulations"
                className="object-cover h-[360px] sm:h-[440px] -my-[132px] sm:-my-[172px]"
                style={{
                  filter: 'brightness(1.08) contrast(1.1)'
                }}
              />
            </div>

            {/* Trust Badges - integrated with regulations above */}
            <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 mt-0">

              {/* EU Data Badge - Circle with stars */}
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 relative">
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg group-hover:drop-shadow-xl transition">
                    {/* EU Blue circle */}
                    <circle cx="50" cy="50" r="48" fill="#003399" stroke="#002266" strokeWidth="2" />
                    {/* Stars in circle */}
                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
                      <text
                        key={i}
                        x={50 + 35 * Math.cos((angle - 90) * Math.PI / 180)}
                        y={50 + 35 * Math.sin((angle - 90) * Math.PI / 180)}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#FFCC00"
                        fontSize="10"
                      >★</text>
                    ))}
                    {/* EU DATA text in center */}
                    <text x="50" y="46" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">EU</text>
                    <text x="50" y="60" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">DATA</text>
                  </svg>
                </div>
              </div>

              {/* SSL 256-Bit Badge - Gray Circle */}
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 relative">
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg group-hover:drop-shadow-xl transition">
                    <circle cx="50" cy="50" r="48" fill="#4b5563" stroke="#374151" strokeWidth="2" />
                    <text x="50" y="38" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">SSL</text>
                    <text x="50" y="54" textAnchor="middle" fill="white" fontSize="10">256-BIT</text>
                    <text x="50" y="70" textAnchor="middle" fill="white" fontSize="8" opacity="0.8">ENCRYPTED</text>
                  </svg>
                </div>
              </div>

              {/* SOC 2 Badge - Light Blue Circle */}
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 relative">
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg group-hover:drop-shadow-xl transition">
                    <circle cx="50" cy="50" r="48" fill="#0ea5e9" stroke="#0284c7" strokeWidth="2" />
                    <text x="50" y="42" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">SOC 2</text>
                    <text x="50" y="58" textAnchor="middle" fill="white" fontSize="10">TYPE II</text>
                    <text x="50" y="74" textAnchor="middle" fill="white" fontSize="8" opacity="0.8">CERTIFIED</text>
                  </svg>
                </div>
              </div>

              {/* 100K Scans Badge - Dark Circle */}
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 relative">
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg group-hover:drop-shadow-xl transition">
                    <circle cx="50" cy="50" r="48" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
                    <text x="50" y="42" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">100K</text>
                    <text x="50" y="58" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">SCANS</text>
                    <text x="50" y="74" textAnchor="middle" fill="white" fontSize="8" opacity="0.8">VERIFIED</text>
                  </svg>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-1 mb-4">
                <img src="/logo.png" alt="PrivacyChecker" className="w-10 h-10 scale-150" />
                <span className="text-xl font-bold text-gray-900">PrivacyChecker</span>
              </div>
              <p className="text-gray-500 text-sm">
                Privacy compliance made simple. Audit your website for GDPR, CCPA and 50+ regulations.
              </p>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-gray-900">Terms of Service</Link></li>
                <li><Link href="/legal/dpa" className="hover:text-gray-900">Data Processing Agreement</Link></li>
                <li><Link href="/legal/cookies" className="hover:text-gray-900">Cookie Policy</Link></li>
                <li><Link href="/legal" className="hover:text-gray-900">Legal Hub</Link></li>
              </ul>
            </div>

            {/* Your Rights */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Your Privacy Rights</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="mailto:privacy@privacychecker.pro?subject=Data%20Deletion%20Request" className="hover:text-gray-900">
                    Delete My Data
                  </a>
                </li>
                <li>
                  <a href="mailto:privacy@privacychecker.pro?subject=Data%20Access%20Request" className="hover:text-gray-900">
                    Data Export Request
                  </a>
                </li>
                <li>
                  <a href="mailto:privacy@privacychecker.pro?subject=Opt-Out%20Request" className="hover:text-gray-900">
                    Opt-Out of Communications
                  </a>
                </li>
                <li>
                  <a href="mailto:privacy@privacychecker.pro?subject=Unsubscribe" className="hover:text-gray-900">
                    Unsubscribe
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="mailto:privacy@privacychecker.pro" className="hover:text-gray-900">
                    Privacy & DPO Contact
                  </a>
                </li>
                <li>
                  <span className="text-gray-500">
                    General: see Privacy Policy
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-200 pt-6">
            <p className="text-gray-500 text-sm text-center">© 2026 PrivacyChecker. All rights reserved.</p>
            <p className="text-gray-400 text-xs text-center mt-4 max-w-3xl mx-auto">
              Content available on PrivacyChecker.pro is intended for general information purposes only — it is not legal advice.
              Reports generated using our Service are generated automatically and do not constitute legal advice.
              We encourage you to consult with a lawyer licensed in your jurisdiction before taking actions based on our reports.
            </p>
          </div>
        </div>
      </footer>

      {/* Cookie Consent Banner - detected by patterns: cookie-consent, cookie-banner, accept cookies, manage cookies */}
      <div
        id="cookie-consent"
        className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50 ${showCookieConsent ? '' : 'hidden'}`}
        role="dialog"
        aria-label="Cookie consent"
      >
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            <p>
              We use cookies to enhance your experience. By continuing, you agree to our{' '}
              <Link href="/legal/cookies" className="text-blue-600 hover:underline">Cookie Policy</Link>.
              You can <Link href="/legal/cookies" className="text-blue-600 hover:underline">manage cookies</Link> or{' '}
              <Link href="/legal/cookies" className="text-blue-600 hover:underline">manage preferences</Link> at any time.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                localStorage.setItem('cookieConsent', 'essential');
                setShowCookieConsent(false);
              }}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Essential Only
            </button>
            <button
              onClick={() => {
                localStorage.setItem('cookieConsent', 'all');
                setShowCookieConsent(false);
              }}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Accept All Cookies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}







