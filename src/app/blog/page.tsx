import Link from 'next/link';
import { Metadata } from 'next';
import { blogPosts } from './data';

export const metadata: Metadata = {
    title: 'Privacy & Compliance Blog | PrivacyChecker',
    description: 'Expert guides on GDPR, CCPA, cookie compliance, email deliverability, website security, and privacy regulations. Learn how to protect your users and avoid fines.',
    keywords: 'privacy blog, GDPR guide, CCPA compliance, cookie consent, website security, privacy audit',
    openGraph: {
        title: 'Privacy & Compliance Blog | PrivacyChecker',
        description: 'Expert guides on privacy compliance, security, and regulations.',
        url: 'https://privacychecker.pro/blog',
        siteName: 'PrivacyChecker',
    },
    alternates: {
        canonical: 'https://privacychecker.pro/blog',
    },
};

const categoryColors: Record<string, string> = {
    Regulations: 'bg-purple-50 text-purple-700',
    Features: 'bg-blue-50 text-blue-700',
    'How-To': 'bg-emerald-50 text-emerald-700',
    'Market Study': 'bg-orange-50 text-orange-700',
    Comparisons: 'bg-amber-50 text-amber-700',
};

export default function BlogIndex() {
    const categories = [...new Set(blogPosts.map(p => p.category))];

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'PrivacyChecker Blog',
        description: 'Expert guides on privacy compliance, security, and regulations.',
        url: 'https://privacychecker.pro/blog',
        publisher: { '@type': 'Organization', name: 'PrivacyChecker', url: 'https://privacychecker.pro' },
        blogPost: blogPosts.map(p => ({
            '@type': 'BlogPosting',
            headline: p.title,
            description: p.description,
            datePublished: p.date,
            url: `https://privacychecker.pro/blog/${p.slug}`,
        })),
    };

    return (
        <div className="min-h-screen bg-white">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            {/* Header */}
            <header className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
                <nav className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-0">
                        <img src="/logo.png" alt="PrivacyChecker" className="w-12 h-12 sm:w-16 sm:h-16 scale-[1.2]" />
                        <span className="text-sm sm:text-2xl font-bold text-gray-900 notranslate">PrivacyChecker</span>
                    </Link>
                    <div className="flex items-center gap-3 sm:gap-6">
                        <Link href="/blog" className="text-sm sm:text-base text-blue-600 font-medium">Blog</Link>
                        <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition text-xs sm:text-base">
                            Sign In
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="container mx-auto px-4 sm:px-6 py-12 max-w-6xl">
                {/* Hero */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                        Privacy & Compliance{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">Blog</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Expert guides on GDPR, CCPA, website security, and privacy regulations. Stay compliant, avoid fines, and protect your users.
                    </p>
                </div>

                {/* Articles by category */}
                {categories.map(category => (
                    <section key={category} className="mb-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${categoryColors[category] || 'bg-gray-50 text-gray-700'}`}>
                                {category}
                            </span>
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {blogPosts
                                .filter(p => p.category === category)
                                .map(post => (
                                    <Link
                                        key={post.slug}
                                        href={`/blog/${post.slug}`}
                                        className="group block p-6 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-xl transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[post.category]}`}>
                                                {post.category}
                                            </span>
                                            <span className="text-xs text-gray-400">{post.readTime}</span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition mb-2 line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                                            {post.description}
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                            {post.keywords.slice(0, 3).map(kw => (
                                                <span key={kw} className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                                                    {kw}
                                                </span>
                                            ))}
                                        </div>
                                    </Link>
                                ))}
                        </div>
                    </section>
                ))}

                {/* CTA */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 sm:p-12 text-center text-white">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                        Ready to audit your website?
                    </h2>
                    <p className="text-blue-100 mb-6 max-w-xl mx-auto">
                        Scan your site for privacy issues, security vulnerabilities, and compliance gaps — all in under 60 seconds.
                    </p>
                    <Link
                        href="/"
                        className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition"
                    >
                        Start Free Audit
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 mt-20">
                <div className="container mx-auto px-6 py-8 text-center text-sm text-gray-500">
                    <p>© 2026 PrivacyChecker. All rights reserved.</p>
                    <div className="flex justify-center gap-6 mt-4">
                        <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
                        <Link href="/terms" className="hover:text-gray-900">Terms</Link>
                        <Link href="/about" className="hover:text-gray-900">About</Link>
                        <Link href="/blog" className="hover:text-gray-900">Blog</Link>
                        <Link href="/fines" className="hover:text-gray-900">Fines</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
