import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - List user's scheduled scans
export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('sb-access-token')?.value;

        if (!authToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user from token
        const { data: { user }, error: authError } = await supabase.auth.getUser(authToken);
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('scheduled_scans')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ schedules: data });
    } catch (error) {
        console.error('Get schedules error:', error);
        return NextResponse.json({ error: 'Failed to get schedules' }, { status: 500 });
    }
}

// POST - Create a new scheduled scan
export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('sb-access-token')?.value;

        if (!authToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser(authToken);
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { domain, frequency = 'weekly' } = await request.json();

        if (!domain) {
            return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
        }

        // Calculate next run based on frequency
        const now = new Date();
        let nextRun = new Date(now);
        if (frequency === 'daily') {
            nextRun.setDate(nextRun.getDate() + 1);
        } else if (frequency === 'weekly') {
            nextRun.setDate(nextRun.getDate() + 7);
        } else if (frequency === 'monthly') {
            nextRun.setMonth(nextRun.getMonth() + 1);
        }

        const { data, error } = await supabase
            .from('scheduled_scans')
            .upsert({
                user_id: user.id,
                domain: domain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, ''),
                frequency,
                next_run: nextRun.toISOString(),
                is_active: true,
                updated_at: now.toISOString(),
            }, {
                onConflict: 'user_id,domain',
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ schedule: data });
    } catch (error) {
        console.error('Create schedule error:', error);
        return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
    }
}

// DELETE - Remove a scheduled scan
export async function DELETE(request: Request) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('sb-access-token')?.value;

        if (!authToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser(authToken);
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const scheduleId = searchParams.get('id');

        if (!scheduleId) {
            return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('scheduled_scans')
            .delete()
            .eq('id', scheduleId)
            .eq('user_id', user.id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete schedule error:', error);
        return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 });
    }
}
