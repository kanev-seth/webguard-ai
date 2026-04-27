import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ShieldAlert, ShieldCheck, AlertTriangle, BrainCircuit,
    Download, CheckCircle2, FileText, Activity, Sparkles, Clock
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AIReportData {
    summary:      string;
    riskLevel:    string;
    remediations: string[];
    anomalyCount: number;
    totalLines:   number;
    aiEnabled:    boolean;
    reportId:     string | null;
    filename:     string;
    generatedAt:  string;
}

interface Props {
    data: AIReportData | null;
    onClose: () => void;
}

// ─── Risk config ──────────────────────────────────────────────────────────────
const RISK: Record<string, { label: string; color: string; bg: string; border: string; icon: typeof ShieldCheck; glow: string }> = {
    LOW:      { label: 'LOW RISK',      color: 'text-emerald',    bg: 'bg-emerald/10',    border: 'border-emerald/25',    icon: ShieldCheck,   glow: 'shadow-emerald/20' },
    MEDIUM:   { label: 'MEDIUM RISK',   color: 'text-lavender',   bg: 'bg-lavender/10',   border: 'border-lavender/25',   icon: ShieldAlert,   glow: 'shadow-lavender/20' },
    HIGH:     { label: 'HIGH RISK',     color: 'text-terracotta', bg: 'bg-terracotta/10', border: 'border-terracotta/25', icon: AlertTriangle, glow: 'shadow-terracotta/20' },
    CRITICAL: { label: 'CRITICAL RISK', color: 'text-crimson',    bg: 'bg-crimson/10',    border: 'border-crimson/25',    icon: AlertTriangle, glow: 'shadow-crimson/20' },
};
const getRisk = (level: string) => RISK[level?.toUpperCase()] ?? RISK.MEDIUM;

// ─── Animated stat card ───────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub: string; color: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className={`flex-1 rounded-xl p-4 border ${color} flex flex-col gap-1`}
        >
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
            <span className="text-2xl font-bold">{value}</span>
            <span className="text-[11px] text-slate-600">{sub}</span>
        </motion.div>
    );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────
export function AIReportPanel({ data, onClose }: Props) {
    if (!data) return null;

    const risk        = getRisk(data.riskLevel);
    const RiskIcon    = risk.icon;
    const anomalyRate = data.totalLines ? ((data.anomalyCount / data.totalLines) * 100).toFixed(1) : '0.0';
    const formattedDate = new Date(data.generatedAt).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

    const handleDownloadCSV = async () => {
        if (!data.reportId) return;
        try {
            const r = await fetch(`http://localhost:5000/api/analysis/ai-reports/${data.reportId}/download`);
            if (!r.ok) throw new Error('Download failed');
            const blob = await r.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `Expert_Security_Report_${data.filename}.csv`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
        } catch {
            alert('Could not download CSV. Please try again.');
        }
    };

    return (
        <AnimatePresence>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(20px)' }}
                onClick={onClose}
            />

            {/* Panel */}
            <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 24 }}
                transition={{ type: 'spring', stiffness: 280, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="fixed z-50 inset-x-4 top-[5vh] bottom-[5vh] max-w-3xl mx-auto flex flex-col rounded-2xl overflow-hidden"
                style={{
                    background: 'linear-gradient(160deg, rgba(15,23,42,0.98) 0%, rgba(2,6,23,0.99) 100%)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: `0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.4), 0 0 120px rgba(189,178,255,0.06)`,
                }}
            >
                {/* ── Top accent line ────────────────────────────────────────── */}
                <div className={`h-0.5 w-full ${risk.color === 'text-crimson' ? 'bg-gradient-to-r from-crimson via-terracotta to-crimson' : risk.color === 'text-terracotta' ? 'bg-gradient-to-r from-terracotta via-yellow-500 to-terracotta' : risk.color === 'text-emerald' ? 'bg-gradient-to-r from-emerald via-teal-400 to-emerald' : 'bg-gradient-to-r from-lavender via-purple-400 to-lavender'} opacity-80`} />

                {/* ── Header ─────────────────────────────────────────────────── */}
                <div className="flex items-start justify-between p-6 pb-4 border-b border-white/[0.06] shrink-0">
                    <div className="flex items-start gap-4">
                        {/* Brand icon */}
                        <div className={`w-12 h-12 rounded-xl ${risk.bg} border ${risk.border} flex items-center justify-center shrink-0 shadow-lg ${risk.glow}`}>
                            <RiskIcon className={`w-6 h-6 ${risk.color}`} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">WebGuard AI</span>
                                <span className="text-slate-700">·</span>
                                <span className="text-[10px] text-slate-600 uppercase tracking-wider">Intelligence Briefing</span>
                            </div>
                            <h1 className="text-xl font-bold text-white leading-tight">Expert Security Report</h1>
                            <div className="flex items-center gap-3 mt-1.5">
                                {/* Risk badge */}
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${risk.bg} ${risk.border} ${risk.color} uppercase tracking-wider`}>
                                    {risk.label}
                                </span>
                                {data.aiEnabled ? (
                                    <span className="flex items-center gap-1 text-[10px] text-lavender bg-lavender/10 border border-lavender/20 px-2 py-0.5 rounded-full">
                                        <Sparkles className="w-2.5 h-2.5" /> AI Enhanced
                                    </span>
                                ) : (
                                    <span className="text-[10px] text-slate-600 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">
                                        Baseline Analysis
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <button onClick={onClose}
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                            <X className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-1 text-[10px] text-slate-600 font-mono">
                            <Clock className="w-2.5 h-2.5" />
                            {formattedDate}
                        </div>
                    </div>
                </div>

                {/* ── Scrollable body ─────────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-5">

                    {/* Stat row */}
                    <div className="flex gap-3">
                        <StatCard
                            label="Total Entries"
                            value={data.totalLines.toLocaleString()}
                            sub="log lines analysed"
                            color="border-white/10 bg-white/[0.03] text-white"
                        />
                        <StatCard
                            label="Anomalies Found"
                            value={data.anomalyCount}
                            sub={`${anomalyRate}% of traffic`}
                            color={data.anomalyCount > 0 ? 'border-crimson/20 bg-crimson/5 text-crimson' : 'border-emerald/20 bg-emerald/5 text-emerald'}
                        />
                        <StatCard
                            label="Clean Requests"
                            value={data.totalLines - data.anomalyCount}
                            sub="within normal range"
                            color="border-emerald/20 bg-emerald/5 text-emerald"
                        />
                        <StatCard
                            label="Threat Level"
                            value={data.riskLevel}
                            sub="overall classification"
                            color={`${risk.border} ${risk.bg} ${risk.color}`}
                        />
                    </div>

                    {/* Analysed file */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.025] border border-white/8">
                        <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="text-[11px] text-slate-500">Log file:</span>
                        <span className="text-[11px] text-slate-300 font-mono truncate">{data.filename}</span>
                    </div>

                    {/* Executive Summary */}
                    <div className="rounded-xl border border-white/8 overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.025] border-b border-white/8">
                            <Activity className="w-3.5 h-3.5 text-lavender" />
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                {data.aiEnabled ? 'AI Executive Summary' : 'Analysis Summary'}
                            </span>
                            {!data.aiEnabled && (
                                <span className="ml-auto text-[10px] text-slate-600 italic">Set HUGGINGFACE_API_KEY for AI-powered summary</span>
                            )}
                        </div>
                        <div className="p-5 bg-black/20">
                            <p className="text-sm text-slate-300 leading-7 tracking-wide">{data.summary}</p>
                        </div>
                    </div>

                    {/* Remediation Steps */}
                    {data.remediations.length > 0 && (
                        <div className="rounded-xl border border-white/8 overflow-hidden">
                            <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.025] border-b border-white/8">
                                <CheckCircle2 className="w-3.5 h-3.5 text-lavender" />
                                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                    {data.aiEnabled ? 'AI Remediation Recommendations' : 'Recommended Actions'}
                                </span>
                            </div>
                            <div className="p-4 bg-black/20 space-y-2.5">
                                {data.remediations.map((step, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.07 }}
                                        className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/8 hover:border-lavender/20 transition-colors group"
                                    >
                                        <div className="w-6 h-6 rounded-md bg-lavender/10 border border-lavender/20 flex items-center justify-center text-[11px] font-bold text-lavender shrink-0 group-hover:bg-lavender/15 transition-colors">
                                            {i + 1}
                                        </div>
                                        <p className="text-sm text-slate-300 leading-relaxed pt-0.5">{step}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* AI disclaimer / credit */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-600 px-1">
                        <BrainCircuit className="w-3.5 h-3.5 shrink-0" />
                        {data.aiEnabled
                            ? 'Analysis generated by Mistral-7B-Instruct via HuggingFace Inference API · WebGuard AI SOC Layer'
                            : 'Enable AI analysis by adding your HUGGINGFACE_API_KEY to the .env file and restarting the Node server.'}
                    </div>
                </div>

                {/* ── Footer actions ──────────────────────────────────────────── */}
                <div className="shrink-0 p-4 border-t border-white/[0.06] bg-black/30 flex items-center justify-between gap-3">
                    <button onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-all">
                        Close Briefing
                    </button>

                    <div className="flex items-center gap-2">
                        {data.reportId && (
                            <motion.button
                                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                onClick={handleDownloadCSV}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-lavender/30 text-lavender bg-lavender/8 hover:bg-lavender/15 text-sm font-semibold transition-all"
                            >
                                <Download className="w-4 h-4" />
                                Download Expert CSV
                            </motion.button>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={onClose}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-lavender to-purple-500 text-slate-900 text-sm font-bold btn-glow-lavender hover:shadow-lg hover:shadow-lavender/30 transition-all"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Acknowledged
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
