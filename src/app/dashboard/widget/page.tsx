'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface WidgetConfig {
    widget_id: string;
    domain: string;
    position: string;
    theme: string;
    colors: {
        background: string;
        text: string;
        buttonAccept: string;
        buttonReject: string;
        buttonPreferences: string;
    };
    banner_title: string;
    banner_text: string;
    accept_text: string;
    reject_text: string;
    preferences_text: string;
    save_preferences_text: string;
    privacy_policy_url: string;
    categories: Array<{
        id: string;
        name: string;
        description: string;
        required: boolean;
    }>;
}

const defaultConfig: Omit<WidgetConfig, 'widget_id'> = {
    domain: '',
    position: 'bottom-full',
    theme: 'dark',
    colors: {
        background: '#1a1a2e',
        text: '#ffffff',
        buttonAccept: '#4ade80',
        buttonReject: '#6b7280',
        buttonPreferences: '#3b82f6'
    },
    banner_title: 'We use cookies',
    banner_text: 'This website uses cookies to enhance your experience. You can choose which categories to accept.',
    accept_text: 'Accept All',
    reject_text: 'Reject All',
    preferences_text: 'Preferences',
    save_preferences_text: 'Save Preferences',
    privacy_policy_url: '',
    categories: [
        { id: 'necessary', name: 'Necessary', description: 'Essential for website functionality', required: true },
        { id: 'analytics', name: 'Analytics', description: 'Help us understand how visitors use our site', required: false },
        { id: 'marketing', name: 'Marketing', description: 'Used for targeted advertising', required: false },
        { id: 'functional', name: 'Functional', description: 'Enable enhanced features', required: false }
    ]
};

export default function WidgetPage() {
    const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
    const [isPro, setIsPro] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
    const [config, setConfig] = useState<Omit<WidgetConfig, 'widget_id'> & { widget_id?: string }>(defaultConfig);
    const [showPreview, setShowPreview] = useState(true);
    const [copied, setCopied] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setUser(user);

            // Check Pro status
            const { data: subscription } = await supabase
                .from('subscriptions')
                .select('status, tier')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .single();

            if (!subscription) {
                router.push('/?upgrade=true');
                return;
            }
            setIsPro(true);

            // Fetch existing widgets
            const res = await fetch('/api/widget/config');
            const data = await res.json();
            if (data.widgets && data.widgets.length > 0) {
                setWidgets(data.widgets);
                setConfig(data.widgets[0]);
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const handleSave = async () => {
        if (!config.domain) {
            alert('Please enter your domain');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/widget/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            const data = await res.json();
            if (data.widget) {
                setConfig(data.widget);
                setWidgets(prev => {
                    const existing = prev.findIndex(w => w.domain === data.widget.domain);
                    if (existing >= 0) {
                        const updated = [...prev];
                        updated[existing] = data.widget;
                        return updated;
                    }
                    return [...prev, data.widget];
                });
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save widget configuration');
        } finally {
            setSaving(false);
        }
    };

    const copyCode = () => {
        const code = `<script src="https://privacychecker.pro/widget.js" data-widget-id="${config.widget_id}"></script>`;
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!isPro) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <a href="/dashboard" className="text-gray-500 hover:text-gray-700">
                            ← Back to Dashboard
                        </a>
                        <h1 className="text-xl font-bold text-gray-900">Cookie Banner Widget</h1>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Configuration Panel */}
                    <div className="space-y-6">
                        {/* Domain */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h2 className="font-semibold text-gray-900 mb-4">Domain</h2>
                            <input
                                type="text"
                                value={config.domain}
                                onChange={(e) => setConfig({ ...config, domain: e.target.value })}
                                placeholder="example.com"
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Appearance */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h2 className="font-semibold text-gray-900 mb-4">Appearance</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">Theme</label>
                                    <select
                                        value={config.theme}
                                        onChange={(e) => setConfig({ ...config, theme: e.target.value })}
                                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="dark">Dark</option>
                                        <option value="light">Light</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-2">Background</label>
                                        <input
                                            type="color"
                                            value={config.colors.background}
                                            onChange={(e) => setConfig({ ...config, colors: { ...config.colors, background: e.target.value } })}
                                            className="w-full h-10 rounded cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-2">Text</label>
                                        <input
                                            type="color"
                                            value={config.colors.text}
                                            onChange={(e) => setConfig({ ...config, colors: { ...config.colors, text: e.target.value } })}
                                            className="w-full h-10 rounded cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-2">Accept Button</label>
                                        <input
                                            type="color"
                                            value={config.colors.buttonAccept}
                                            onChange={(e) => setConfig({ ...config, colors: { ...config.colors, buttonAccept: e.target.value } })}
                                            className="w-full h-10 rounded cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-2">Reject Button</label>
                                        <input
                                            type="color"
                                            value={config.colors.buttonReject}
                                            onChange={(e) => setConfig({ ...config, colors: { ...config.colors, buttonReject: e.target.value } })}
                                            className="w-full h-10 rounded cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h2 className="font-semibold text-gray-900 mb-4">Text Content</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={config.banner_title}
                                        onChange={(e) => setConfig({ ...config, banner_title: e.target.value })}
                                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">Description</label>
                                    <textarea
                                        value={config.banner_text}
                                        onChange={(e) => setConfig({ ...config, banner_text: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">Privacy Policy URL</label>
                                    <input
                                        type="url"
                                        value={config.privacy_policy_url}
                                        onChange={(e) => setConfig({ ...config, privacy_policy_url: e.target.value })}
                                        placeholder="https://example.com/privacy"
                                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Embed Code */}
                        {config.widget_id && (
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h2 className="font-semibold text-gray-900 mb-4">Embed Code</h2>
                                <p className="text-sm text-gray-600 mb-4">
                                    Add this code before the closing &lt;/head&gt; tag on your website:
                                </p>
                                <div className="relative">
                                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                                        {`<script src="https://privacychecker.pro/widget.js" data-widget-id="${config.widget_id}"></script>`}
                                    </pre>
                                    <button
                                        onClick={copyCode}
                                        className="absolute top-2 right-2 px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600"
                                    >
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Preview Panel */}
                    <div className="lg:sticky lg:top-8">
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold text-gray-900">Preview</h2>
                                <button
                                    onClick={() => setShowPreview(!showPreview)}
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    {showPreview ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            {showPreview && (
                                <div className="relative bg-gray-200 rounded-lg h-96 overflow-hidden">
                                    {/* Simulated website */}
                                    <div className="p-4">
                                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                                        <div className="h-32 bg-gray-300 rounded mb-4"></div>
                                        <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                                        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                                    </div>

                                    {/* Cookie Banner */}
                                    <div
                                        className="absolute bottom-0 left-0 right-0 p-5 shadow-2xl"
                                        style={{
                                            background: config.colors.background,
                                            color: config.colors.text
                                        }}
                                    >
                                        <div className="font-semibold text-base mb-2">{config.banner_title}</div>
                                        <div className="text-sm opacity-90 mb-4">{config.banner_text}</div>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                className="px-4 py-2 rounded-lg font-semibold text-sm"
                                                style={{ background: config.colors.buttonAccept, color: '#000' }}
                                            >
                                                {config.accept_text}
                                            </button>
                                            <button
                                                className="px-4 py-2 rounded-lg font-semibold text-sm"
                                                style={{ background: config.colors.buttonReject, color: '#fff' }}
                                            >
                                                {config.reject_text}
                                            </button>
                                            <button
                                                className="px-4 py-2 rounded-lg font-semibold text-sm border-2"
                                                style={{
                                                    background: 'transparent',
                                                    borderColor: config.colors.buttonPreferences,
                                                    color: config.colors.buttonPreferences
                                                }}
                                            >
                                                {config.preferences_text}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
