'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Scan {
    id: string;
    domain: string;
    score: number;
    pages_scanned: number;
    created_at: string;
}

interface ConsentStats {
    total: number;
    accept: number;
    reject: number;
    acceptRate: number;
    recentLogs: {
        id: string;
        consent_type: string;
        created_at: string;
        visitor_id: string;
    }[];
}


export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [scans, setScans] = useState<Scan[]>([]);
    const [consentStats, setConsentStats] = useState<ConsentStats | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // Check if user has Pro tier
            const tierRes = await fetch('/api/subscription');
            const tierData = await tierRes.json();
            if (tierData.tier === 'free') {
                // Free users cannot access dashboard
                router.push('/');
                return;
            }

            setUser(user);

            // Fetch scans
            const { data } = await supabase
                .from('scans')
                .select('id, domain, score, pages_scanned, created_at')
                .order('created_at', { ascending: false });

            setScans(data || []);

            // Fetch consent stats (use first scanned domain as site_id)
            if (data && data.length > 0) {
                const firstDomain = data[0].domain;
                try {
                    const consentRes = await fetch(`/api/consent?siteId=${encodeURIComponent(firstDomain)}&limit=10`);
                    if (consentRes.ok) {
                        const consentData = await consentRes.json();
                        setConsentStats({
                            total: consentData.total || 0,
                            accept: consentData.stats?.accept || 0,
                            reject: consentData.stats?.reject || 0,
                            acceptRate: consentData.stats?.acceptRate || 0,
                            recentLogs: consentData.logs || [],
                        });
                    }
                } catch (e) {
                    console.error('Failed to fetch consent stats:', e);
                }
            }

            setLoading(false);
        };

        checkUser();
    }, []);

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-100';
        if (score >= 50) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-6 py-4">
                    <nav className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-1">
                            <img src="/logo.png" alt="PrivacyChecker" className="w-12 h-12 scale-150" />
                            <span className="text-xl font-bold text-gray-900">PrivacyChecker</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-600 text-sm">{user?.email}</span>
                            <Link href="/" className="text-blue-600 hover:underline text-sm">
                                New Scan
                            </Link>
                            <Link href="/dashboard/widget" className="text-green-600 hover:underline text-sm">
                                Cookie Widget
                            </Link>
                        </div>
                    </nav>
                </div>
            </header>

            {/* Main */}
            <main className="container mx-auto px-6 py-12">
                {/* Subscription Management */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-white">
                        <h2 className="text-xl font-bold">Pro Subscription</h2>
                        <p className="text-blue-100 text-sm">Manage your billing, payment method, or cancel anytime</p>
                    </div>
                    <button
                        onClick={async () => {
                            const res = await fetch('/api/portal', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email: user?.email }),
                            });
                            const data = await res.json();
                            if (data.url) {
                                window.location.href = data.url;
                            } else {
                                alert('No active subscription found');
                            }
                        }}
                        className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition"
                    >
                        Manage Subscription
                    </button>
                </div>

                {/* Cookie Banner Widget */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Cookie Banner Widget</h2>
                            <p className="text-gray-500 text-sm">Add GDPR-compliant cookie consent to your website</p>
                        </div>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-4 mb-4 overflow-x-auto">
                        <code className="text-green-400 text-sm whitespace-pre">
                            {`<script src="https://privacychecker.pro/cookie-banner.js" defer></script>`}
                        </code>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText('<script src="https://privacychecker.pro/cookie-banner.js" defer></script>');
                                alert('Copied to clipboard!');
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                        >
                            Copy Code
                        </button>
                        <span className="text-gray-500 text-sm">Paste this before &lt;/body&gt; in your HTML</span>
                    </div>
                </div>

                {/* Consent Analytics */}
                {consentStats && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Consent Analytics</h2>
                                <p className="text-gray-500 text-sm">Cookie banner consent statistics</p>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gray-50 rounded-xl p-4 text-center">
                                <p className="text-3xl font-bold text-gray-900">{consentStats.total}</p>
                                <p className="text-sm text-gray-500">Total Consents</p>
                            </div>
                            <div className="bg-green-50 rounded-xl p-4 text-center">
                                <p className="text-3xl font-bold text-green-600">{consentStats.accept}</p>
                                <p className="text-sm text-green-600">Accepted</p>
                            </div>
                            <div className="bg-red-50 rounded-xl p-4 text-center">
                                <p className="text-3xl font-bold text-red-600">{consentStats.reject}</p>
                                <p className="text-sm text-red-600">Rejected</p>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-4 text-center">
                                <p className="text-3xl font-bold text-blue-600">{consentStats.acceptRate}%</p>
                                <p className="text-sm text-blue-600">Accept Rate</p>
                            </div>
                        </div>

                        {/* Recent Logs */}
                        {consentStats.recentLogs.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Consent Logs</h3>
                                <div className="space-y-2">
                                    {consentStats.recentLogs.slice(0, 5).map((log) => (
                                        <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <span className={`w-2 h-2 rounded-full ${log.consent_type === 'accept' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                <span className="text-sm text-gray-600 font-mono">{log.visitor_id.substring(0, 12)}...</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${log.consent_type === 'accept' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {log.consent_type}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(log.created_at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {consentStats.total === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <p>No consent logs yet. Install the Cookie Banner Widget to start tracking.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Score History Chart */}
                {scans.length > 1 && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Score History</h2>
                                <p className="text-gray-500 text-sm">Track your compliance progress over time</p>
                            </div>
                        </div>

                        {/* SVG Chart */}
                        <div className="relative h-64 bg-gray-50 rounded-xl p-4">
                            <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                                {/* Grid lines */}
                                <line x1="0" y1="0" x2="800" y2="0" stroke="#e5e7eb" strokeWidth="1" />
                                <line x1="0" y1="50" x2="800" y2="50" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                                <line x1="0" y1="100" x2="800" y2="100" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                                <line x1="0" y1="150" x2="800" y2="150" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                                <line x1="0" y1="200" x2="800" y2="200" stroke="#e5e7eb" strokeWidth="1" />

                                {/* Score line */}
                                <polyline
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    points={scans
                                        .slice(0, 20)
                                        .reverse()
                                        .map((scan, i, arr) => {
                                            const x = (i / Math.max(arr.length - 1, 1)) * 780 + 10;
                                            const y = 200 - (scan.score / 100) * 190;
                                            return `${x},${y}`;
                                        })
                                        .join(' ')}
                                />

                                {/* Data points */}
                                {scans.slice(0, 20).reverse().map((scan, i, arr) => {
                                    const x = (i / Math.max(arr.length - 1, 1)) * 780 + 10;
                                    const y = 200 - (scan.score / 100) * 190;
                                    const color = scan.score >= 80 ? '#22c55e' : scan.score >= 50 ? '#eab308' : '#ef4444';
                                    return (
                                        <g key={scan.id}>
                                            <circle cx={x} cy={y} r="6" fill={color} stroke="white" strokeWidth="2" />
                                            <title>{`${scan.domain}: ${scan.score}% - ${new Date(scan.created_at).toLocaleDateString()}`}</title>
                                        </g>
                                    );
                                })}
                            </svg>

                            {/* Y-axis labels */}
                            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 -ml-1">
                                <span>100%</span>
                                <span>75%</span>
                                <span>50%</span>
                                <span>25%</span>
                                <span>0%</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-gray-600">Compliant (80%+)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <span className="text-gray-600">Needs Work (50-79%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span className="text-gray-600">Non-Compliant (&lt;50%)</span>
                            </div>
                        </div>
                    </div>
                )}

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Scans</h1>

                {scans.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">No scans yet</h2>
                        <p className="text-gray-600 mb-6">Run your first audit to see results here.</p>
                        <Link href="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold">
                            Start Free Audit
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Domain</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Score</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Pages</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scans.map((scan) => (
                                    <tr key={scan.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900">{scan.domain}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(scan.score)}`}>
                                                {scan.score}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {scan.pages_scanned} page{scan.pages_scanned > 1 ? 's' : ''}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">
                                            {formatDate(scan.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
