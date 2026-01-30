'use client';

import { MaskedText } from '@/components/ProGate';

interface VendorRiskItem {
    name: string;
    category: string;
    jurisdiction: string;
    riskScore: number;
    riskLevel: 'critical' | 'high' | 'medium' | 'low';
    gdprCompliant: boolean;
    dataTransfer: 'EU' | 'US' | 'CN' | 'International' | string;
    concerns: string[];
}

interface VendorRiskProps {
    vendorRisks: VendorRiskItem[];
    isOpen: boolean;
    onToggle: () => void;
    isPro: boolean;
}

function getRiskBorder(riskScore: number): string {
    if (riskScore >= 8) return 'border-red-300';
    if (riskScore >= 6) return 'border-orange-300';
    if (riskScore >= 4) return 'border-yellow-300';
    return 'border-blue-300';
}

function getRiskBgColor(riskScore: number): string {
    if (riskScore >= 8) return 'bg-red-500';
    if (riskScore >= 6) return 'bg-orange-500';
    if (riskScore >= 4) return 'bg-yellow-500';
    return 'bg-blue-500';
}

function getRiskLevelStyle(riskLevel: string): string {
    switch (riskLevel) {
        case 'critical': return 'bg-white text-red-700';
        case 'high': return 'bg-white text-orange-700';
        case 'medium': return 'bg-white text-yellow-700';
        default: return 'bg-white text-blue-700';
    }
}

function getTransferColor(dataTransfer: string): string {
    if (dataTransfer === 'EU') return 'text-blue-600';
    if (dataTransfer === 'CN') return 'text-red-600';
    return 'text-orange-600';
}

function getTransferLabel(dataTransfer: string): string {
    switch (dataTransfer) {
        case 'EU': return 'EU (adequate)';
        case 'US': return 'USA';
        case 'CN': return 'China';
        default: return 'Other';
    }
}

export function VendorRisk({
    vendorRisks,
    isOpen,
    onToggle,
    isPro
}: VendorRiskProps) {
    if (vendorRisks.length === 0) {
        return null;
    }

    return (
        <div className="mb-6">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between text-lg font-semibold text-slate-800 mb-3 hover:text-slate-600 transition"
            >
                <span>Vendor Risk Assessment</span>
                <svg className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <p className="text-slate-600 text-xs mb-4">
                        Privacy risk evaluation of third-party vendors. Higher scores indicate greater concerns.
                    </p>
                    <div className="space-y-3">
                        {vendorRisks.map((vendor, i) => (
                            <div key={i} className={`bg-white border rounded-lg p-4 ${getRiskBorder(vendor.riskScore)}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold text-white ${getRiskBgColor(vendor.riskScore)}`}>
                                            {vendor.riskScore}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900"><MaskedText text={vendor.name} show={isPro} /></h4>
                                            <p className="text-xs text-gray-500 capitalize">{vendor.category} • <MaskedText text={vendor.jurisdiction} show={isPro} /></p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelStyle(vendor.riskLevel)}`}>
                                            {vendor.riskLevel.toUpperCase()}
                                        </span>
                                        {vendor.gdprCompliant ? (
                                            <span className="px-2 py-1 bg-white text-blue-700 rounded-full text-xs font-medium">GDPR ✓</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-white text-red-700 rounded-full text-xs font-medium">GDPR ✗</span>
                                        )}
                                    </div>
                                </div>
                                {vendor.concerns.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {vendor.concerns.map((concern, j) => (
                                            <span key={j} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                                {concern}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="mt-2 text-xs text-gray-400">
                                    Data transfer: <span className={`font-medium ${getTransferColor(vendor.dataTransfer)}`}>
                                        {getTransferLabel(vendor.dataTransfer)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="flex gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500"></span> 8-10: Critical</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500"></span> 6-7: High</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500"></span> 4-5: Medium</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500"></span> 1-3: Low</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
