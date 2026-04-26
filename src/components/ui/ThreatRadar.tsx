import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis,
    PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from 'recharts';

export interface ThreatRadarData {
    subject: string;
    value:   number;
    fullMark: number;
}

interface ThreatRadarProps {
    data?: ThreatRadarData[];
    color?: string;
}

const DEFAULT_DATA: ThreatRadarData[] = [
    { subject: 'Injection',   value: 0, fullMark: 100 },
    { subject: 'Exfil',       value: 0, fullMark: 100 },
    { subject: 'BruteForce',  value: 0, fullMark: 100 },
    { subject: 'Traversal',   value: 0, fullMark: 100 },
    { subject: 'Recon',       value: 0, fullMark: 100 },
    { subject: 'DDoS',        value: 0, fullMark: 100 },
];

// ── Keyword → axis mapping ────────────────────────────────────────────────────
const KEYWORD_MAP: Record<string, string> = {
    'sql':        'Injection',
    'inject':     'Injection',
    'union':      'Injection',
    'script':     'Injection',
    'data':       'Exfil',
    'exfil':      'Exfil',
    'large':      'Exfil',
    'bytes':      'Exfil',
    'password':   'BruteForce',
    'login':      'BruteForce',
    'auth':       'BruteForce',
    'brute':      'BruteForce',
    'wp-login':   'BruteForce',
    'traversal':  'Traversal',
    'etc/passwd': 'Traversal',
    '../':        'Traversal',
    'path':       'Traversal',
    'scan':       'Recon',
    'probe':      'Recon',
    'recon':      'Recon',
    'nmap':       'Recon',
    'flood':      'DDoS',
    'ddos':       'DDoS',
    'velocity':   'DDoS',
    'high-rate':  'DDoS',
};

/**
 * Compute ThreatRadar data from an array of anomaly rows.
 * Iterates reasons strings and maps keywords to threat categories.
 */
export function computeThreatData(rows: { is_anomaly: boolean; reasons: string[] }[]): ThreatRadarData[] {
    const counts: Record<string, number> = {
        Injection: 0, Exfil: 0, BruteForce: 0,
        Traversal: 0, Recon: 0, DDoS: 0,
    };

    rows.filter((r) => r.is_anomaly).forEach((r) => {
        const combined = r.reasons.join(' ').toLowerCase();
        Object.entries(KEYWORD_MAP).forEach(([kw, cat]) => {
            if (combined.includes(kw)) counts[cat] += 1;
        });
    });

    const maxVal = Math.max(...Object.values(counts), 1);

    return Object.entries(counts).map(([subject, raw]) => ({
        subject,
        value:    Math.round((raw / maxVal) * 100),
        fullMark: 100,
    }));
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload as ThreatRadarData;
    return (
        <div className="bg-slate-900/95 border border-white/10 rounded-lg px-3 py-2 text-xs">
            <p className="font-bold text-white mb-0.5">{d.subject}</p>
            <p className="text-lavender">Threat Score: <span className="font-mono">{d.value}</span></p>
        </div>
    );
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ThreatRadar({ data, color = '#BDB2FF' }: ThreatRadarProps) {
    const chartData = data && data.some((d) => d.value > 0) ? data : DEFAULT_DATA;
    const hasData   = chartData.some((d) => d.value > 0);

    return (
        <div className="relative w-full h-full flex flex-col">
            <div className="flex items-center justify-between mb-2 shrink-0">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Threat Distribution
                </h3>
                {!hasData && (
                    <span className="text-[10px] text-slate-600 font-mono">
                        Awaiting data…
                    </span>
                )}
            </div>

            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={chartData} margin={{ top: 8, right: 20, bottom: 8, left: 20 }}>
                        <PolarGrid
                            gridType="polygon"
                            stroke="rgba(255,255,255,0.07)"
                        />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
                        />
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tick={false}
                            axisLine={false}
                        />
                        <Radar
                            name="Threats"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={1.5}
                            fill={color}
                            fillOpacity={hasData ? 0.18 : 0.04}
                            dot={hasData ? { r: 3, fill: color, strokeWidth: 0 } : false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
