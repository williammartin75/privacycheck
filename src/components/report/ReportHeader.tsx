'use client';

import { ScoreGauge } from './ScoreGauge';
import { getScoreLabel } from '@/lib/score-utils';

interface ReportHeaderProps {
    domain: string;
    score: number;
    regulations: string[];
    pagesScanned: number;
    issuesCount: number;
    passedCount: number;
}

export function ReportHeader({
    domain,
    score,
    regulations,
    pagesScanned,
    issuesCount,
    passedCount
}: ReportHeaderProps) {
    const scoreLabel = getScoreLabel(score);

    return (
        <>
            {/* Report Metadata */}
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-100">
                <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Privacy Audit Report</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                        Ref: RPT-{new Date().toISOString().slice(0, 10).replace(/-/g, '')}-{domain.slice(0, 4).toUpperCase()}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-400">
                        Generated: {new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Audit Engine v2.1</p>
                </div>
            </div>

            {/* Header with Score Gauge */}
            <div className="flex flex-col md:flex-row items-center gap-8 mb-8 pb-8 border-b border-slate-100">
                {/* Score Circle */}
                <ScoreGauge score={score} size="md" />

                {/* Site Info */}
                <div className="flex-1 text-center md:text-left">
                    <p className="text-slate-800 text-2xl font-semibold mb-3">{domain}</p>
                    <div className={`inline-block px-3 py-1.5 rounded text-xs font-semibold ${scoreLabel.bg} ${scoreLabel.text}`}>
                        {scoreLabel.label} • {scoreLabel.sublabel}
                    </div>
                    <div className="flex gap-2 mt-3 flex-wrap justify-center md:justify-start">
                        {regulations?.map((reg, i) => (
                            <span key={i} className="px-2 py-0.5 bg-white text-slate-600 text-xs rounded font-medium border border-slate-300">
                                {reg}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Executive Summary */}
                <div className="flex-shrink-0">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">Summary</p>
                    <div className="grid grid-cols-1 gap-2 min-w-[220px]">
                        <div className="flex items-center justify-between px-3 py-2 bg-white rounded border border-slate-300">
                            <span className="text-xs text-red-600">Issues Found</span>
                            <span className="font-bold text-red-600">{issuesCount}</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 bg-white rounded border border-slate-300">
                            <span className="text-xs text-slate-700">Checks Passed</span>
                            <span className="font-bold text-slate-800">{passedCount}</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 bg-white rounded border border-slate-300">
                            <span className="text-xs text-slate-700">Pages Scanned</span>
                            <span className="font-bold text-slate-800">{pagesScanned}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
