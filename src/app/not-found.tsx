import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-6 overflow-hidden relative">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>

            <div className="text-center relative z-10">
                {/* Shield icon with glitch effect */}
                <div className="relative mb-8">
                    <div className="w-32 h-32 mx-auto relative">
                        {/* Outer ring animation */}
                        <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-[spin_8s_linear_infinite]"></div>
                        <div className="absolute inset-2 border-2 border-cyan-400/20 rounded-full animate-[spin_12s_linear_infinite_reverse]"></div>

                        {/* Center shield */}
                        <div className="absolute inset-4 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/30">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* 404 with gradient text */}
                <h1 className="text-8xl md:text-9xl font-black bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent mb-4 tracking-tight">
                    404
                </h1>

                {/* Subtitle */}
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Page Not Found
                </h2>

                <p className="text-blue-200/70 mb-8 max-w-md mx-auto text-lg">
                    This page seems to have escaped our compliance scan.
                    Let&apos;s redirect you to safer territory.
                </p>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl 
                                   hover:from-blue-500 hover:to-blue-400 transition-all duration-300 
                                   shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105
                                   flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Run Free Audit
                    </Link>

                    <Link
                        href="/dashboard"
                        className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl 
                                   border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105
                                   flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Dashboard
                    </Link>
                </div>

                {/* Stats badge */}
                <div className="mt-12 inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        <span className="text-blue-200/70 text-sm">25+ security checks</span>
                    </div>
                    <div className="w-px h-4 bg-white/20"></div>
                    <span className="text-blue-200/70 text-sm">80+ vendors tracked</span>
                </div>
            </div>
        </div>
    );
}
