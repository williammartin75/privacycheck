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
          <ScanForm
            url={url}
            onUrlChange={setUrl}
            onSubmit={handleAudit}
            loading={loading}
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
                issuesCount={result.scoreBreakdown?.filter(b => b.points < 0).length || 0}
                passedCount={result.scoreBreakdown?.filter(b => b.points >= 0).length || 0}
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
                    <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">Pro</span>
                  </button>
                )}
              </div>

              {/* Passed Checks List */}
              <PassedChecks issues={result.issues} />

              {/* Issues Found */}
              {result.scoreBreakdown && (
                <IssuesFound issues={result.scoreBreakdown} />
              )}

              {/* Score Breakdown */}
              {result.scoreBreakdown && result.scoreBreakdown.length > 0 && (
                <ScoreBreakdown breakdown={result.scoreBreakdown} finalScore={result.score} />
              )}

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

              {/* Compliance Drift Detection */}
              {driftReport && driftReport.hasChanges && (
                <ComplianceDrift
                  driftReport={driftReport}
                  isOpen={showComplianceDrift}
                  onToggle={() => setShowComplianceDrift(!showComplianceDrift)}
                />
              )}

              {/* Security Exposure Analysis */}
              {result.attackSurface && result.attackSurface.totalFindings > 0 && (
                <SecurityExposure
                  attackSurface={result.attackSurface}
                  isOpen={showSecurityExposure}
                  onToggle={() => setShowSecurityExposure(!showSecurityExposure)}
                />
              )}

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

              {/* Cookie Lifespan Analysis */}
              {result.issues.cookieLifespan && (
                <CookieLifespan
                  cookieLifespan={result.issues.cookieLifespan}
                  isOpen={showCookieLifespan}
                  onToggle={() => setShowCookieLifespan(!showCookieLifespan)}
                  isPro={isPro}
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







