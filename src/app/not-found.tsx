import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-6">
            <div className="text-center">
                <div className="relative">
                    <h1 className="text-[200px] font-bold text-gray-100 leading-none select-none">404</h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <svg className="w-24 h-24 text-blue-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Page Not Found</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    The page you're looking for doesn't exist or has been moved. Let's get you back on track.
                </p>
                <div className="flex gap-4 justify-center">
                    <Link
                        href="/"
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
                    >
                        Go to Homepage
                    </Link>
                    <Link
                        href="/dashboard"
                        className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
                    >
                        View Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
