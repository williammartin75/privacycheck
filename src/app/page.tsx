'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { recommendations } from '@/lib/recommendations';
import { generatePDF } from '@/lib/pdf-generator';

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
  };
  regulations: string[];
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState('');
  const [showCookies, setShowCookies] = useState(false);
  const [showPages, setShowPages] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [expandedRec, setExpandedRec] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Check subscription status
        const { data: subscription, error } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error && subscription?.status === 'active') {
          setIsPro(true);
        }
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setIsPro(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleCheckout = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
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

    // Normalize URL: add https:// if missing
    let normalizedUrl = url.trim();
    if (!normalizedUrl.match(/^https?:\/\//i)) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      if (!response.ok) throw new Error('Audit failed');

      const data = await response.json();
      setResult(data);

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
      setError('Failed to audit site. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { label: 'Compliant', sublabel: 'Low Risk', bg: 'bg-green-100', text: 'text-green-700' };
    if (score >= 50) return { label: 'Improvements Needed', sublabel: 'Medium Risk', bg: 'bg-yellow-100', text: 'text-yellow-700' };
    return { label: 'Non-Compliant', sublabel: 'High Risk', bg: 'bg-red-100', text: 'text-red-700' };
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'necessary': return 'bg-green-100 text-green-700';
      case 'analytics': return 'bg-blue-100 text-blue-700';
      case 'marketing': return 'bg-purple-100 text-purple-700';
      case 'preferences': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const CheckItem = ({ passed, label, recKey }: { passed: boolean; label: string; recKey?: string }) => {
    const rec = recKey ? recommendations[recKey] : null;
    const isExpanded = expandedRec === recKey;

    return (
      <div className={`rounded-xl ${passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <div
          className={`p-4 flex items-center gap-3 ${!passed && rec ? 'cursor-pointer' : ''}`}
          onClick={() => !passed && rec && setExpandedRec(isExpanded ? null : recKey!)}
        >
          {passed ? (
            <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="text-gray-900 font-medium flex-1">{label}</span>
          {!passed && rec && (
            <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <button onClick={handleCheckout} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
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
                className="flex-1 px-6 py-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
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

          {error && (
            <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
              {error}
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 shadow-xl text-left">
              {/* Header with Score Gauge */}
              <div className="flex flex-col md:flex-row items-center gap-8 mb-8 pb-8 border-b border-gray-100">
                {/* Score Circle */}
                <div className="relative">
                  <svg className="w-36 h-36 transform -rotate-90">
                    <circle cx="72" cy="72" r="64" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                    <circle
                      cx="72" cy="72" r="64"
                      stroke={result.score >= 70 ? '#22c55e' : result.score >= 40 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${result.score * 4.02} 402`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-bold ${getScoreColor(result.score)}`}>{result.score}</span>
                    <span className="text-gray-500 text-sm">/100</span>
                  </div>
                </div>

                {/* Site Info */}
                <div className="flex-1 text-center md:text-left">
                  <p className="text-gray-500 text-sm mb-1">Privacy Compliance Report</p>
                  <p className="text-gray-900 text-2xl font-bold mb-3">{result.domain}</p>
                  <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getScoreLabel(result.score).bg} ${getScoreLabel(result.score).text}`}>
                    {getScoreLabel(result.score).label} • {getScoreLabel(result.score).sublabel}
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap justify-center md:justify-start">
                    {result.regulations?.map((reg, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium border border-blue-200">
                        {reg}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex md:flex-col gap-4">
                  <div className="text-center px-4 py-3 bg-red-50 rounded-xl border border-red-100">
                    <p className="text-2xl font-bold text-red-600">{Object.values(result.issues).filter(v => !v).length}</p>
                    <p className="text-xs text-red-600 font-medium">Issues Found</p>
                  </div>
                  <div className="text-center px-4 py-3 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-2xl font-bold text-green-600">{Object.values(result.issues).filter(v => v).length}</p>
                    <p className="text-xs text-green-600 font-medium">Checks Passed</p>
                  </div>
                  <div className="text-center px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-2xl font-bold text-gray-700">{result.pagesScanned}</p>
                    <p className="text-xs text-gray-600 font-medium">Pages Scanned</p>
                  </div>
                </div>
              </div>

              {/* PDF Button */}
              <div className="flex justify-center mb-8">
                <button
                  onClick={() => isPro ? generatePDF(result) : handleCheckout()}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl transition font-semibold text-lg ${isPro ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'}`}
                >
                  {isPro ? (
                    <>
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM8.5 13h7v1h-7v-1zm0 2h7v1h-7v-1zm0 2h4v1h-4v-1z" />
                      </svg>
                      Download Full PDF Report
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Download PDF Compliance Report (Pro)
                    </>
                  )}
                </button>
              </div>

              {/* Compliance Checks */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">Compliance Checklist</h3>
              <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-blue-700 text-sm">
                  <strong>Pro Tip:</strong> Click on any failed item (red) to see <strong>step-by-step fix instructions</strong>
                </p>
              </div>
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

              {/* Security Checks - P0 Modules */}
              {(result.issues.ssl || result.issues.securityHeaders || result.issues.emailSecurity) && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Security Checks</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* SSL/TLS */}
                    {result.issues.ssl && (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${result.issues.ssl.valid ? 'bg-green-100' : 'bg-red-100'}`}>
                            <svg className={`w-4 h-4 ${result.issues.ssl.valid ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            <span className={result.issues.ssl.hsts ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                              {result.issues.ssl.hsts ? '✓ Enabled' : '○ Missing'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Email Security */}
                    {result.issues.emailSecurity && (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${result.issues.emailSecurity.spf && result.issues.emailSecurity.dmarc ? 'bg-green-100' : 'bg-yellow-100'}`}>
                            <svg className={`w-4 h-4 ${result.issues.emailSecurity.spf && result.issues.emailSecurity.dmarc ? 'text-green-600' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${Object.values(result.issues.securityHeaders).filter(Boolean).length >= 4 ? 'bg-green-100' : 'bg-yellow-100'}`}>
                            <svg className={`w-4 h-4 ${Object.values(result.issues.securityHeaders).filter(Boolean).length >= 4 ? 'text-green-600' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </div>
                          <h4 className="font-semibold text-gray-900">Security Headers</h4>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">CSP</span>
                            <span className={result.issues.securityHeaders.csp ? 'text-green-600' : 'text-gray-400'}>
                              {result.issues.securityHeaders.csp ? '✓' : '○'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">X-Frame-Options</span>
                            <span className={result.issues.securityHeaders.xFrameOptions ? 'text-green-600' : 'text-gray-400'}>
                              {result.issues.securityHeaders.xFrameOptions ? '✓' : '○'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">X-Content-Type</span>
                            <span className={result.issues.securityHeaders.xContentType ? 'text-green-600' : 'text-gray-400'}>
                              {result.issues.securityHeaders.xContentType ? '✓' : '○'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Referrer-Policy</span>
                            <span className={result.issues.securityHeaders.referrerPolicy ? 'text-green-600' : 'text-gray-400'}>
                              {result.issues.securityHeaders.referrerPolicy ? '✓' : '○'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Email Exposure Warning */}
              {result.issues.exposedEmails && result.issues.exposedEmails.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-red-700">{result.issues.exposedEmails.length} Email{result.issues.exposedEmails.length > 1 ? 's' : ''} Exposed</h3>
                      <p className="text-red-600 text-sm">These email addresses are visible in your page source and can be harvested by spammers.</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.issues.exposedEmails.map((email, i) => (
                      <span key={i} className="px-3 py-1 bg-white border border-red-200 rounded-full text-red-700 text-sm font-mono">
                        {email}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-red-600 text-xs">
                    <strong>Tip:</strong> Use contact forms or obfuscate emails (e.g., contact[at]domain.com) to prevent harvesting.
                  </p>
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
                  <div className="bg-gray-50 rounded-xl p-4 overflow-x-auto">
                    {/* Category Legend */}
                    <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b border-gray-200">
                      <span className="text-xs text-gray-500 font-medium">Categories:</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">necessary</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">analytics</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">marketing</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">preferences</span>
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
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
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
                <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-xl">
                  <div className="flex items-start gap-3 mb-3">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-amber-800 font-semibold">
                        {result.issues.trackers.length} Third-Party Tracker{result.issues.trackers.length > 1 ? 's' : ''} Detected
                      </p>
                      <p className="text-amber-700 text-sm mt-1">
                        These scripts collect user data and require explicit consent under GDPR.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {result.issues.trackers.map((tracker, i) => (
                      <span key={i} className="px-3 py-1 bg-amber-100 border border-amber-200 rounded-full text-amber-800 text-sm font-medium">
                        {tracker}
                      </span>
                    ))}
                  </div>
                  <p className="text-amber-600 text-xs">
                    Tip: Use our Cookie Banner to block these trackers until user consent is given.
                  </p>
                </div>
              )}

              {/* CTA */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-center">
                <h4 className="text-xl font-bold text-white mb-2">Get the Full Audit Report</h4>
                <p className="text-blue-100 mb-4">Detailed recommendations, PDF export, and continuous monitoring</p>
                <button onClick={handleCheckout} className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition">
                  Start Free 7-Day Trial
                </button>
              </div>
            </div>
          )}
        </div>

        {/* How It Works */}
        <section className="py-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-blue-600 font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Enter your URL</h3>
              <p className="text-gray-600">We scan your website and analyze cookies, trackers, and privacy elements.</p>
            </div>
            <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-blue-600 font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Get your score</h3>
              <p className="text-gray-600">See your privacy score and the list of issues detected on your site.</p>
            </div>
            <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-blue-600 font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Fix issues</h3>
              <p className="text-gray-600">Upgrade to Pro for step-by-step fixes, Cookie Banner Widget, and Google Consent Mode v2.</p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Simple pricing</h2>
          <p className="text-gray-600 text-center mb-12">Free to scan. Upgrade to unlock recommendations.</p>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100">
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
              <a href="/signup" className="block w-full py-3 border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition font-semibold text-center">
                Start Free Audit
              </a>
            </div>

            <div className="p-8 bg-gradient-to-b from-blue-600 to-blue-700 rounded-2xl border border-blue-500 relative shadow-xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 rounded-full text-sm font-medium text-gray-900">
                Recommended
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Pro</h3>
              <p className="text-4xl font-bold text-white mb-6">€19<span className="text-lg text-blue-200">/month</span></p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Everything in Free
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
              <button onClick={handleCheckout} className="block w-full py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition text-center">
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
              <p className="text-gray-600">We check 11+ compliance criteria including HTTPS, cookie consent banner, privacy policy, legal mentions, DPO contact, data deletion options, and more. We also detect all cookies and third-party trackers on your site.</p>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What's included in Pro?</h3>
              <p className="text-gray-600">Pro includes everything in Free, plus: detailed step-by-step fix recommendations, downloadable PDF compliance reports, email alerts if your score drops, automatic monthly re-scans, a ready-to-use Cookie Banner Widget, and Google Consent Mode v2 integration.</p>
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
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-gray-50">
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
      </footer>
    </div>
  );
}
