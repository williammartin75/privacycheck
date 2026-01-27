import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sendScoreDropAlert } from '@/lib/email';

// Use service role for cron job (bypasses RLS)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Secret key to protect cron endpoint
const CRON_SECRET = process.env.CRON_SECRET || 'your-cron-secret-key';

export async function GET(request: Request) {
    try {
        // Verify cron secret
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        if (secret !== CRON_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();

        // Get all due scheduled scans
        const { data: dueScans, error: fetchError } = await supabase
            .from('scheduled_scans')
            .select('*')
            .eq('is_active', true)
            .lte('next_run', now.toISOString())
            .limit(10); // Process 10 at a time to avoid timeout

        if (fetchError) throw fetchError;

        if (!dueScans || dueScans.length === 0) {
            return NextResponse.json({ message: 'No scans due', processed: 0 });
        }

        const results: { domain: string; oldScore: number | null; newScore: number; changed: boolean }[] = [];

        for (const scan of dueScans) {
            try {
                // Call audit API
                const auditResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://privacychecker.pro'}/api/audit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        url: `https://${scan.domain}`,
                        tier: scan.frequency === 'weekly' ? 'pro_plus' : 'pro' // Pro+ for weekly, Pro for monthly
                    }),
                });

                if (!auditResponse.ok) {
                    console.error(`Audit failed for ${scan.domain}`);
                    continue;
                }

                const auditResult = await auditResponse.json();
                const newScore = auditResult.score;
                const oldScore = scan.last_score;
                const scoreChanged = oldScore !== null && Math.abs(newScore - oldScore) >= 5;

                // Calculate next run
                let nextRun = new Date(now);
                if (scan.frequency === 'daily') {
                    nextRun.setDate(nextRun.getDate() + 1);
                } else if (scan.frequency === 'weekly') {
                    nextRun.setDate(nextRun.getDate() + 7);
                } else if (scan.frequency === 'monthly') {
                    nextRun.setMonth(nextRun.getMonth() + 1);
                }

                // Update schedule
                await supabase
                    .from('scheduled_scans')
                    .update({
                        last_run: now.toISOString(),
                        last_score: newScore,
                        next_run: nextRun.toISOString(),
                        updated_at: now.toISOString(),
                    })
                    .eq('id', scan.id);

                // Store scan result
                await supabase
                    .from('scans')
                    .insert({
                        user_id: scan.user_id,
                        domain: scan.domain,
                        score: newScore,
                        result: auditResult,
                        created_at: now.toISOString(),
                    });

                results.push({
                    domain: scan.domain,
                    oldScore,
                    newScore,
                    changed: scoreChanged,
                });

                // Send email alert if score dropped significantly
                if (scoreChanged && oldScore !== null && newScore < oldScore) {
                    // Get user email via admin API
                    const { data: userData } = await supabase.auth.admin.getUserById(scan.user_id);

                    if (userData?.user?.email) {
                        await sendScoreDropAlert(
                            userData.user.email,
                            scan.domain,
                            oldScore,
                            newScore
                        );
                        console.log(`Alert sent to ${userData.user.email} for ${scan.domain}`);
                    }
                }

            } catch (scanError) {
                console.error(`Error processing ${scan.domain}:`, scanError);
            }
        }

        return NextResponse.json({
            message: 'Cron completed',
            processed: results.length,
            results
        });

    } catch (error) {
        console.error('Cron error:', error);
        return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
    }
}
