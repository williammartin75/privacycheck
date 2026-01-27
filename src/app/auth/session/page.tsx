'use client';

import { Suspense, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

function SessionContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const setSession = async () => {
            const accessToken = searchParams.get('access_token');
            const refreshToken = searchParams.get('refresh_token');

            if (!accessToken || !refreshToken) {
                router.push('/login?error=missing_tokens');
                return;
            }

            try {
                const supabase = createClient();

                const { error } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                });

                if (error) {
                    console.error('Session error:', error);
                    router.push('/login?error=session_failed');
                    return;
                }

                // Redirect to dashboard
                router.push('/dashboard');
            } catch (err) {
                console.error('Session setup error:', err);
                router.push('/login?error=session_error');
            }
        };

        setSession();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Signing you in...</p>
            </div>
        </div>
    );
}

export default function SessionHandler() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        }>
            <SessionContent />
        </Suspense>
    );
}
