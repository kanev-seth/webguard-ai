import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, ShieldAlert, Shield, AlertTriangle } from 'lucide-react';
import type { AnalystRow } from '../../context/SecurityContext';

interface DataTableProps {
    rows: AnalystRow[];
    onEscalate: (row: AnalystRow) => void;
}

type SortKey = keyof Pick<AnalystRow, 'ip' | 'method' | 'status' | 'anomaly_score' | 'timestamp'>;

const COLS: { key: SortKey; label: string; width: string }[] = [
    { key: 'ip',            label: 'IP Address', width: 'w-32' },
    { key: 'timestamp',     label: 'Timestamp',  width: 'w-44' },
    { key: 'method',        label: 'Method',     width: 'w-20' },
    { key: 'status',        label: 'Status',     width: 'w-20' },
    { key: 'anomaly_score', label: 'Score',      width: 'w-24' },
];

const METHOD_COLORS: Record<string, string> = {
    GET:    'bg-emerald/10 text-emerald border border-emerald/20',
    POST:   'bg-lavender/10 text-lavender border border-lavender/20',
    DELETE: 'bg-crimson/10 text-crimson border border-crimson/20',
    PUT:    'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    PATCH:  'bg-blue-500/10 text-blue-400 border border-blue-500/20',
};

function ScoreBar({ score, isAnomaly }: { score: number; isAnomaly: boolean }) {
    // anomaly_score is negative for anomalies; normalise to 0–1 for display
    const pct = Math.min(100, Math.max(0, Math.abs(score) * 200));
    return (
        <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full rounded-full ${isAnomaly ? 'bg-crimson' : 'bg-emerald'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                />
            </div>
            <span className={`font-mono text-[10px] ${isAnomaly ? 'text-crimson' : 'text-emerald'}`}>
                {score.toFixed(3)}
            </span>
        </div>
    );
}

export function DataTable({ rows, onEscalate }: DataTableProps) {
    const [sortKey, setSortKey] = useState<SortKey>('anomaly_score');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [hoveredReason, setHoveredReason] = useState<{ row: AnalystRow; idx: number } | null>(null);

    // Sort: anomalies always float to top first
    const sorted = useMemo(() => {
        return [...rows].sort((a, b) => {
            // Anomalies first
            if (a.is_anomaly && !b.is_anomaly) return -1;
            if (!a.is_anomaly && b.is_anomaly) return 1;
            const va = a[sortKey] ?? '';
            const vb = b[sortKey] ?? '';
            const cmp = String(va) < String(vb) ? -1 : String(va) > String(vb) ? 1 : 0;
            return sortDir === 'asc' ? cmp : -cmp;
        });
    }, [rows, sortKey, sortDir]);

    const handleSort = (key: SortKey) => {
        if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('asc'); }
    };

    const anomalyCount = rows.filter(r => r.is_anomaly).length;
    const anomalyRate  = rows.length ? ((anomalyCount / rows.length) * 100).toFixed(1) : '0';

    return (
        <div className="flex flex-col h-full gap-2">
            {/* ── Stats bar ──────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 px-1 shrink-0 flex-wrap">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/8">
                    <Shield className="w-3 h-3 text-slate-500" />
                    <span className="text-[11px] text-slate-400 font-mono">{rows.length} entries</span>
                </div>
                {anomalyCount > 0 && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-crimson/10 border border-crimson/25"
                    >
                        <AlertTriangle className="w-3 h-3 text-crimson animate-pulse" />
                        <span className="text-[11px] text-crimson font-bold font-mono">{anomalyCount} THREATS DETECTED ({anomalyRate}%)</span>
                    </motion.div>
                )}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald/[0.07] border border-emerald/15">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald inline-block" />
                    <span className="text-[11px] text-emerald font-mono">{rows.length - anomalyCount} clean</span>
                </div>
                <span className="ml-auto text-[10px] text-slate-700">Click column header to sort · Anomalies pinned to top</span>
            </div>

            {/* ── Table ──────────────────────────────────────────────────── */}
            <div className="flex-1 overflow-auto scrollbar-thin rounded-xl border border-white/10 relative">
                <table className="w-full text-xs border-collapse">
                    {/* Sticky header */}
                    <thead className="sticky top-0 z-10 border-b border-white/10"
                        style={{ background: 'rgba(2,6,23,0.97)', backdropFilter: 'blur(12px)' }}>
                        <tr>
                            {/* Threat indicator column */}
                            <th className="w-8 px-2 py-3" />
                            {COLS.map((c) => (
                                <th
                                    key={c.key}
                                    onClick={() => handleSort(c.key)}
                                    className={`${c.width} px-4 py-3 text-left font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none whitespace-nowrap`}
                                >
                                    <span className="flex items-center gap-1.5">
                                        {c.label}
                                        <ArrowUpDown className={`w-3 h-3 ${sortKey === c.key ? 'text-lavender' : 'opacity-20'}`} />
                                    </span>
                                </th>
                            ))}
                            <th className="px-4 py-3 text-left font-bold text-slate-400 uppercase tracking-wider">URL / Request</th>
                            <th className="px-4 py-3 text-left font-bold text-slate-400 uppercase tracking-wider w-32">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        <AnimatePresence initial={false}>
                            {sorted.map((row, i) => (
                                <motion.tr
                                    key={`${row.ip}-${row.timestamp}-${i}`}
                                    initial={{ opacity: 0, x: -4 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: Math.min(i * 0.008, 0.3) }}
                                    className={`border-b group transition-colors ${
                                        row.is_anomaly
                                            ? 'border-crimson/15 bg-crimson/[0.06] hover:bg-crimson/[0.10]'
                                            : 'border-white/[0.04] hover:bg-white/[0.03]'
                                    }`}
                                >
                                    {/* Threat indicator strip */}
                                    <td className="px-2 py-2.5">
                                        {row.is_anomaly
                                            ? <div className="w-1 h-5 rounded-full bg-crimson shadow-[0_0_6px_rgba(220,38,38,0.8)] mx-auto" />
                                            : <div className="w-1 h-5 rounded-full bg-emerald/30 mx-auto" />
                                        }
                                    </td>

                                    {/* IP — highlight if anomaly */}
                                    <td className="px-4 py-2.5 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className={`font-mono font-bold ${row.is_anomaly ? 'text-crimson' : 'text-slate-300'}`}>
                                                {row.ip}
                                            </span>
                                            {row.is_anomaly && (
                                                <span className="text-[9px] text-crimson/70 font-bold uppercase tracking-wider mt-0.5">⚠ Flagged</span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Timestamp */}
                                    <td className="px-4 py-2.5 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                                        {row.timestamp.slice(0, 19).replace('T', ' ')}
                                    </td>

                                    {/* Method */}
                                    <td className="px-4 py-2.5">
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${METHOD_COLORS[row.method] ?? 'bg-white/5 text-slate-400 border border-white/10'}`}>
                                            {row.method || '—'}
                                        </span>
                                    </td>

                                    {/* Status */}
                                    <td className={`px-4 py-2.5 font-mono font-bold text-sm ${
                                        row.status >= 500 ? 'text-crimson'
                                        : row.status >= 400 ? 'text-amber-400'
                                        : 'text-emerald'
                                    }`}>
                                        {row.status}
                                    </td>

                                    {/* Anomaly score bar */}
                                    <td className="px-4 py-2.5">
                                        <ScoreBar score={row.anomaly_score} isAnomaly={row.is_anomaly} />
                                    </td>

                                    {/* URL with reasons tooltip */}
                                    <td className="px-4 py-2.5 max-w-[220px]">
                                        <div className="relative">
                                            <span
                                                className={`font-mono text-[11px] block truncate ${row.is_anomaly ? 'text-crimson/80' : 'text-slate-400'}`}
                                                title={row.url}
                                            >
                                                {row.url}
                                            </span>
                                            {row.is_anomaly && row.reasons.length > 0 && (
                                                <div className="mt-0.5 flex flex-wrap gap-1">
                                                    {row.reasons.slice(0, 1).map((r, ri) => (
                                                        <span key={ri} className="text-[9px] text-crimson/60 bg-crimson/5 border border-crimson/10 px-1.5 py-0.5 rounded truncate max-w-[200px]">
                                                            {r}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Escalate */}
                                    <td className="px-3 py-2">
                                        {row.is_anomaly ? (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={(e) => { e.stopPropagation(); onEscalate(row); }}
                                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border border-lavender/40 bg-lavender/10 text-lavender hover:bg-lavender hover:text-slate-900 shadow-[0_0_10px_rgba(189,178,255,0.15)] hover:shadow-[0_0_16px_rgba(189,178,255,0.4)] transition-all whitespace-nowrap"
                                            >
                                                <ShieldAlert className="w-3 h-3" />
                                                Escalate
                                            </motion.button>
                                        ) : (
                                            <span className="text-[10px] text-slate-700 px-2">—</span>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
