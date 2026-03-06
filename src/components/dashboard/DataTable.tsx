import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, ShieldAlert } from 'lucide-react';
import type { AnalystRow } from '../../context/SecurityContext';

interface DataTableProps {
    rows: AnalystRow[];
    onEscalate: (row: AnalystRow) => void;
}

type SortKey = keyof Pick<AnalystRow, 'ip' | 'method' | 'status' | 'anomaly_score' | 'timestamp'>;

const COLS: { key: SortKey; label: string; width: string }[] = [
    { key: 'ip',            label: 'IP Address', width: 'w-32' },
    { key: 'timestamp',     label: 'Timestamp',  width: 'w-40' },
    { key: 'method',        label: 'Method',     width: 'w-20' },
    { key: 'status',        label: 'Status',     width: 'w-20' },
    { key: 'anomaly_score', label: 'Score',      width: 'w-24' },
];

const METHOD_COLORS: Record<string, string> = {
    GET:    'bg-emerald/10 text-emerald',
    POST:   'bg-lavender/10 text-lavender',
    DELETE: 'bg-crimson/10 text-crimson',
    PUT:    'bg-amber-500/10 text-amber-400',
};

export function DataTable({ rows, onEscalate }: DataTableProps) {
    const [sortKey, setSortKey] = useState<SortKey>('anomaly_score');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const sorted = useMemo(() => {
        return [...rows].sort((a, b) => {
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

    return (
        <div className="flex flex-col h-full">
            {/* Stats bar */}
            <div className="flex items-center gap-4 mb-3 px-1">
                <span className="text-xs text-slate-500">{rows.length} entries</span>
                <span className="text-xs text-crimson font-mono">{anomalyCount} anomalies</span>
                <span className="text-xs text-emerald font-mono">{rows.length - anomalyCount} normal</span>
            </div>

            {/* Table wrapper */}
            <div className="flex-1 overflow-auto scrollbar-thin rounded-xl border border-white/10">
                <table className="w-full text-xs border-collapse">
                    {/* Sticky header */}
                    <thead className="sticky top-0 z-10 bg-slate-950 border-b border-white/10">
                        <tr>
                            {COLS.map((c) => (
                                <th
                                    key={c.key}
                                    onClick={() => handleSort(c.key)}
                                    className={`${c.width} px-4 py-3 text-left font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none whitespace-nowrap`}
                                >
                                    <span className="flex items-center gap-1">
                                        {c.label}
                                        <ArrowUpDown className={`w-3 h-3 ${sortKey === c.key ? 'text-lavender' : 'opacity-30'}`} />
                                    </span>
                                </th>
                            ))}
                            <th className="px-4 py-3 text-left font-semibold text-slate-400 uppercase tracking-wider">URL</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-400 uppercase tracking-wider w-16">Flag</th>
                            {/* ── NEW: Actions column ── */}
                            <th className="px-4 py-3 text-left font-semibold text-slate-400 uppercase tracking-wider w-32">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        <AnimatePresence initial={false}>
                            {sorted.map((row, i) => (
                                <motion.tr
                                    key={`${row.ip}-${row.timestamp}-${i}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: Math.min(i * 0.012, 0.4) }}
                                    className={`
                                        border-b transition-colors
                                        ${row.is_anomaly
                                            ? 'border-crimson/20 bg-crimson/5 hover:bg-crimson/10 border-l-2 border-l-crimson'
                                            : 'border-white/5 hover:bg-white/4'
                                        }
                                    `}
                                >
                                    <td className="px-4 py-2.5 font-mono text-slate-300 whitespace-nowrap">{row.ip}</td>
                                    <td className="px-4 py-2.5 font-mono text-slate-500 whitespace-nowrap">{row.timestamp.slice(0, 20)}</td>
                                    <td className="px-4 py-2.5">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${METHOD_COLORS[row.method] ?? 'bg-white/5 text-slate-400'}`}>
                                            {row.method}
                                        </span>
                                    </td>
                                    <td className={`px-4 py-2.5 font-mono font-semibold ${row.status >= 500 ? 'text-crimson' : row.status >= 400 ? 'text-amber-400' : 'text-emerald'}`}>
                                        {row.status}
                                    </td>
                                    <td className={`px-4 py-2.5 font-mono ${row.is_anomaly ? 'text-crimson' : 'text-emerald'}`}>
                                        {row.anomaly_score.toFixed(3)}
                                    </td>
                                    <td className="px-4 py-2.5 font-mono text-slate-400 max-w-[200px] truncate">{row.url}</td>
                                    <td className="px-4 py-2.5 text-center">
                                        {row.is_anomaly
                                            ? <span className="inline-block w-2 h-2 rounded-full bg-crimson animate-pulse" title="Anomaly" />
                                            : <span className="inline-block w-2 h-2 rounded-full bg-emerald" title="Normal" />
                                        }
                                    </td>

                                    {/* ── Actions cell ── */}
                                    <td className="px-3 py-2">
                                        {row.is_anomaly ? (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={(e) => { e.stopPropagation(); onEscalate(row); }}
                                                className="
                                                    flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold
                                                    border border-lavender/40 bg-lavender/10 text-lavender
                                                    hover:bg-lavender hover:text-slate-900
                                                    shadow-[0_0_10px_rgba(189,178,255,0.15)]
                                                    hover:shadow-[0_0_16px_rgba(189,178,255,0.4)]
                                                    transition-all whitespace-nowrap
                                                "
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
