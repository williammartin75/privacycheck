import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendScoreDropAlert, sendMonthlyReportEmail } from '@/lib/email';

// This endpoint is called by Vercel Cron (daily at 9 AM UTC)
// Scans users whose last scan was 30+ days ago

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
    // Verify cron secret (optional security)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get all Pro users
        const { data: proUsers } = await supabase
            .from('profiles')
            .select('id, email')
            .eq('is_pro', true);

        if (!proUsers || proUsers.length === 0) {
            return NextResponse.json({ message: 'No pro users to scan' });
        }

        const results = [];
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        for (const user of proUsers) {
            // Get user's last scan
            const { data: lastScan } = await supabase
                .from('scans')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (!lastScan) continue;

            // Check if last scan was 30+ days ago
            const lastScanDate = new Date(lastScan.created_at);
            if (lastScanDate > thirtyDaysAgo) {
                // Scan is recent, skip this user
                continue;
            }

            // Re-scan the domain
            const scanResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://privacychecker.pro'}/api/scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: `https://${lastScan.domain}` }),
            });

            if (!scanResponse.ok) continue;

            const newScanResult = await scanResponse.json();
            const oldScore = lastScan.score;
            const newScore = newScanResult.score;

            // Save new scan
            await supabase.from('scans').insert({
                user_id: user.id,
                domain: lastScan.domain,
                score: newScore,
                pages_scanned: newScanResult.pagesScanned,
                issues: newScanResult.issues,
                cookies: newScanResult.cookies,
                trackers: newScanResult.trackers,
                regulations: newScanResult.regulations,
            });

            // Count issues
            const issuesCount = Object.values(newScanResult.issues).filter((v: unknown) => !v).length;

            // Send appropriate email
            if (newScore < oldScore) {
                // Score dropped - send alert
                await sendScoreDropAlert(user.email, lastScan.domain, oldScore, newScore);
                results.push({ user: user.email, action: 'score_drop_alert', oldScore, newScore });
            } else {
                // Send monthly report
                await sendMonthlyReportEmail(user.email, lastScan.domain, newScore, issuesCount);
                results.push({ user: user.email, action: 'monthly_report', score: newScore });
            }
        }

        return NextResponse.json({
            success: true,
            processed: results.length,
            results
        });
    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
    }
}
