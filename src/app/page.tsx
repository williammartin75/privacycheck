'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { recommendations } from '@/lib/recommendations';
import { generatePDF } from '@/lib/pdf-generator';
import { detectComplianceDrift, DriftReport } from '@/lib/drift-detection';
import { LanguageSelector } from '@/components/LanguageSelector';
import { MaskedText, MaskedEmail } from '@/components/ProGate';
import { UpgradeCTA } from '@/components/UpgradeCTA';
import { Cookie, PageScan, AuditResult } from '@/types/audit';
import { getScoreColor, getScoreLabel, getCategoryColor } from '@/lib/score-utils';
import { FAQSection } from '@/components/landing/FAQSection';
import { PricingCards } from '@/components/landing/PricingCards';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { RegulationsBadges } from '@/components/landing/RegulationsBadges';
import { ScanForm } from '@/components/landing/ScanForm';
import { ScanProgress } from '@/components/landing/ScanProgress';
import { ReportHeader } from '@/components/report/ReportHeader';
import { PassedChecks } from '@/components/report/PassedChecks';
import { IssuesFound } from '@/components/report/IssuesFound';
import { ScoreBreakdown } from '@/components/report/ScoreBreakdown';
import { RiskAssessment } from '@/components/report/RiskAssessment';
import { ComplianceDrift } from '@/components/report/ComplianceDrift';
import { SecurityExposure } from '@/components/report/SecurityExposure';
import { ConsentBehavior } from '@/components/report/ConsentBehavior';
import { PolicyAnalysis } from '@/components/report/PolicyAnalysis';
import { DarkPatterns } from '@/components/report/DarkPatterns';
import { OptInForms } from '@/components/report/OptInForms';
import { CookieLifespan } from '@/components/report/CookieLifespan';
import { Fingerprinting } from '@/components/report/Fingerprinting';
import { SecurityInfra } from '@/components/report/SecurityInfra';
import { StorageAudit } from '@/components/report/StorageAudit';
import { MixedContent } from '@/components/report/MixedContent';
import { FormSecurity } from '@/components/report/FormSecurity';
import { ThirdPartyScripts } from '@/components/report/ThirdPartyScripts';
import { VendorRisk } from '@/components/report/VendorRisk';
import { EmailExposure } from '@/components/report/EmailExposure';
import { DataTransfers } from '@/components/report/DataTransfers';
import { DataBreaches } from '@/components/report/DataBreaches';
import { CookieList } from '@/components/report/CookieList';
import { PagesScanned } from '@/components/report/PagesScanned';
import { TrackersList } from '@/components/report/TrackersList';
import { ReportSection } from '@/components/report/ReportSection';
import { AccessibilityAudit } from '@/components/report/AccessibilityAudit';
import { DomainRisk } from '@/components/report/DomainRisk';
import { SupplyChainAudit } from '@/components/report/SupplyChainAudit';
import { HiddenCostsAudit } from '@/components/report/HiddenCostsAudit';
import { EmailDeliverabilityAudit } from '@/components/report/EmailDeliverabilityAudit';
import { AIUsageAudit } from '@/components/report/AIUsageAudit';
import { TechnologyStack } from '@/components/report/TechnologyStack';

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
  const [scanCountInfo, setScanCountInfo] = useState<{ count: number; limit: number; remaining: number; atLimit: boolean } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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
          if (tierData.tier && tierData.tier !== 'free') {
            setTier(tierData.tier);
          }
          // Fetch scan count after getting tier
          const scanCountRes = await fetch('/api/scan-count');
          const scanCountData = await scanCountRes.json();
          setScanCountInfo(scanCountData);
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
      // Start audit request
      abortControllerRef.current = new AbortController();
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl, tier }),
        signal: abortControllerRef.current.signal,
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
      abortControllerRef.current = null;
    }
  };

  const handleCancelScan = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
      setError('Scan cancelled.');
      setScanProgress({ current: 0, total: 20, status: '' });
      abortControllerRef.current = null;
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
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <span className="text-sm sm:text-2xl font-bold text-gray-900 notranslate">PrivacyChecker</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <a href="#pricing" className="hidden sm:block text-sm sm:text-base text-gray-600 hover:text-gray-900 transition">Pricing</a>
            <a href="#faq" className="hidden sm:block text-sm sm:text-base text-gray-600 hover:text-gray-900 transition">FAQ</a>
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
              <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition w-[70px] sm:w-auto text-center text-xs sm:text-base truncate">
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
          <ScanForm
            url={url}
            onUrlChange={setUrl}
            onSubmit={handleAudit}
            loading={loading}
            onCancel={handleCancelScan}
            atLimit={!isPro && scanCountInfo?.atLimit}
            scansRemaining={!isPro ? scanCountInfo?.remaining : undefined}
            onUpgrade={() => handleCheckout()}
          />

          {/* Progress Bar */}
          {loading && (
            <ScanProgress
              current={scanProgress.current}
              total={scanProgress.total}
              status={scanProgress.status}
              tier={isProPlus ? 'pro_plus' : isPro ? 'pro' : 'free'}
            />
          )}

          {error && (
            <div className="max-w-2xl mx-auto mb-8 p-4 text-red-600 text-center">
              {error}
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-lg p-8 shadow-sm text-left">
              {/* Report Header */}
              <ReportHeader
                domain={result.domain}
                score={result.score}
                regulations={result.regulations || []}
                pagesScanned={result.pagesScanned}
                issuesCount={result.scoreBreakdown?.filter(b => !b.passed).length || 0}
                passedCount={result.scoreBreakdown?.filter(b => b.passed).length || 0}
              />

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

                {/* Schedule Button */}
                {isPro ? (
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
                ) : (
                  <button
                    onClick={() => handleCheckout()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-slate-100 text-slate-400 border border-slate-200 cursor-pointer hover:bg-slate-50 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Schedule Scans
                    <span className="text-xs px-1.5 py-0.5 bg-white text-blue-700 border border-blue-300 rounded">Pro</span>
                  </button>
                )}
              </div>

              {/* Passed Checks List */}
              <PassedChecks scoreBreakdown={result.scoreBreakdown} />

              {/* Issues Found */}
              {result.scoreBreakdown && (
                <IssuesFound issues={result.scoreBreakdown} />
              )}

              {/* Score Breakdown */}
              {result.scoreBreakdown && result.scoreBreakdown.length > 0 && (
                <ScoreBreakdown breakdown={result.scoreBreakdown} finalScore={result.score} />
              )}

              {/* Calculate category scores */}
              {(() => {
                // Compliance Score: based on 9 compliance checks
                const complianceChecks = [
                  result.issues.https,
                  result.issues.consentBanner,
                  result.issues.privacyPolicy,
                  result.issues.cookiePolicy,
                  result.issues.legalMentions,
                  result.issues.dpoContact,
                  result.issues.dataDeleteLink,
                  result.issues.optOutMechanism,
                  result.issues.secureforms
                ];
                const complianceScore = Math.round((complianceChecks.filter(Boolean).length / 9) * 100);

                // Consent & Privacy Score: average of available sub-scores
                const consentScores: number[] = [];
                if (result.issues.consentBehavior?.score) consentScores.push(result.issues.consentBehavior.score);
                if (result.issues.policyAnalysis?.overallScore) consentScores.push(result.issues.policyAnalysis.overallScore);
                if (result.issues.darkPatterns?.score) consentScores.push(result.issues.darkPatterns.score);
                if (result.issues.optInForms?.score) consentScores.push(result.issues.optInForms.score);
                const consentScore = consentScores.length > 0
                  ? Math.round(consentScores.reduce((a, b) => a + b, 0) / consentScores.length)
                  : undefined;

                // Cookies & Tracking Score: based on undeclared cookies and trackers
                const totalCookies = result.issues.cookies.count || 1;
                const undeclared = result.issues.cookies.undeclared || 0;
                const trackerPenalty = Math.min(result.issues.trackers.length * 5, 30);
                const cookieScore = Math.max(0, Math.round(100 - (undeclared / totalCookies * 50) - trackerPenalty));

                // Vendors & Data Flow Score: based on vendor risks
                let vendorsScore: number | undefined;
                if (result.issues.vendorRisks && result.issues.vendorRisks.length > 0) {
                  const highRiskCount = result.issues.vendorRisks.filter((v: { riskLevel: string }) => v.riskLevel === 'high' || v.riskLevel === 'critical').length;
                  const mediumRiskCount = result.issues.vendorRisks.filter((v: { riskLevel: string }) => v.riskLevel === 'medium').length;
                  vendorsScore = Math.max(0, Math.round(100 - (highRiskCount * 15) - (mediumRiskCount * 5)));
                }

                // Security Score: average of security-related scores
                const securityScores: number[] = [];
                if (result.issues.securityHeadersExtended?.score) securityScores.push(result.issues.securityHeadersExtended.score);
                if (result.issues.fingerprinting?.score) securityScores.push(result.issues.fingerprinting.score);
                if (result.issues.formSecurity?.score) securityScores.push(result.issues.formSecurity.score);
                if (result.issues.mixedContent?.detected === false) securityScores.push(100);
                else if (result.issues.mixedContent?.detected) securityScores.push(0);
                const securityScore = securityScores.length > 0
                  ? Math.round(securityScores.reduce((a, b) => a + b, 0) / securityScores.length)
                  : undefined;

                return (
                  <>
                    {/* ========== TIER 1: LEGAL RISKS ========== */}

                    {/* Compliance */}
                    <ReportSection title="Compliance" defaultOpen={true} score={complianceScore}>
                      {/* Risk Assessment */}
                      {result.riskPrediction && (
                        <RiskAssessment
                          riskPrediction={result.riskPrediction}
                          isOpen={showRiskAssessment}
                          onToggle={() => setShowRiskAssessment(!showRiskAssessment)}
                          isPro={isPro}
                          onUpgrade={() => handleCheckout()}
                        />
                      )}

                      {/* Compliance Checklist */}
                      <div className="mb-4">
                        <button onClick={() => setShowComplianceChecklist(!showComplianceChecklist)} className="section-btn">
                          <span className="flex items-center gap-2">
                            <span className="section-btn-title">Compliance Checklist</span>
                            <span className={
                              !result.issues.consentBanner || !result.issues.privacyPolicy || !result.issues.legalMentions
                                ? 'badge-failed'
                                : 'badge-passed'
                            }>
                              {[
                                result.issues.https,
                                result.issues.consentBanner,
                                result.issues.privacyPolicy,
                                result.issues.cookiePolicy,
                                result.issues.legalMentions,
                                result.issues.dpoContact,
                                result.issues.dataDeleteLink,
                                result.issues.optOutMechanism,
                                result.issues.secureforms
                              ].filter(Boolean).length}/9
                            </span>
                          </span>
                          <svg className={`w-5 h-5 text-slate-400 transition-transform ${showComplianceChecklist ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {showComplianceChecklist && (
                          <>
                            <p className="text-xs text-slate-500 mb-4 mt-3">
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

                      {/* Compliance Drift Detection */}
                      {driftReport && driftReport.hasChanges && (
                        <ComplianceDrift
                          driftReport={driftReport}
                          isOpen={showComplianceDrift}
                          onToggle={() => setShowComplianceDrift(!showComplianceDrift)}
                        />
                      )}
                    </ReportSection>

                    {/* Consent & Privacy */}
                    <ReportSection title="Consent & Privacy" defaultOpen={false} score={consentScore}>
                      {/* Consent Behavior Test */}
                      {result.issues.consentBehavior && (
                        <ConsentBehavior
                          consentBehavior={result.issues.consentBehavior}
                          isOpen={showConsentBehavior}
                          onToggle={() => setShowConsentBehavior(!showConsentBehavior)}
                          isPro={isPro}
                          expandedRec={expandedRec}
                          setExpandedRec={setExpandedRec}
                          recommendations={recommendations}
                          onUpgrade={() => handleCheckout()}
                        />
                      )}

                      {/* Privacy Policy AI Analysis */}
                      {result.issues.policyAnalysis && (
                        <PolicyAnalysis
                          policyAnalysis={result.issues.policyAnalysis}
                          isOpen={showPolicyAnalysis}
                          onToggle={() => setShowPolicyAnalysis(!showPolicyAnalysis)}
                          isPro={isPro}
                          onUpgrade={() => handleCheckout()}
                        />
                      )}

                      {/* Dark Patterns Detection */}
                      {result.issues.darkPatterns && (
                        <DarkPatterns
                          darkPatterns={result.issues.darkPatterns}
                          isOpen={showDarkPatterns}
                          onToggle={() => setShowDarkPatterns(!showDarkPatterns)}
                          isPro={isPro}
                          onUpgrade={() => handleCheckout()}
                        />
                      )}

                      {/* Opt-in Forms Analysis */}
                      {result.issues.optInForms && (
                        <OptInForms
                          optInForms={result.issues.optInForms}
                          isOpen={showOptInForms}
                          onToggle={() => setShowOptInForms(!showOptInForms)}
                          isPro={isPro}
                          onUpgrade={() => handleCheckout()}
                        />
                      )}
                    </ReportSection>

                    {/* Cookies & Tracking */}
                    <ReportSection title="Cookies & Tracking" defaultOpen={false} score={cookieScore}>
                      {/* Cookies Section */}
                      <CookieList
                        cookies={result.issues.cookies}
                        isOpen={showCookies}
                        onToggle={() => setShowCookies(!showCookies)}
                        isPro={isPro}
                      />

                      {/* Cookie Lifespan Analysis */}
                      {result.issues.cookieLifespan && (
                        <CookieLifespan
                          cookieLifespan={result.issues.cookieLifespan}
                          isOpen={showCookieLifespan}
                          onToggle={() => setShowCookieLifespan(!showCookieLifespan)}
                          isPro={isPro}
                        />
                      )}

                      {/* Third-Party Scripts & Tracking */}
                      <ThirdPartyScripts
                        externalResources={result.issues.externalResources}
                        socialTrackers={result.issues.socialTrackers}
                        isOpen={showExternalResources}
                        onToggle={() => setShowExternalResources(!showExternalResources)}
                        isPro={isPro}
                        onUpgrade={() => handleCheckout()}
                      />

                      {/* Trackers */}
                      <TrackersList
                        trackers={result.issues.trackers}
                        isOpen={showTrackers}
                        onToggle={() => setShowTrackers(!showTrackers)}
                        isPro={isPro}
                        onUpgrade={() => handleCheckout()}
                      />
                    </ReportSection>

                    {/* Accessibility (EAA 2025) */}
                    <ReportSection
                      title="Accessibility (EAA 2025)"
                      defaultOpen={false}
                      score={result.issues.accessibility?.score}
                    >
                      <AccessibilityAudit
                        accessibility={result.issues.accessibility}
                        isPro={isProPlus}
                      />
                    </ReportSection>

                    {/* ========== TIER 2: SECURITY RISKS ========== */}

                    {/* Security */}
                    <ReportSection title="Security" defaultOpen={false} score={securityScore}>
                      {/* Security Exposure Analysis */}
                      {result.attackSurface && result.attackSurface.totalFindings > 0 && (
                        <SecurityExposure
                          attackSurface={result.attackSurface}
                          isOpen={showSecurityExposure}
                          onToggle={() => setShowSecurityExposure(!showSecurityExposure)}
                          isPro={isPro}
                        />
                      )}

                      {/* Security & Infrastructure */}
                      {result.issues.securityHeadersExtended && (
                        <SecurityInfra
                          securityHeaders={result.issues.securityHeadersExtended}
                          ssl={result.issues.ssl}
                          emailSecurity={result.issues.emailSecurity}
                          isOpen={showSecurityHeadersExt}
                          onToggle={() => setShowSecurityHeadersExt(!showSecurityHeadersExt)}
                          isPro={isPro}
                          onUpgrade={() => handleCheckout()}
                        />
                      )}

                      {/* Fingerprinting Detection */}
                      {result.issues.fingerprinting && (
                        <Fingerprinting
                          fingerprinting={result.issues.fingerprinting}
                          isOpen={showFingerprinting}
                          onToggle={() => setShowFingerprinting(!showFingerprinting)}
                          isPro={isPro}
                        />
                      )}

                      {/* Storage Audit */}
                      {result.issues.storageAudit && (
                        <StorageAudit
                          storageAudit={result.issues.storageAudit}
                          isOpen={showStorageAudit}
                          onToggle={() => setShowStorageAudit(!showStorageAudit)}
                          isPro={isPro}
                        />
                      )}

                      {/* Mixed Content */}
                      {result.issues.mixedContent && (
                        <MixedContent
                          mixedContent={result.issues.mixedContent}
                          isOpen={showMixedContent}
                          onToggle={() => setShowMixedContent(!showMixedContent)}
                          isPro={isPro}
                        />
                      )}

                      {/* Form Security */}
                      {result.issues.formSecurity && (
                        <FormSecurity
                          formSecurity={result.issues.formSecurity}
                          isOpen={showFormSecurity}
                          onToggle={() => setShowFormSecurity(!showFormSecurity)}
                          isPro={isPro}
                        />
                      )}
                    </ReportSection>

                    {/* Supply Chain Security */}
                    <ReportSection
                      title="Supply Chain Security"
                      defaultOpen={false}
                      score={result.issues.supplyChain?.score}
                    >
                      <SupplyChainAudit
                        supplyChain={result.issues.supplyChain}
                        isPro={isProPlus}
                      />
                    </ReportSection>

                    {/* Domain Security */}
                    <ReportSection
                      title="Domain Security"
                      defaultOpen={false}
                      score={result.issues.domainRisk?.score}
                    >
                      <DomainRisk
                        domainRisk={result.issues.domainRisk}
                        isPro={isProPlus}
                      />
                    </ReportSection>

                    {/* Technology Security */}
                    <ReportSection
                      title="Technology Security"
                      defaultOpen={false}
                      score={result.issues.technologyStack?.score}
                    >
                      <TechnologyStack
                        technologyStack={result.issues.technologyStack}
                        isPro={isPro}
                      />
                    </ReportSection>

                    {/* ========== TIER 3: EMERGING RISKS ========== */}

                    {/* AI Compliance */}
                    <ReportSection
                      title="AI Compliance"
                      defaultOpen={false}
                      score={result.issues.aiUsage?.score}
                    >
                      <AIUsageAudit
                        aiUsage={result.issues.aiUsage}
                        isPro={isProPlus}
                      />
                    </ReportSection>

                    {/* Vendors & Data Flow */}
                    <ReportSection title="Vendors & Data Flow" defaultOpen={false} score={vendorsScore}>
                      {/* Vendor Risk Assessment */}
                      {result.issues.vendorRisks && (
                        <VendorRisk
                          vendorRisks={result.issues.vendorRisks}
                          isOpen={showVendorRisk}
                          onToggle={() => setShowVendorRisk(!showVendorRisk)}
                          isPro={isPro}
                          onUpgrade={() => handleCheckout()}
                        />
                      )}

                      {/* Data Transfers Outside EU */}
                      {result.issues.vendorRisks && (
                        <DataTransfers
                          vendorRisks={result.issues.vendorRisks}
                          isOpen={showDataTransfers}
                          onToggle={() => setShowDataTransfers(!showDataTransfers)}
                          isPro={isPro}
                        />
                      )}

                      {/* Data Breaches */}
                      <DataBreaches
                        dataBreaches={result.issues.dataBreaches}
                        domain={result.domain}
                        isOpen={showDataBreaches}
                        onToggle={() => setShowDataBreaches(!showDataBreaches)}
                      />

                      {/* Email Exposure Warning */}
                      {result.issues.exposedEmails && (
                        <EmailExposure
                          exposedEmails={result.issues.exposedEmails}
                          isOpen={showEmailExposure}
                          onToggle={() => setShowEmailExposure(!showEmailExposure)}
                          isPro={isPro}
                          onUpgrade={() => handleCheckout()}
                        />
                      )}
                    </ReportSection>

                    {/* ========== TIER 4: OPERATIONAL ========== */}

                    {/* Email Deliverability */}
                    <ReportSection
                      title="Email Deliverability"
                      defaultOpen={false}
                      score={result.issues.emailDeliverability?.score}
                    >
                      <EmailDeliverabilityAudit
                        emailDeliverability={result.issues.emailDeliverability}
                        isPro={isProPlus}
                      />
                    </ReportSection>

                    {/* Hidden Costs Audit */}
                    <ReportSection
                      title="Hidden Costs Audit"
                      defaultOpen={false}
                      score={result.issues.hiddenCosts?.score}
                    >
                      <HiddenCostsAudit
                        hiddenCosts={result.issues.hiddenCosts}
                        isPro={isProPlus}
                      />
                    </ReportSection>

                    {/* ========== SCAN DETAILS ========== */}
                    <ReportSection title="Scan Details" defaultOpen={false}>
                      {/* Pages Scanned */}
                      <PagesScanned
                        pages={result.pages}
                        pagesScanned={result.pagesScanned}
                        isOpen={showPages}
                        onToggle={() => setShowPages(!showPages)}
                      />
                    </ReportSection>
                  </>
                );
              })()}

              {/* CTA */}
              <div className="mt-8 p-6 bg-blue-600 border border-blue-500 rounded-md text-center">
                <h4 className="text-lg font-semibold text-white mb-2 uppercase tracking-wider">Get the Full Audit Report</h4>
                <p className="text-blue-100 text-sm mb-4">Detailed recommendations, PDF export, and continuous monitoring</p>
                <button onClick={() => handleCheckout()} className="px-6 py-2.5 bg-white text-blue-600 font-semibold rounded-md hover:bg-blue-50 transition text-sm">
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
            </div >
          )}
        </div>

        {/* How It Works */}
        <HowItWorksSection />

        {/* Pricing */}
        <PricingCards onCheckout={handleCheckout} />

        {/* FAQ */}
        <FAQSection />

        {/* Regulations Covered */}
        <RegulationsBadges />
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







