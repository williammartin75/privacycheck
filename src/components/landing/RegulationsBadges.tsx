'use client';

const euStarAngles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

// SVG Regulation Badges - replaces badges.png for better responsive control
function GDPRBadge() {
    return (
        <svg viewBox="0 0 80 100" className="w-full h-full drop-shadow-md">
            <defs>
                <linearGradient id="gdprGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#003399" />
                    <stop offset="100%" stopColor="#002266" />
                </linearGradient>
            </defs>
            <rect x="5" y="5" width="70" height="90" rx="8" fill="url(#gdprGrad)" stroke="#001a4d" strokeWidth="2" />
            {/* EU Stars circle */}
            {euStarAngles.map((angle, i) => (
                <text
                    key={`gdpr-star-${i}`}
                    x={40 + 22 * Math.cos((angle - 90) * Math.PI / 180)}
                    y={38 + 22 * Math.sin((angle - 90) * Math.PI / 180)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#FFCC00"
                    fontSize="7"
                >★</text>
            ))}
            {/* Lock icon */}
            <rect x="34" y="30" width="12" height="10" rx="2" fill="white" />
            <path d="M36 30 L36 26 Q40 20 44 26 L44 30" fill="none" stroke="white" strokeWidth="2" />
            <text x="40" y="72" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">GDPR</text>
        </svg>
    );
}

function CCPABadge() {
    return (
        <svg viewBox="0 0 80 100" className="w-full h-full drop-shadow-md">
            {/* Shield shape */}
            <path d="M40 5 L75 20 L75 55 Q75 85 40 95 Q5 85 5 55 L5 20 Z" fill="#b22234" stroke="#8b0000" strokeWidth="2" />
            {/* Stripes */}
            <path d="M10 25 L70 25 L70 33 L10 33 Z" fill="white" />
            <path d="M10 41 L70 41 L70 49 L10 49 Z" fill="white" />
            <path d="M10 57 L70 57 L70 65 L10 65 Z" fill="white" />
            {/* Blue corner with stars */}
            <rect x="10" y="17" width="25" height="24" fill="#3c3b6e" />
            <text x="15" y="26" fill="white" fontSize="6">★★★</text>
            <text x="15" y="34" fill="white" fontSize="6">★★★</text>
            <text x="40" y="85" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">CCPA</text>
        </svg>
    );
}

function LGPDBadge() {
    return (
        <svg viewBox="0 0 90 100" className="w-full h-full drop-shadow-md">
            {/* Oval shape */}
            <ellipse cx="45" cy="50" rx="40" ry="45" fill="#009c3b" stroke="#006400" strokeWidth="2" />
            <ellipse cx="45" cy="50" rx="32" ry="37" fill="#ffdf00" stroke="#ccb200" strokeWidth="1" />
            {/* Inner shield */}
            <ellipse cx="45" cy="45" rx="18" ry="20" fill="#009c3b" />
            <text x="45" y="50" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">🛡️</text>
            <text x="45" y="82" textAnchor="middle" fill="#002776" fontSize="16" fontWeight="bold">LGPD</text>
        </svg>
    );
}

function PIPEDABadge() {
    return (
        <svg viewBox="0 0 80 100" className="w-full h-full drop-shadow-md">
            {/* Shield shape */}
            <path d="M40 5 L75 20 L75 55 Q75 85 40 95 Q5 85 5 55 L5 20 Z" fill="#ff0000" stroke="#cc0000" strokeWidth="2" />
            {/* White center */}
            <path d="M40 12 L68 24 L68 52 Q68 78 40 88 Q12 78 12 52 L12 24 Z" fill="white" />
            {/* Maple leaf simplified */}
            <text x="40" y="55" textAnchor="middle" fill="#ff0000" fontSize="28">🍁</text>
            <text x="40" y="85" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">PIPEDA</text>
        </svg>
    );
}

function UKGDPRBadge() {
    return (
        <svg viewBox="0 0 80 100" className="w-full h-full drop-shadow-md">
            {/* Shield shape */}
            <path d="M40 5 L75 20 L75 55 Q75 85 40 95 Q5 85 5 55 L5 20 Z" fill="#012169" stroke="#001040" strokeWidth="2" />
            {/* Union Jack simplified */}
            <line x1="40" y1="15" x2="40" y2="70" stroke="white" strokeWidth="6" />
            <line x1="10" y1="42" x2="70" y2="42" stroke="white" strokeWidth="6" />
            <line x1="40" y1="15" x2="40" y2="70" stroke="#c8102e" strokeWidth="3" />
            <line x1="10" y1="42" x2="70" y2="42" stroke="#c8102e" strokeWidth="3" />
            <line x1="15" y1="20" x2="65" y2="65" stroke="white" strokeWidth="3" />
            <line x1="65" y1="20" x2="15" y2="65" stroke="white" strokeWidth="3" />
            <text x="40" y="60" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">UK</text>
            <text x="40" y="85" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">GDPR</text>
        </svg>
    );
}

function FiftyPlusBadge() {
    return (
        <svg viewBox="0 0 90 100" className="w-full h-full drop-shadow-md">
            {/* Oval shape */}
            <ellipse cx="45" cy="50" rx="40" ry="45" fill="#6b7280" stroke="#4b5563" strokeWidth="2" />
            {/* Checkmark */}
            <circle cx="45" cy="30" r="15" fill="#22c55e" />
            <path d="M37 30 L43 36 L55 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {/* Shield icon */}
            <path d="M45 50 L55 55 L55 65 Q55 72 45 78 Q35 72 35 65 L35 55 Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
            <text x="45" y="90" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">50+ REGULATIONS</text>
        </svg>
    );
}

export function RegulationsBadges() {
    return (
        <section className="py-16">
            <div className="container mx-auto px-6 max-w-[95%] sm:max-w-none">
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">Regulations We Check</h2>
                <p className="text-gray-600 text-center mb-6">Comprehensive coverage for global privacy compliance</p>

                {/* Regulation Badges - SVG for perfect responsive control */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4 max-w-xl sm:max-w-4xl mx-auto mb-4">
                    <div className="flex justify-center">
                        <div className="w-12 h-16 sm:w-16 sm:h-20"><GDPRBadge /></div>
                    </div>
                    <div className="flex justify-center">
                        <div className="w-12 h-16 sm:w-16 sm:h-20"><CCPABadge /></div>
                    </div>
                    <div className="flex justify-center">
                        <div className="w-14 h-16 sm:w-18 sm:h-20"><LGPDBadge /></div>
                    </div>
                    <div className="flex justify-center">
                        <div className="w-12 h-16 sm:w-16 sm:h-20"><PIPEDABadge /></div>
                    </div>
                    <div className="flex justify-center">
                        <div className="w-12 h-16 sm:w-16 sm:h-20"><UKGDPRBadge /></div>
                    </div>
                    <div className="flex justify-center">
                        <div className="w-14 h-16 sm:w-18 sm:h-20"><FiftyPlusBadge /></div>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 mt-4">

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
