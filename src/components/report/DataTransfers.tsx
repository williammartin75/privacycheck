'use client';

interface VendorRiskItem {
    name: string;
    category: string;
    jurisdiction: string;
    dataTransfer: 'EU' | 'US' | 'CN' | 'International' | string;
    gdprCompliant: boolean;
}

interface DataTransfersProps {
    vendorRisks: VendorRiskItem[];
    isOpen: boolean;
    onToggle: () => void;
    isPro: boolean;
}

function getVendorBorder(vendor: VendorRiskItem): string {
    if (!vendor.gdprCompliant) return 'bg-white border-red-200';
    if (vendor.jurisdiction === 'USA') return 'bg-white border-orange-200';
    return 'bg-white border-yellow-200';
}

function getJurisdictionStyle(jurisdiction: string): string {
    if (jurisdiction === 'USA') return 'bg-slate-100 text-slate-700';
    if (jurisdiction === 'EU') return 'bg-slate-100 text-slate-700';
    return 'bg-gray-100 text-gray-700';
}

export function DataTransfers({
    vendorRisks,
    isOpen,
    onToggle,
    isPro
}: DataTransfersProps) {
    const nonEuTransfers = vendorRisks.filter(v =>
        v.dataTransfer === 'International' ||
        v.jurisdiction === 'USA' ||
        v.jurisdiction === 'China' ||
        v.jurisdiction === 'Russia' ||
        v.jurisdiction === 'India' ||
        !v.gdprCompliant
    );

    return (
        <div className="mb-4">
            <button onClick={onToggle} className="section-btn">
                <span className="flex items-center gap-2">
                    <span className="section-btn-title">Data Transfers Outside EU</span>
                    {nonEuTransfers.length > 0 ? (
                        <span className="badge-warning">
                            {nonEuTransfers.length} vendor{nonEuTransfers.length > 1 ? 's' : ''}
                        </span>
                    ) : (
                        <span className="badge-passed">EU Only</span>
                    )}
                </span>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    {nonEuTransfers.length > 0 ? (
                        <>
                            <div className="bg-white border border-orange-200 rounded-lg p-4 mb-4">
                                <p className="text-orange-800 text-sm">
                                    <strong>GDPR Article 44-49:</strong> Transfers to non-EU countries require adequate safeguards (SCCs, BCRs) or user consent.
                                </p>
                            </div>
                            <div className="space-y-3">
                                {nonEuTransfers.map((vendor, i) => (
                                    <div key={i} className={`p-3 rounded-lg border ${getVendorBorder(vendor)}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-slate-800">{vendor.name}</p>
                                                <p className="text-xs text-slate-500">{vendor.category}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-xs px-2 py-1 rounded ${getJurisdictionStyle(vendor.jurisdiction)}`}>
                                                    {vendor.jurisdiction}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2">
                                            {vendor.gdprCompliant ? (
                                                <span className="text-xs text-slate-600 flex items-center gap-1">
                                                    ✓ GDPR compliant (uses SCCs)
                                                </span>
                                            ) : (
                                                <span className="text-xs text-red-600 flex items-center gap-1">
                                                    ⚠ No GDPR adequacy decision
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {isPro && (
                                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                    <p className="text-sm text-slate-800 font-medium mb-2">Compliance Requirements:</p>
                                    <ul className="text-xs text-slate-700 list-disc list-inside space-y-1">
                                        <li>Ensure Standard Contractual Clauses (SCCs) are in place</li>
                                        <li>Document Transfer Impact Assessments (TIAs)</li>
                                        <li>Disclose international transfers in your privacy policy</li>
                                        <li>Consider EU-based alternatives for non-compliant vendors</li>
                                    </ul>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                            <span className="text-blue-600 font-bold text-lg">✓</span>
                            <div>
                                <p className="font-semibold text-blue-800">All Data Stays in EU</p>
                                <p className="text-sm text-blue-600">
                                    No third-party vendors transfer data outside the European Union.
                                </p>
                            </div>
                        </div>
                    )}
                    <p className="text-xs text-gray-400 mt-3">
                        * Based on vendor headquarters and known data processing locations.
                    </p>
                </div>
            )}
        </div>
    );
}
