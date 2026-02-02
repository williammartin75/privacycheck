'use client';

const euStarAngles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

export function RegulationsBadges() {
    return (
        <section className="py-16">
            <div className="container mx-auto px-6 max-w-[95%] sm:max-w-none">
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">Regulations We Check</h2>
                <p className="text-gray-600 text-center mb-4">Comprehensive coverage for global privacy compliance</p>

                {/* Desktop: Original badges.png with cropping effect */}
                <div className="hidden sm:flex justify-center overflow-hidden" style={{ maxHeight: '95px' }}>
                    <img
                        src="/badges.png"
                        alt="GDPR, CCPA, LGPD, PIPEDA, UK GDPR and 50+ more regulations"
                        className="object-cover h-[440px] -my-[172px]"
                        style={{
                            filter: 'brightness(1.08) contrast(1.1)'
                        }}
                    />
                </div>

                {/* Mobile: Same badges.png but scaled to fit all badges */}
                <div className="flex sm:hidden justify-center -my-24">
                    <img
                        src="/badges.png"
                        alt="GDPR, CCPA, LGPD, PIPEDA, UK GDPR and 50+ more regulations"
                        className="w-full h-auto object-contain"
                        style={{
                            filter: 'brightness(1.08) contrast(1.1)'
                        }}
                    />
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 mt-1 sm:mt-0">

                    {/* EU Data Badge */}
                    <div className="flex flex-col items-center group">
                        <div className="w-14 h-14 sm:w-20 sm:h-20 relative">
                            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg group-hover:drop-shadow-xl transition">
                                <circle cx="50" cy="50" r="48" fill="#003399" stroke="#002266" strokeWidth="2" />
                                {euStarAngles.map((angle, i) => (
                                    <text
                                        key={i}
                                        x={50 + 35 * Math.cos((angle - 90) * Math.PI / 180)}
                                        y={50 + 35 * Math.sin((angle - 90) * Math.PI / 180)}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fill="#FFCC00"
                                        fontSize="10"
                                    >★</text>
                                ))}
                                <text x="50" y="46" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">EU</text>
                                <text x="50" y="60" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">DATA</text>
                            </svg>
                        </div>
                    </div>

                    {/* EAA 2025 Badge - EU flag style */}
                    <div className="flex flex-col items-center group">
                        <div className="w-14 h-14 sm:w-20 sm:h-20 relative">
                            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg group-hover:drop-shadow-xl transition">
                                <circle cx="50" cy="50" r="48" fill="#003399" stroke="#002266" strokeWidth="2" />
                                {euStarAngles.map((angle, i) => (
                                    <text
                                        key={`eaa-${i}`}
                                        x={50 + 35 * Math.cos((angle - 90) * Math.PI / 180)}
                                        y={50 + 35 * Math.sin((angle - 90) * Math.PI / 180)}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fill="#FFCC00"
                                        fontSize="10"
                                    >★</text>
                                ))}
                                <text x="50" y="46" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">EAA</text>
                                <text x="50" y="60" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">2025</text>
                            </svg>
                        </div>
                    </div>

                    {/* EU AI Act Badge - EU flag style with yellow A */}
                    <div className="flex flex-col items-center group">
                        <div className="w-14 h-14 sm:w-20 sm:h-20 relative">
                            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg group-hover:drop-shadow-xl transition">
                                <circle cx="50" cy="50" r="48" fill="#003399" stroke="#002266" strokeWidth="2" />
                                {euStarAngles.map((angle, i) => (
                                    <text
                                        key={`ai-${i}`}
                                        x={50 + 35 * Math.cos((angle - 90) * Math.PI / 180)}
                                        y={50 + 35 * Math.sin((angle - 90) * Math.PI / 180)}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fill="#FFCC00"
                                        fontSize="10"
                                    >★</text>
                                ))}
                                <text x="50" y="38" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">EU</text>
                                <text x="50" y="50" textAnchor="middle" fontSize="8">
                                    <tspan fill="#FFCC00" fontWeight="bold">A</tspan>
                                    <tspan fill="white">rtificial</tspan>
                                </text>
                                <text x="50" y="60" textAnchor="middle" fontSize="8">
                                    <tspan fill="#FFCC00" fontWeight="bold">I</tspan>
                                    <tspan fill="white">ntelligence</tspan>
                                </text>
                                <text x="50" y="70" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">Act</text>
                            </svg>
                        </div>
                    </div>

                    {/* 100K Scans Badge */}
                    <div className="flex flex-col items-center group">
                        <div className="w-14 h-14 sm:w-20 sm:h-20 relative">
                            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg group-hover:drop-shadow-xl transition">
                                <circle cx="50" cy="50" r="48" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
                                <text x="50" y="42" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">100K</text>
                                <text x="50" y="58" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">SCANS</text>
                                <text x="50" y="74" textAnchor="middle" fill="white" fontSize="8" opacity="0.8">VERIFIED</text>
                            </svg>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
