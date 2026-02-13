import Link from 'next/link';
import { BlogPost, blogPosts } from './data';

interface ArticleLayoutProps {
    post: BlogPost;
    children: React.ReactNode;
}

export function ArticleLayout({ post, children }: ArticleLayoutProps) {
    const related = blogPosts
        .filter(p => p.slug !== post.slug && p.category === post.category)
        .slice(0, 3);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.date,
        author: { '@type': 'Organization', name: 'PrivacyChecker', url: 'https://privacychecker.pro' },
        publisher: { '@type': 'Organization', name: 'PrivacyChecker', url: 'https://privacychecker.pro', logo: { '@type': 'ImageObject', url: 'https://privacychecker.pro/logo.png' } },
        mainEntityOfPage: `https://privacychecker.pro/blog/${post.slug}`,
        image: 'https://privacychecker.pro/og-image.png',
        keywords: post.keywords.join(', '),
    };

    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://privacychecker.pro' },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://privacychecker.pro/blog' },
            { '@type': 'ListItem', position: 3, name: post.title, item: `https://privacychecker.pro/blog/${post.slug}` },
        ],
    };

    return (
        <div className="min-h-screen bg-white">
            {/* JSON-LD */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

            {/* Header */}
            <header className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
                <nav className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-0">
                        <img src="/logo.png" alt="PrivacyChecker" className="w-12 h-12 sm:w-16 sm:h-16 scale-[1.2]" />
                        <span className="text-sm sm:text-2xl font-bold text-gray-900 notranslate">PrivacyChecker</span>
                    </Link>
                    <div className="flex items-center gap-3 sm:gap-6">
                        <Link href="/blog" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition">Blog</Link>
                        <Link href="/#pricing" className="hidden sm:block text-sm sm:text-base text-gray-600 hover:text-gray-900 transition">Pricing</Link>
                        <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition text-xs sm:text-base">
                            Sign In
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Article */}
            <main className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
                {/* Breadcrumb */}
                <nav className="text-sm text-gray-500 mb-8">
                    <Link href="/" className="hover:text-gray-900">Home</Link>
                    <span className="mx-2">/</span>
                    <Link href="/blog" className="hover:text-gray-900">Blog</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900">{post.title}</span>
                </nav>

                {/* Meta */}
                <div className="mb-8">
                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full mb-4">
                        {post.category}
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                        {post.title}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <time dateTime={post.date}>
                            {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </time>
                        <span>·</span>
                        <span>{post.readTime} read</span>
                    </div>
                </div>

                {/* Content */}
                <article className="blog-article max-w-none">
                    {children}
                </article>

                {/* CTA */}
                <div className="mt-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 sm:p-12 text-center text-white">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                        Check your website now — free
                    </h2>
                    <p className="text-blue-100 mb-6 max-w-xl mx-auto">
                        Run a complete privacy audit in under 60 seconds. Get your score, find issues, and learn how to fix them.
                    </p>
                    <Link
                        href="/"
                        className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition"
                    >
                        Start Free Audit
                    </Link>
                </div>

                {/* Related */}
                {related.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {related.map(r => (
                                <Link
                                    key={r.slug}
                                    href={`/blog/${r.slug}`}
                                    className="group block p-6 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition"
                                >
                                    <span className="text-xs text-blue-600 font-medium">{r.category}</span>
                                    <h3 className="mt-2 font-semibold text-gray-900 group-hover:text-blue-600 transition line-clamp-2">
                                        {r.title}
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">{r.description}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
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
                    </div>
                </div>
            </footer>
        </div>
    );
}
