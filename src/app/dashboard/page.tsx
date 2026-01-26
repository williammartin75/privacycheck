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

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [scans, setScans] = useState<Scan[]>([]);
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
            setUser(user);

            // Fetch scans
            const { data } = await supabase
                .from('scans')
                .select('id, domain, score, pages_scanned, created_at')
                .order('created_at', { ascending: false });

            setScans(data || []);
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
