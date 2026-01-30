// Score Utility Functions - Extracted from page.tsx
// Pure functions for score display formatting

export const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-700';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-700';
};

export const getScoreLabel = (score: number): {
    label: string;
    sublabel: string;
    bg: string;
    text: string;
} => {
    if (score >= 80) return {
        label: 'Compliant',
        sublabel: 'Low Risk',
        bg: 'border border-green-600',
        text: 'text-green-600'
    };
    if (score >= 50) return {
        label: 'Improvements Required',
        sublabel: 'Medium Risk',
        bg: 'border border-amber-600',
        text: 'text-amber-600'
    };
    return {
        label: 'Non-Compliant',
        sublabel: 'High Risk',
        bg: 'border border-red-600',
        text: 'text-red-600'
    };
};

export const getCategoryColor = (category: string): string => {
    switch (category) {
        case 'necessary': return 'bg-white text-slate-700';
        case 'analytics': return 'bg-blue-600 text-white';
        case 'marketing': return 'bg-sky-200 text-sky-800';
        case 'preferences': return 'bg-amber-400 text-amber-900';
        default: return 'bg-gray-100 text-gray-700';
    }
};

export const getSeverityColor = (severity: 'low' | 'medium' | 'high' | 'critical'): string => {
    switch (severity) {
        case 'critical': return 'bg-red-100 text-red-800 border-red-200';
        case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
        case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

export const getRiskBadgeColor = (riskLevel: 'low' | 'medium' | 'high' | 'critical'): string => {
    switch (riskLevel) {
        case 'critical': return 'bg-red-600 text-white';
        case 'high': return 'bg-orange-500 text-white';
        case 'medium': return 'bg-amber-500 text-white';
        case 'low': return 'bg-green-500 text-white';
        default: return 'bg-gray-500 text-white';
    }
};
