import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch widget config by widget_id (public) or user's configs (authenticated)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const widgetId = searchParams.get('id');

    // Public access: fetch config by widget_id
    if (widgetId) {
        const { data, error } = await supabase
            .from('widget_configs')
            .select('widget_id, domain, position, theme, colors, banner_title, banner_text, accept_text, reject_text, preferences_text, save_preferences_text, privacy_policy_url, categories')
            .eq('widget_id', widgetId)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
        }

        return NextResponse.json(data);
    }

    // Authenticated access: fetch user's widgets
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

        const { data, error } = await supabase
            .from('widget_configs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ widgets: data || [] });
    } catch (error) {
        console.error('Get widget configs error:', error);
        return NextResponse.json({ error: 'Failed to get widgets' }, { status: 500 });
    }
}

// POST - Create or update widget config
export async function POST(request: NextRequest) {
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

        // Check if user is Pro
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('status, tier')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single();

        if (!subscription) {
            return NextResponse.json({ error: 'Pro subscription required' }, { status: 403 });
        }

        const body = await request.json();
        const { domain, position, theme, colors, banner_title, banner_text, accept_text, reject_text, preferences_text, save_preferences_text, privacy_policy_url, categories } = body;

        if (!domain) {
            return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('widget_configs')
            .upsert({
                user_id: user.id,
                domain: domain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, ''),
                position: position || 'bottom-full',
                theme: theme || 'dark',
                colors: colors || undefined,
                banner_title: banner_title || undefined,
                banner_text: banner_text || undefined,
                accept_text: accept_text || undefined,
                reject_text: reject_text || undefined,
                preferences_text: preferences_text || undefined,
                save_preferences_text: save_preferences_text || undefined,
                privacy_policy_url: privacy_policy_url || undefined,
                categories: categories || undefined,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id,domain'
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ widget: data });
    } catch (error) {
        console.error('Create widget config error:', error);
        return NextResponse.json({ error: 'Failed to create widget' }, { status: 500 });
    }
}

// DELETE - Remove widget config
export async function DELETE(request: NextRequest) {
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
        const widgetId = searchParams.get('id');

        if (!widgetId) {
            return NextResponse.json({ error: 'Widget ID required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('widget_configs')
            .delete()
            .eq('widget_id', widgetId)
            .eq('user_id', user.id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete widget config error:', error);
        return NextResponse.json({ error: 'Failed to delete widget' }, { status: 500 });
    }
}
