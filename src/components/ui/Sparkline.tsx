import { useMemo } from 'react';

interface SparklineProps {
    data?: number[];
    width?: number;
    height?: number;
    color?: string;
}

// 24 mock traffic-volume data points (requests per hour, last 24 hours)
const DEFAULT_DATA = [
    142, 198, 167, 134, 109, 88, 74, 68, 92, 134,
    178, 224, 251, 237, 288, 312, 298, 264, 233, 201,
    312, 345, 287, 241
];

export function Sparkline({ data = DEFAULT_DATA, width = 120, height = 36, color = '#BDB2FF' }: SparklineProps) {
    const points = useMemo(() => {
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;
        return data.map((v, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((v - min) / range) * (height - 4) - 2;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(' ');
    }, [data, width, height]);

    const fillPoints = `0,${height} ${points} ${width},${height}`;
    const gradId = `spark-grad-${color.replace('#', '')}`;

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                </linearGradient>
            </defs>
            {/* Fill */}
            <polygon points={fillPoints} fill={`url(#${gradId})`} />
            {/* Line */}
            <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
    );
}
