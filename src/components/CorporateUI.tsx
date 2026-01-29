/**
 * Reusable Corporate UI Components for Audit Results
 * Clean, professional styling for B2B presentation
 */

import React from 'react';

// Section Header with Icon and Status Badge
interface SectionHeaderProps {
    icon?: React.ReactNode;
    title: string;
    status?: 'passed' | 'warning' | 'failed' | 'info';
    statusText?: string;
    isOpen: boolean;
    onClick: () => void;
    count?: number;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
    icon,
    title,
    status,
    statusText,
    isOpen,
    onClick,
    count
}) => {
    const getStatusStyle = () => {
        switch (status) {
            case 'passed':
                return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
            case 'warning':
                return 'bg-amber-50 text-amber-700 border border-amber-200';
            case 'failed':
                return 'bg-red-50 text-red-700 border border-red-200';
            case 'info':
            default:
                return 'bg-slate-50 text-slate-600 border border-slate-200';
        }
    };

    return (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between py-3 px-4 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition mb-2"
        >
            <div className="flex items-center gap-3">
                {icon && <span className="text-slate-500">{icon}</span>}
                <span className="font-medium text-slate-800">{title}</span>
                {statusText && (
                    <span className={`text-xs px-2 py-0.5 rounded ${getStatusStyle()}`}>
                        {statusText}
                    </span>
                )}
                {count !== undefined && count > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {count}
                    </span>
                )}
            </div>
            <svg
                className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
    );
};

// Section Container
interface SectionContentProps {
    children: React.ReactNode;
    isOpen: boolean;
}

export const SectionContent: React.FC<SectionContentProps> = ({ children, isOpen }) => {
    if (!isOpen) return null;
    return (
        <div className="bg-white border border-slate-200 rounded-lg p-5 mb-4">
            {children}
        </div>
    );
};

// Stats Grid
interface StatItem {
    label: string;
    value: string | number;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

interface StatsGridProps {
    items: StatItem[];
    columns?: 2 | 3 | 4;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ items, columns = 3 }) => {
    const getVariantStyle = (variant?: string) => {
        switch (variant) {
            case 'success':
                return 'bg-emerald-50 border-emerald-200 text-emerald-700';
            case 'warning':
                return 'bg-amber-50 border-amber-200 text-amber-700';
            case 'danger':
                return 'bg-red-50 border-red-200 text-red-700';
            case 'info':
                return 'bg-blue-50 border-blue-200 text-blue-700';
            default:
                return 'bg-slate-50 border-slate-200 text-slate-700';
        }
    };

    const colsClass = columns === 4 ? 'grid-cols-4' : columns === 3 ? 'grid-cols-3' : 'grid-cols-2';

    return (
        <div className={`grid ${colsClass} gap-3 mb-4`}>
            {items.map((item, i) => (
                <div
                    key={i}
                    className={`p-3 rounded-lg border text-center ${getVariantStyle(item.variant)}`}
                >
                    <p className="text-2xl font-bold">{item.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>
                </div>
            ))}
        </div>
    );
};

// Issue List Item
interface IssueItemProps {
    title: string;
    description?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    recommendation?: string;
    showRecommendation?: boolean;
}

export const IssueItem: React.FC<IssueItemProps> = ({
    title,
    description,
    severity,
    recommendation,
    showRecommendation = false
}) => {
    const getSeverityStyle = () => {
        switch (severity) {
            case 'critical':
                return 'border-l-red-500 bg-red-50';
            case 'high':
                return 'border-l-orange-500 bg-orange-50';
            case 'medium':
                return 'border-l-amber-500 bg-amber-50';
            case 'low':
            default:
                return 'border-l-slate-300 bg-slate-50';
        }
    };

    const getSeverityBadge = () => {
        switch (severity) {
            case 'critical':
                return 'bg-red-100 text-red-700';
            case 'high':
                return 'bg-orange-100 text-orange-700';
            case 'medium':
                return 'bg-amber-100 text-amber-700';
            default:
                return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className={`p-3 rounded-lg border-l-4 ${getSeverityStyle()}`}>
            <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-slate-800 text-sm">{title}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${getSeverityBadge()}`}>
                    {severity}
                </span>
            </div>
            {description && (
                <p className="text-xs text-slate-600">{description}</p>
            )}
            {showRecommendation && recommendation && (
                <p className="text-xs text-blue-600 mt-2 flex items-start gap-1">
                    <span>💡</span>
                    <span>{recommendation}</span>
                </p>
            )}
        </div>
    );
};

// Success Message
interface SuccessMessageProps {
    title: string;
    description?: string;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ title, description }) => (
    <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        </div>
        <div>
            <p className="font-medium text-emerald-800">{title}</p>
            {description && <p className="text-sm text-emerald-600">{description}</p>}
        </div>
    </div>
);

// Disclaimer Footer
interface DisclaimerProps {
    text: string;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ text }) => (
    <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100">
        {text}
    </p>
);

// Check Mark Item for simple pass/fail
interface CheckItemCorporateProps {
    passed: boolean;
    label: string;
}

export const CheckItemCorporate: React.FC<CheckItemCorporateProps> = ({ passed, label }) => (
    <span className={`flex items-center gap-2 text-xs ${passed ? 'text-slate-700' : 'text-red-600'}`}>
        {passed ? (
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        ) : (
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        )}
        {label}
    </span>
);
