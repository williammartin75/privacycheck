'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { recommendations } from '@/lib/recommendations';
import { generatePDF } from '@/lib/pdf-generator';
import { detectComplianceDrift, DriftReport } from '@/lib/drift-detection';

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
    if (score >= 80) return 'text-emerald-700';
    if (score >= 50) return 'text-slate-600';
    return 'text-slate-800';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { label: 'Compliant', sublabel: 'Low Risk', bg: 'border border-slate-300', text: 'text-slate-700' };
    if (score >= 50) return { label: 'Improvements Required', sublabel: 'Medium Risk', bg: 'border border-slate-300', text: 'text-slate-700' };
    return { label: 'Non-Compliant', sublabel: 'High Risk', bg: 'border border-slate-300', text: 'text-slate-700' };
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'necessary': return 'bg-slate-200 text-slate-700';
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
            <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <span className="text-lg sm:text-2xl font-bold text-gray-900">PrivacyChecker</span>
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
                className="flex-1 px-6 py-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
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
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center animate-pulse">
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
              {/* Header with Score Gauge */}
              <div className="flex flex-col md:flex-row items-center gap-8 mb-8 pb-8 border-b border-slate-100">
                {/* Score Circle - Corporate Navy Style */}
                <div className="relative">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="#e2e8f0" strokeWidth="8" fill="none" />
                    <circle
                      cx="64" cy="64" r="56"
                      stroke={result.score >= 70 ? '#16a34a' : result.score >= 40 ? '#FFD700' : '#dc2626'}
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${result.score * 3.52} 352`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span style={{ color: result.score >= 70 ? '#16a34a' : result.score >= 40 ? '#FFD700' : '#dc2626' }} className="text-3xl font-bold">{result.score}</span>
                    <span style={{ color: result.score >= 70 ? '#16a34a' : result.score >= 40 ? '#FFD700' : '#dc2626' }} className="text-xl font-bold">%</span>
                  </div>
                </div>

                {/* Site Info */}
                <div className="flex-1 text-center md:text-left">
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Privacy Audit Report</p>
                  <p className="text-slate-800 text-2xl font-semibold mb-3">{result.domain}</p>
                  <div className={`inline-block px-3 py-1.5 rounded text-xs font-semibold ${getScoreLabel(result.score).bg} ${getScoreLabel(result.score).text}`}>
                    {getScoreLabel(result.score).label} • {getScoreLabel(result.score).sublabel}
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap justify-center md:justify-start">
                    {result.regulations?.map((reg, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded font-medium">
                        {reg}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="flex-shrink-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">Executive Summary</p>
                  <div className="grid grid-cols-1 gap-2 min-w-[220px]">
                    {/* Issues Found - Red indicator */}
                    <div className="flex items-center justify-between px-3 py-2 bg-white rounded border border-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        <span className="text-xs text-red-600">Issues Found</span>
                      </div>
                      <span className="font-bold text-red-600">{Object.values(result.issues).filter(v => !v).length}</span>
                    </div>
                    {/* Checks Passed - Blue indicator */}
                    <div className="flex items-center justify-between px-3 py-2 bg-white rounded border border-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        <span className="text-xs text-slate-700">Checks Passed</span>
                      </div>
                      <span className="font-bold text-slate-800">{Object.values(result.issues).filter(v => v).length}</span>
                    </div>
                    {/* Pages Scanned - Blue indicator */}
                    <div className="flex items-center justify-between px-3 py-2 bg-white rounded border border-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="text-xs text-slate-700">Pages Scanned</span>
                      </div>
                      <span className="font-bold text-slate-800">{result.pagesScanned}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PDF Button */}
              <div className="flex justify-center gap-3 mb-8">
                <button
                  onClick={() => isPro ? generatePDF(result) : handleCheckout()}
                  className={`flex items-center gap-3 px-6 py-3 rounded-lg transition font-semibold text-sm ${isPro ? 'bg-slate-800 text-white hover:bg-slate-900' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'}`}
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
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
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
                  <h4 className="text-sm font-semibold text-blue-900 mb-3">Checks Passed</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {result.issues.https && <span className="flex items-center gap-2 text-xs text-blue-900"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>HTTPS Enabled</span>}
                    {result.issues.privacyPolicy && <span className="flex items-center gap-2 text-xs text-blue-900"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Privacy Policy</span>}
                    {result.issues.cookiePolicy && <span className="flex items-center gap-2 text-xs text-blue-900"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Cookie Policy</span>}
                    {result.issues.consentBanner && <span className="flex items-center gap-2 text-xs text-blue-900"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Cookie Consent</span>}
                    {result.issues.legalMentions && <span className="flex items-center gap-2 text-xs text-blue-900"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Legal Mentions</span>}
                    {result.issues.dpoContact && <span className="flex items-center gap-2 text-xs text-blue-900"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>DPO Contact</span>}
                    {result.issues.dataDeleteLink && <span className="flex items-center gap-2 text-xs text-blue-900"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Data Deletion</span>}
                    {result.issues.optOutMechanism && <span className="flex items-center gap-2 text-xs text-blue-900"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Opt-out Option</span>}
                    {result.issues.secureforms && <span className="flex items-center gap-2 text-xs text-blue-900"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Secure Forms</span>}
                    {result.issues.ssl?.valid && <span className="flex items-center gap-2 text-xs text-blue-900"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>SSL Certificate</span>}
                    {result.issues.emailSecurity?.spf && <span className="flex items-center gap-2 text-xs text-blue-900"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>SPF Record</span>}
                    {result.issues.emailSecurity?.dmarc && <span className="flex items-center gap-2 text-xs text-blue-900"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>DMARC Record</span>}
                  </div>
                </div>
              )}

              {/* Key Issues Summary */}
              {Object.values(result.issues).filter(v => !v).length > 0 && (
                <div className="mb-6 p-4 rounded-lg border border-slate-300">
                  <h4 className="text-sm font-semibold text-red-600 mb-3">Issues Found</h4>
                  <div className="flex flex-wrap gap-2">
                    {!result.issues.consentBanner && <span className="px-2 py-1 text-xs text-red-600">Cookie Consent Banner</span>}
                    {!result.issues.cookiePolicy && <span className="px-2 py-1 text-xs text-red-600">Cookie Policy</span>}
                    {!result.issues.dpoContact && <span className="px-2 py-1 text-xs text-red-600">DPO Contact</span>}
                    {!result.issues.secureforms && <span className="px-2 py-1 text-xs text-red-600">Secure Forms</span>}
                    {!result.issues.privacyPolicy && <span className="px-2 py-1 text-xs text-red-600">Privacy Policy</span>}
                    {result.issues.cookies.undeclared > 0 && <span className="px-2 py-1 text-xs text-red-600">Undeclared Cookies ({result.issues.cookies.undeclared})</span>}
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
                          <span className={`text-sm ${item.passed ? 'text-emerald-700' : 'text-slate-600'}`}>
                            {item.passed ? '✓' : '✗'} {item.item}
                          </span>
                          <span className={`text-sm font-semibold ${item.passed ? 'text-emerald-600' : 'text-slate-500'}`}>
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
                <div className="mb-6">
                  <button
                    onClick={() => setShowRiskAssessment(!showRiskAssessment)}
                    className="w-full flex items-center justify-between text-lg font-semibold text-slate-800 mb-3 hover:text-slate-600 transition"
                  >
                    <span>Risk Assessment - GDPR Fine Estimation</span>
                    <svg className={`w-5 h-5 text-slate-500 transition-transform ${showRiskAssessment ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                'text-green-700'
                            }`}>
                            €{result.riskPrediction.minFine >= 1000 ? (result.riskPrediction.minFine / 1000).toFixed(0) + 'k' : result.riskPrediction.minFine}
                            {' - '}
                            €{result.riskPrediction.maxFine >= 1000000 ? (result.riskPrediction.maxFine / 1000000).toFixed(1) + 'M' : result.riskPrediction.maxFine >= 1000 ? (result.riskPrediction.maxFine / 1000).toFixed(0) + 'k' : result.riskPrediction.maxFine}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-500 mb-1">Risk Level</p>
                          <span className={`inline-block px-4 py-2 rounded-full text-lg font-bold ${result.riskPrediction.riskLevel === 'critical' ? 'text-red-600' :
                            result.riskPrediction.riskLevel === 'high' ? 'text-orange-600' :
                              result.riskPrediction.riskLevel === 'medium' ? 'text-yellow-700' :
                                'text-green-600'
                            }`}>
                            {result.riskPrediction.riskLevel.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-500 mb-1">Enforcement Probability</p>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full"
                                style={{
                                  width: `${result.riskPrediction.probability}%`,
                                  backgroundColor: result.riskPrediction.probability >= 70 ? '#dc2626' : result.riskPrediction.probability >= 40 ? '#FFD700' : '#16a34a'
                                }}
                              ></div>
                            </div>
                            <span style={{ color: result.riskPrediction.probability >= 70 ? '#dc2626' : result.riskPrediction.probability >= 40 ? '#FFD700' : '#16a34a' }} className="text-lg font-bold">{result.riskPrediction.probability}%</span>
                          </div>
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
                                  <span className={`w-2 h-2 rounded-full ${factor.severity === 'critical' ? 'bg-red-500' :
                                    factor.severity === 'high' ? 'bg-orange-500' :
                                      factor.severity === 'medium' ? 'bg-yellow-500' :
                                        'bg-green-500'
                                    }`}></span>
                                  <div>
                                    <p className="font-medium text-gray-800">{factor.issue}</p>
                                    {factor.gdprArticle && (
                                      <p className="text-xs text-gray-500">GDPR {factor.gdprArticle}</p>
                                    )}
                                  </div>
                                </div>
                                <span className="text-red-600 font-semibold">
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
                <div className="mb-6">
                  <button
                    onClick={() => setShowComplianceDrift(!showComplianceDrift)}
                    className="w-full flex items-center justify-between text-lg font-semibold text-slate-800 mb-3 hover:text-slate-600 transition"
                  >
                    <span>Compliance Drift Detection</span>
                    <svg className={`w-5 h-5 text-slate-500 transition-transform ${showComplianceDrift ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showComplianceDrift && (
                    <div className="rounded-lg p-5 border border-slate-200 bg-white">
                      {/* Header with trend */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${driftReport.overallTrend === 'improving' ? 'bg-emerald-100' : driftReport.overallTrend === 'declining' ? 'bg-slate-200' : 'bg-slate-100'}`}>
                            <svg className={`w-5 h-5 ${driftReport.overallTrend === 'improving' ? 'text-emerald-600' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          <div className={`px-3 py-1.5 rounded ${driftReport.scoreDelta > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
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
                            change.impact === 'positive' ? 'border-green-500' :
                              'border-gray-300'
                            }`}>
                            <div className="flex items-center gap-3">
                              <span className="text-xl">
                                {change.impact === 'positive' ? '✅' : change.impact === 'negative' ? '❌' : '➖'}
                              </span>
                              <div>
                                <p className="font-medium text-gray-800">{change.field}</p>
                                <p className="text-sm text-gray-500">{change.description}</p>
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${change.type === 'improvement' ? 'bg-green-100 text-green-700' :
                              change.type === 'regression' ? 'bg-red-100 text-red-700' :
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
                <div className="mb-6">
                  <button
                    onClick={() => setShowSecurityExposure(!showSecurityExposure)}
                    className="w-full flex items-center justify-between text-lg font-semibold text-slate-800 mb-3 hover:text-slate-600 transition"
                  >
                    <span>Security Exposure Analysis</span>
                    <svg className={`w-5 h-5 text-slate-500 transition-transform ${showSecurityExposure ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                              'text-green-600'
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
                                    <code className="text-xs bg-slate-100 px-2 py-1 rounded mt-1 block text-slate-600 break-all">
                                      {finding.details}
                                    </code>
                                  )}
                                </div>
                              </div>
                              <span className="text-xs px-2 py-0.5 rounded flex-shrink-0 bg-slate-100 text-slate-600">
                                {finding.type.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-2 bg-slate-100 p-2 rounded">
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

              {/* Security Checks */}
              {(result.issues.ssl || result.issues.securityHeaders || result.issues.emailSecurity) && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowSecurityChecks(!showSecurityChecks)}
                    className="w-full flex items-center justify-between text-lg font-semibold text-slate-800 mb-3 hover:text-slate-600 transition"
                  >
                    <span>Security Checks</span>
                    <svg className={`w-5 h-5 text-slate-500 transition-transform ${showSecurityChecks ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showSecurityChecks && (
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* SSL/TLS */}
                      {result.issues.ssl && (
                        <div className="bg-white rounded-lg p-4 border border-slate-200">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                            <h4 className="font-semibold text-gray-900">SSL/TLS</h4>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">HTTPS</span>
                              <span className={result.issues.ssl.valid ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                {result.issues.ssl.valid ? '✓ Enabled' : '✗ Missing'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">HSTS</span>
                              <span className={result.issues.ssl.hsts ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                {result.issues.ssl.hsts ? '✓ Enabled' : '✗ Missing'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Email Security */}
                      {result.issues.emailSecurity && (
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <h4 className="font-semibold text-gray-900">Email Security</h4>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">SPF Record</span>
                              <span className={result.issues.emailSecurity.spf ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                {result.issues.emailSecurity.spf ? '✓ Found' : '✗ Missing'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">DMARC</span>
                              <span className={result.issues.emailSecurity.dmarc ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                {result.issues.emailSecurity.dmarc ? '✓ Found' : '✗ Missing'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Security Headers */}
                      {result.issues.securityHeaders && (
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                            </div>
                            <h4 className="font-semibold text-gray-900">Security Headers</h4>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">CSP</span>
                              <span className={result.issues.securityHeaders.csp ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                {result.issues.securityHeaders.csp ? '✓' : '✗ Missing'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">X-Frame-Options</span>
                              <span className={result.issues.securityHeaders.xFrameOptions ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                {result.issues.securityHeaders.xFrameOptions ? '✓' : '✗ Missing'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">X-Content-Type</span>
                              <span className={result.issues.securityHeaders.xContentType ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                {result.issues.securityHeaders.xContentType ? '✓' : '✗ Missing'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Referrer-Policy</span>
                              <span className={result.issues.securityHeaders.referrerPolicy ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                {result.issues.securityHeaders.referrerPolicy ? '✓' : '✗ Missing'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

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
                        <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
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
                        {result.issues.exposedEmails.map((email, i) => (
                          <span key={i} className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-700 text-xs font-mono">
                            {email}
                          </span>
                        ))}
                      </div>
                      <p className="mt-3 text-slate-500 text-xs">
                        <strong>Recommendation:</strong> Use contact forms or obfuscate emails to prevent harvesting.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* External Resources */}
              {result.issues.externalResources &&
                (result.issues.externalResources.scripts.length > 0 ||
                  result.issues.externalResources.fonts.length > 0 ||
                  result.issues.externalResources.iframes.length > 0) && (
                  <div className="mb-6">
                    <button
                      onClick={() => setShowExternalResources(!showExternalResources)}
                      className="w-full flex items-center justify-between text-lg font-semibold text-slate-800 mb-3 hover:text-slate-600 transition"
                    >
                      <span>External Resources</span>
                      <svg className={`w-5 h-5 text-slate-500 transition-transform ${showExternalResources ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showExternalResources && (
                      <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <p className="text-slate-600 text-xs mb-4">
                          Third-party resources may track visitors and impact performance.
                        </p>

                        {/* Scripts */}
                        {result.issues.externalResources.scripts.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium text-slate-700 text-sm mb-2 flex items-center gap-2">
                              <span className="px-1.5 py-0.5 bg-slate-200 rounded text-xs">{result.issues.externalResources.scripts.length}</span>
                              External Scripts
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {[...new Set(result.issues.externalResources.scripts.map(s => s.provider))].map((provider, i) => (
                                <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-700 text-sm">
                                  {provider}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Fonts */}
                        {result.issues.externalResources.fonts.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                              <span className="px-2 py-1 bg-orange-200 rounded text-xs">{result.issues.externalResources.fonts.length}</span>
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

                        {/* Iframes */}
                        {result.issues.externalResources.iframes.length > 0 && (
                          <div>
                            <h4 className="font-medium text-slate-700 text-sm mb-2 flex items-center gap-2">
                              <span className="px-1.5 py-0.5 bg-slate-200 rounded text-xs">{result.issues.externalResources.iframes.length}</span>
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
                      </div>
                    )}
                  </div>
                )}

              {/* Social Trackers */}
              {result.issues.socialTrackers && result.issues.socialTrackers.length > 0 && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowSocialTrackers(!showSocialTrackers)}
                    className="w-full flex items-center justify-between text-lg font-semibold text-slate-800 mb-3 hover:text-slate-600 transition"
                  >
                    <span>Social & Ad Trackers</span>
                    <svg className={`w-5 h-5 text-slate-500 transition-transform ${showSocialTrackers ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showSocialTrackers && (
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                      <p className="text-slate-600 text-xs mb-4">
                        These trackers collect user data and may require explicit consent under GDPR.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.issues.socialTrackers.map((tracker, i) => (
                          <span
                            key={i}
                            className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-2 ${tracker.risk === 'high'
                              ? 'bg-slate-800 text-white'
                              : tracker.risk === 'medium'
                                ? 'bg-white0 text-white'
                                : 'bg-slate-200 text-slate-700'
                              }`}
                          >
                            {tracker.name}
                          </span>
                        ))}
                      </div>
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
                                'border-green-300'
                            }`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold text-white ${vendor.riskScore >= 8 ? 'bg-red-500' :
                                  vendor.riskScore >= 6 ? 'bg-orange-500' :
                                    vendor.riskScore >= 4 ? 'bg-yellow-500' :
                                      'bg-green-500'
                                  }`}>
                                  {vendor.riskScore}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{vendor.name}</h4>
                                  <p className="text-xs text-gray-500 capitalize">{vendor.category} • {vendor.jurisdiction}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${vendor.riskLevel === 'critical' ? 'bg-red-100 text-red-700' :
                                  vendor.riskLevel === 'high' ? 'bg-orange-100 text-orange-700' :
                                    vendor.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-green-100 text-green-700'
                                  }`}>
                                  {vendor.riskLevel.toUpperCase()}
                                </span>
                                {vendor.gdprCompliant ? (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">GDPR ✓</span>
                                ) : (
                                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">GDPR ✗</span>
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
                              Data transfer: <span className={`font-medium ${vendor.dataTransfer === 'EU' ? 'text-green-600' : vendor.dataTransfer === 'CN' ? 'text-red-600' : 'text-orange-600'}`}>
                                {vendor.dataTransfer === 'EU' ? '🇪🇺 EU (adequate)' : vendor.dataTransfer === 'US' ? '🇺🇸 USA' : vendor.dataTransfer === 'CN' ? '🇨🇳 China' : '🌍 Other'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500"></span> 8-10: Critical</span>
                          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500"></span> 6-7: High</span>
                          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500"></span> 4-5: Medium</span>
                          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500"></span> 1-3: Low</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Data Breaches */}
              {result.issues.dataBreaches && result.issues.dataBreaches.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">⚠️ Data Breaches Detected</h3>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-700 text-sm mb-4">
                      This domain has been involved in known data breaches. Users should be informed and passwords changed.
                    </p>
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
                  </div>
                </div>
              )}

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
                  <div className="bg-white rounded-xl p-4 overflow-x-auto">
                    {/* Category Legend */}
                    <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b border-gray-200">
                      <span className="text-xs text-gray-500 font-medium">Categories:</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-700">necessary</span>
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
                            <td className="py-2 pr-4 font-mono text-gray-900">{cookie.name}</td>
                            <td className="py-2 pr-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(cookie.category)}`}>
                                {cookie.category}
                              </span>
                            </td>
                            <td className="py-2 pr-4 text-gray-600">{cookie.provider}</td>
                            <td className="py-2 text-gray-600">{cookie.description}</td>
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
                  <div className="bg-white rounded-xl p-4 space-y-3">
                    {result.pages.map((page, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                        <div className="truncate flex-1 mr-4">
                          <p className="font-medium text-gray-900 truncate">{page.title}</p>
                          <p className="text-sm text-gray-500 truncate">{page.url}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {page.cookiesFound} cookies
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
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
                        {result.issues.trackers.map((tracker, i) => (
                          <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-700 text-sm font-medium">
                            {tracker}
                          </span>
                        ))}
                      </div>
                      <p className="text-slate-500 text-xs">
                        Tip: Use our Cookie Banner to block these trackers until user consent is given.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* CTA */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-center">
                <h4 className="text-xl font-bold text-white mb-2">Get the Full Audit Report</h4>
                <p className="text-blue-100 mb-4">Detailed recommendations, PDF export, and continuous monitoring</p>
                <button onClick={() => handleCheckout()} className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition">
                  Start Free 7-Day Trial
                </button>
              </div>
            </div>
          )}
        </div>

        {/* How It Works */}
        <section className="py-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">How it works</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">A complete privacy audit of your website in under 60 seconds</p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-8 bg-white rounded-2xl border border-gray-100">
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
            <div className="p-8 bg-white rounded-2xl border border-gray-100">
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
            <div className="p-8 bg-white rounded-2xl border border-gray-100">
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
            <div className="p-8 bg-white rounded-2xl border border-gray-100 flex flex-col">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Free</h3>
              <p className="text-4xl font-bold text-gray-900 mb-6">€0</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Full compliance audit
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Privacy score
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Issues detected
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <a href="/signup" className="block w-full py-3 border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition font-semibold text-center mt-auto">
                Start Free Audit
              </a>
            </div>

            <div className="p-8 bg-gradient-to-b from-blue-600 to-blue-700 rounded-2xl border border-blue-400 relative shadow-xl flex flex-col">
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
              <button onClick={() => handleCheckout()} className="block w-full py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition text-center mt-auto">
                Start 7-Day Free Trial
              </button>
            </div>

            {/* Pro+ */}
            <div className="p-8 bg-gradient-to-b from-cyan-500 to-teal-600 rounded-2xl border border-cyan-400 relative shadow-xl flex flex-col">
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
              <button onClick={() => handleCheckout('pro_plus')} className="block w-full py-3 bg-white text-teal-600 font-semibold rounded-xl hover:bg-teal-50 transition text-center mt-auto">
                Start 7-Day Free Trial
              </button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What does PrivacyChecker scan?</h3>
              <p className="text-gray-600">We check 14+ compliance criteria including HTTPS, cookie consent banner, privacy policy, legal mentions, DPO contact, data deletion options, secure forms, and security headers. Plus: third-party vendor risk scores (80+ trackers), exposed files (.git, .env, backups), DNS security (SPF/DMARC), and AI-powered GDPR fine estimation.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Is the audit really free?</h3>
              <p className="text-gray-600">Yes! The full audit is 100% free. You'll see your privacy score and all issues detected. Pro unlocks step-by-step recommendations on how to fix each issue, plus PDF reports and email alerts.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How long does a scan take?</h3>
              <p className="text-gray-600">Usually 30-60 seconds depending on your website size. We analyze your pages in real-time to give you accurate results.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What regulations do you check?</h3>
              <p className="text-gray-600">We check compliance against GDPR (Europe), CCPA (California), LGPD (Brazil), and 50+ other global privacy regulations. Your results show which laws apply to your site based on its content.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What&apos;s included in Pro and Pro+?</h3>
              <p className="text-gray-600">Pro includes step-by-step fix recommendations, PDF reports, email alerts, monthly auto-scans, Cookie Banner Widget (geo-targeting 8 privacy laws), and Google Consent Mode v2. Pro+ adds: weekly scans, AI Risk Predictor (€ fine estimation), Vendor Risk Scores, Attack Surface Scanner (.git, .env, S3 exposed), DNS Security checks (SPF/DKIM/DMARC), and Compliance Drift Detection.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What is the Cookie Banner Widget?</h3>
              <p className="text-gray-600">It&apos;s a customizable cookie consent banner you can embed on your site with one line of code. It handles consent for Analytics, Marketing, and Functional cookies, and integrates with Google Consent Mode v2 to ensure your Google Analytics and Ads respect user choices.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I cancel my subscription anytime?</h3>
              <p className="text-gray-600">Yes, you can cancel at any time from your Dashboard or by emailing support@privacychecker.pro. Your access continues until the end of your billing period. There are no cancellation fees.</p>
            </div>
          </div>
        </section>

        {/* Regulations Covered */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">Regulations We Check</h2>
            <p className="text-gray-600 text-center mb-2">Comprehensive coverage for global privacy compliance</p>
            <div className="flex justify-center overflow-hidden" style={{ maxHeight: '120px' }}>
              <img
                src="/badges.png"
                alt="GDPR, CCPA, LGPD, PIPEDA, UK GDPR and 50+ more regulations"
                className="object-cover h-[280px] sm:h-[360px] -my-[80px] sm:-my-[108px]"
                style={{
                  filter: 'brightness(1.08) contrast(1.1)'
                }}
              />
            </div>
          </div>
        </section>
      </main >

      {/* Footer */}
      < footer className="border-t border-gray-200 py-12 bg-white" >
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-1">
              <img src="/logo.png" alt="PrivacyChecker" className="w-10 h-10 scale-150" />
              <span className="text-xl font-bold text-gray-900">PrivacyChecker</span>
            </div>
            <div className="flex gap-6 text-gray-600">
              <Link href="/privacy" className="hover:text-gray-900 transition">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-900 transition">Terms of Service</Link>
              <a href="mailto:support@privacychecker.pro" className="hover:text-gray-900 transition">Contact</a>
            </div>
            <p className="text-gray-500 text-sm">© 2026 PrivacyChecker. All rights reserved.</p>
          </div>
          <p className="text-gray-400 text-xs text-center mt-6 max-w-3xl mx-auto">
            Content available on PrivacyChecker.pro is intended for general information purposes only — it is not legal advice.
            Reports generated using our Service are generated automatically and do not constitute legal advice.
            We encourage you to consult with a lawyer licensed in your jurisdiction before taking actions based on our reports.
          </p>
        </div>
      </footer >
    </div >
  );
}
