'use client';

interface ScoreGaugeProps {
    score: number;
    size?: 'sm' | 'md' | 'lg';
}

export function ScoreGauge({ score, size = 'md' }: ScoreGaugeProps) {
    const color = score >= 80 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626';

    const sizeClasses = {
        sm: 'w-20 h-20',
        md: 'w-32 h-32',
        lg: 'w-40 h-40'
    };

    const textSizes = {
        sm: { score: 'text-xl', percent: 'text-sm' },
        md: { score: 'text-3xl', percent: 'text-xl' },
        lg: { score: 'text-4xl', percent: 'text-2xl' }
    };

    // SVG circle dimensions based on size
    const dimensions = {
        sm: { cx: 40, cy: 40, r: 35, strokeWidth: 8 },
        md: { cx: 64, cy: 64, r: 56, strokeWidth: 10 },
        lg: { cx: 80, cy: 80, r: 70, strokeWidth: 12 }
    };

    const d = dimensions[size];
    const circumference = 2 * Math.PI * d.r;
    const dashArray = `${score * (circumference / 100)} ${circumference}`;

    return (
        <div className="relative">
            <svg className={`${sizeClasses[size]} transform -rotate-90`}>
                <circle
                    cx={d.cx}
                    cy={d.cy}
                    r={d.r}
                    stroke="#e2e8f0"
                    strokeWidth={d.strokeWidth}
                    fill="none"
                />
                <circle
                    cx={d.cx}
                    cy={d.cy}
                    r={d.r}
                    stroke={color}
                    strokeWidth={d.strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={dashArray}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span style={{ color }} className={`${textSizes[size].score} font-bold`}>
                    {score}
                </span>
                <span style={{ color }} className={`${textSizes[size].percent} font-bold`}>
                    %
                </span>
            </div>
        </div>
    );
}
