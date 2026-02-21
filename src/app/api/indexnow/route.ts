import { NextRequest, NextResponse } from 'next/server';

const INDEXNOW_KEY = 'a1b2c3d4e5f6g7h8';
const SITE_HOST = 'privacychecker.pro';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

/**
 * POST /api/indexnow
 * Submit URLs to IndexNow for instant indexation by Bing, Yandex, etc.
 * 
 * Body: { urls: string[] } or { all: true } to submit all sitemap URLs
 * 
 * Protected by a simple secret key in the Authorization header.
 */
export async function POST(request: NextRequest) {
    // Simple auth — only allow calls with the correct secret
    const authHeader = request.headers.get('authorization');
    const secret = process.env.INDEXNOW_SECRET || 'indexnow-privacychecker-2026';

    if (authHeader !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        let urlsToSubmit: string[] = [];

        if (body.all) {
            // Dynamically import sitemap to get all URLs
            const { blogPosts } = await import('@/app/blog/data');
            const { countries } = await import('@/app/gdpr-compliance/data');

            const baseUrl = `https://${SITE_HOST}`;
            urlsToSubmit = [
                baseUrl,
                `${baseUrl}/about`,
                `${baseUrl}/blog`,
                `${baseUrl}/fines`,
                `${baseUrl}/glossary`,
                `${baseUrl}/fr`,
                `${baseUrl}/de`,
                `${baseUrl}/nl`,
                `${baseUrl}/es`,
                `${baseUrl}/it`,
                `${baseUrl}/da`,
                `${baseUrl}/pt`,
                `${baseUrl}/sv`,
                `${baseUrl}/pl`,
                `${baseUrl}/gdpr-compliance`,
                `${baseUrl}/docs/consent-mode`,
                `${baseUrl}/legal`,
                `${baseUrl}/privacy`,
                `${baseUrl}/terms`,
                ...blogPosts.map(p => `${baseUrl}/blog/${p.slug}`),
                ...countries.map(c => `${baseUrl}/gdpr-compliance/${c.slug}`),
            ];
        } else if (body.urls && Array.isArray(body.urls)) {
            urlsToSubmit = body.urls;
        } else {
            return NextResponse.json({ error: 'Provide { urls: [...] } or { all: true }' }, { status: 400 });
        }

        // IndexNow accepts max 10,000 URLs per request
        const batchSize = 10000;
        const results = [];

        for (let i = 0; i < urlsToSubmit.length; i += batchSize) {
            const batch = urlsToSubmit.slice(i, i + batchSize);

            const response = await fetch(INDEXNOW_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    host: SITE_HOST,
                    key: INDEXNOW_KEY,
                    keyLocation: `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`,
                    urlList: batch,
                }),
            });

            results.push({
                batch: i / batchSize + 1,
                status: response.status,
                statusText: response.statusText,
                urlCount: batch.length,
            });
        }

        return NextResponse.json({
            success: true,
            totalUrls: urlsToSubmit.length,
            results,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
