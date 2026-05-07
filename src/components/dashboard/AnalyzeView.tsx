import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useSpring, useTransform, animate } from 'framer-motion';
import { BrainCircuit, UploadCloud, Download, AlertTriangle, Inbox, FileText, Clock, Zap, Sparkles, ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { AnalystRow } from '../../context/SecurityContext';
import { useSecurity } from '../../context/SecurityContext';
import { DataTable } from './DataTable';
import { AnalystNoteModal } from './AnalystNoteModal';
import { ThreatRadar, computeThreatData } from '../ui/ThreatRadar';
import { SkeletonTable } from '../ui/SkeletonLoader';
import { AIReportPanel, type AIReportData } from '../ui/AIReportPanel';

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedNumber({ value, className }: { value: number; className?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        const controls = animate(0, value, {
            duration: 1.2, ease: 'easeOut',
            onUpdate: (v) => { node.textContent = Math.round(v).toString(); },
        });
        return () => controls.stop();
    }, [value]);
    return <span ref={ref} className={className}>0</span>;
}

// ─── Immersive LLM Overlay ────────────────────────────────────────────────────
function LLMFullscreenOverlay() {
    const [phase, setPhase] = useState(0);
    const phases = [
        'Ingesting anomaly vectors…',
        'Correlating threat signatures…',
        'Consulting WebGuard Intelligence…',
        'Engineering remediation strategies…',
        'Compiling Expert Security Report…',
    ];
    useEffect(() => {
        const id = setInterval(() => setPhase((p) => (p + 1) % phases.length), 2200);
        return () => clearInterval(id);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: 'rgba(2,6,23,0.93)', backdropFilter: 'blur(40px)' }}
        >
            {/* Orbit particles */}
            <div className="relative w-36 h-36 flex items-center justify-center mb-8">
                <div className="absolute inset-0 rounded-full border border-lavender/10" />
                <div className="absolute inset-4 rounded-full border border-lavender/15" />
                <div className="absolute inset-0 rounded-full bg-lavender/5 blur-2xl" />
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2.5 h-2.5 rounded-full bg-lavender"
                        style={{ boxShadow: '0 0 12px #BDB2FF' }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2.5 + i * 1.2, repeat: Infinity, ease: 'linear', delay: i * 0.8 }}
                        initial={{ x: (50 + i * 18) }}
                    />
                ))}
                <motion.div
                    animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <BrainCircuit className="w-14 h-14 text-lavender relative z-10" style={{ filter: 'drop-shadow(0 0 20px #BDB2FF)' }} />
                </motion.div>
            </div>

            <motion.p
                key={phase}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="text-lavender font-bold text-lg tracking-widest uppercase mb-2 text-glow-primary"
            >
                {phases[phase]}
            </motion.p>
            <p className="text-slate-500 text-xs font-mono">Mistral-7B-Instruct · SOC Intelligence Layer</p>

            {/* Progress dots */}
            <div className="flex gap-2 mt-6">
                {phases.map((_, i) => (
                    <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        animate={{ backgroundColor: i <= phase ? '#BDB2FF' : 'rgba(255,255,255,0.1)', scale: i === phase ? 1.4 : 1 }}
                        transition={{ duration: 0.3 }}
                    />
                ))}
            </div>
        </motion.div>
    );
}

// ─── Streaming AI Reasoning Panel ─────────────────────────────────────────────
function AIReasoningPanel({ text, isActive }: { text: string; isActive: boolean }) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
    }, [text]);
    if (!isActive && !text) return null;
    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="glass-panel rounded-xl overflow-hidden shrink-0"
        >
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/8 bg-lavender/5">
                <motion.div animate={{ opacity: isActive ? [0.4, 1, 0.4] : 1 }} transition={{ duration: 1.4, repeat: isActive ? Infinity : 0 }}>
                    <Sparkles className="w-3.5 h-3.5 text-lavender" />
                </motion.div>
                <span className="text-xs font-bold text-lavender tracking-wider uppercase">AI Reasoning Stream</span>
                {isActive && <span className="ml-auto text-[10px] text-lavender/60 font-mono animate-pulse">● LIVE</span>}
            </div>
            <div ref={ref} className="max-h-36 overflow-y-auto scrollbar-thin p-4">
                <pre className={`text-xs text-slate-400 font-mono whitespace-pre-wrap leading-relaxed ${isActive ? 'typewriter-cursor' : ''}`}>
                    {text || '▶ Waiting for analysis to begin…'}
                </pre>
            </div>
        </motion.div>
    );
}

// ─── Metric Bento Card ────────────────────────────────────────────────────────
function MetricBento({ label, value, sub, color }: { label: string; value: number; sub: string; color: 'lavender' | 'crimson' | 'emerald' }) {
    const colors = {
        lavender: 'text-lavender border-lavender/20 bg-lavender/5',
        crimson:  'text-crimson  border-crimson/20  bg-crimson/5',
        emerald:  'text-emerald  border-emerald/20  bg-emerald/5',
    };
    return (
        <motion.div
            whileHover={{ scale: 1.04, y: -2 }}
            className={`bento-card glass-panel rounded-xl p-4 border ${colors[color]} flex flex-col gap-1`}
        >
            <span className="text-[10px] uppercase tracking-wider text-slate-500">{label}</span>
            <AnimatedNumber value={value} className={`text-2xl font-bold ${colors[color].split(' ')[0]}`} />
            <span className="text-[10px] text-slate-600">{sub}</span>
        </motion.div>
    );
}

// ─── CSV Download ─────────────────────────────────────────────────────────────
function downloadCSV(rows: AnalystRow[]) {
    const headers = ['IP', 'Timestamp', 'Method', 'URL', 'Status', 'Bytes', 'Is_Anomaly', 'Anomaly_Score', 'Reasons'];
    const esc = (v: unknown) => { const s = String(v ?? ''); return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s; };
    const body = rows.map(r => [r.ip, r.timestamp, r.method, r.url, r.status, r.bytes, r.is_anomaly, r.anomaly_score.toFixed(6), r.reasons.join(' | ')].map(esc).join(','));
    const csv = [headers.join(','), ...body].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'analysis_results.csv'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

// ─── Typewriter helper ────────────────────────────────────────────────────────
function typewriterEffect(
    lines: string[],
    setter: React.Dispatch<React.SetStateAction<string>>,
    intervalMs = 18
) {
    const full = lines.join('\n');
    let i = 0;
    setter('');
    return setInterval(() => {
        i = Math.min(i + 3, full.length);
        setter(full.slice(0, i));
        if (i >= full.length) clearInterval(i);
    }, intervalMs);
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AnalyzeView() {
    const { pendingLogs, setPendingLogStatus, removePendingLog, setAiReportId, setAnalysisStats } = useSecurity();
    const [rows, setRows]               = useState<AnalystRow[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isAIRunning, setIsAIRunning] = useState(false);
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [lastFile, setLastFile]       = useState<string | null>(null);
    const [selectedRow, setSelectedRow] = useState<AnalystRow | null>(null);
    const [aiText, setAiText]           = useState('');
    const [aiSuccess, setAiSuccess]     = useState(false);
    const [aiReportData, setAiReportData] = useState<AIReportData | null>(null);
    const fileInputRef   = useRef<HTMLInputElement>(null);
    const twTimerRef     = useRef<ReturnType<typeof setInterval> | null>(null);

    const anomalyCount = rows.filter(r => r.is_anomaly).length;
    const anomalyRate  = rows.length ? anomalyCount / rows.length : 0;
    const isThreat     = anomalyRate > 0.15;

    // Threat-reactive background
    useEffect(() => {
        const el = document.getElementById('app-root');
        if (!el) return;
        if (isThreat) { el.classList.add('mesh-bg-threat'); el.classList.remove('mesh-bg'); }
        else          { el.classList.add('mesh-bg');        el.classList.remove('mesh-bg-threat'); }
        return () => { el.classList.remove('mesh-bg-threat'); el.classList.add('mesh-bg'); };
    }, [isThreat]);

    function timeAgo(iso: string) {
        const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
        if (m < 1) return 'just now'; if (m < 60) return `${m}m ago`; return `${Math.floor(m / 60)}h ago`;
    }

    // ── Shared fetch + parse ──────────────────────────────────────────────────
    const runFetch = useCallback(async (file: File, endpoint = '/api/analysis/process') => {
        try {
            const form = new FormData(); form.append('logfile', file);
            const res = await fetch(`http://localhost:5000${endpoint}`, { method: 'POST', body: form });
            if (!res.ok) {
                const e = await res.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(e.error ?? `HTTP ${res.status}`);
            }

            // Grab AI report ID if present (still in header for process-ai)
            const reportId = res.headers.get('X-AI-Report-Id');
            if (reportId && setAiReportId) setAiReportId(reportId);

            const data = await res.json();
            const rawResults: any[] = data.results ?? [];

            const parsed: AnalystRow[] = rawResults.map((r: any) => ({
                ip:            String(r.ip            ?? ''),
                timestamp:     String(r.timestamp     ?? ''),
                method:        String(r.method        ?? ''),
                url:           String(r.url           ?? ''),
                status:        Number(r.status        ?? 0),
                bytes:         Number(r.bytes         ?? 0),
                is_anomaly:    Boolean(r.is_anomaly),
                anomaly_score: isFinite(Number(r.anomaly_score)) ? Number(r.anomaly_score) : 0,
                reasons:       Array.isArray(r.reasons) ? r.reasons.map(String) : [],
            }));

            setRows(parsed);

            // Push live stats to global context (TopBar + Manager reads from here)
            const anomalyCount  = parsed.filter((r) => r.is_anomaly).length;
            const totalLines    = parsed.length;
            const securePercent = totalLines > 0 ? Math.round(((totalLines - anomalyCount) / totalLines) * 100) : 100;
            setAnalysisStats({ anomalyCount, totalLines, securePercent, analyzedAt: new Date().toISOString() });

        } catch (err: any) { setAnalysisError(err.message ?? 'Analysis failed'); }
        finally { setIsAnalyzing(false); setIsAIRunning(false); }
    }, [setAiReportId]);

    // ── Queue: run ML analysis ────────────────────────────────────────────────
    const runAnalysisFromQueue = async (logId: string, file?: File, filename?: string) => {
        if (!file) { setAnalysisError(`No file reference for "${filename}". Upload manually.`); return; }
        setAnalyzingId(logId); setPendingLogStatus(logId, 'analyzing');
        setLastFile(filename ?? file.name); setIsAnalyzing(true); setAnalysisError(null);
        await runFetch(file);
        setPendingLogStatus(logId, 'done'); setAnalyzingId(null);
    };

    // ── Manual file picker → ML only ─────────────────────────────────────────
    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        e.target.value = ''; setLastFile(file.name); setIsAnalyzing(true); setAnalysisError(null);
        await runFetch(file);
    };

    // ── AI-Augmented Report — send rows as JSON, show briefing panel ──────────
    const handleAIReport = async () => {
        if (rows.length === 0) return;
        setIsAIRunning(true); setAiSuccess(false); setAnalysisError(null);

        const thinkingLines = [
            '▶ Initialising Mistral-7B-Instruct…',
            '▶ Building structured threat prompt…',
            '▶ Sending anomaly vectors to HuggingFace API…',
            '▶ Model is generating expert commentary…',
            '▶ Parsing SOC-lead recommendations…',
            '▶ Merging AI insights with raw log data…',
            '▶ Persisting report to MongoDB…',
        ];
        if (twTimerRef.current) clearInterval(twTimerRef.current);
        twTimerRef.current = typewriterEffect(thinkingLines, setAiText);

        try {
            const res = await fetch('http://localhost:5000/api/analysis/generate-ai-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ results: rows, filename: lastFile ?? 'analysis.log' }),
            });

            if (twTimerRef.current) clearInterval(twTimerRef.current);

            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(err.error ?? `HTTP ${res.status}`);
            }

            const data: AIReportData = await res.json();

            if (data.reportId && setAiReportId) setAiReportId(data.reportId);
            setAiText(prev => prev + '\n✅ Expert report ready.');
            setAiSuccess(true);
            setAiReportData(data);  // opens the briefing panel
        } catch (err: any) {
            if (twTimerRef.current) clearInterval(twTimerRef.current);
            setAiText(prev => prev + `\n❌ Error: ${err.message}`);
            setAnalysisError(err.message ?? 'AI report generation failed');
        } finally {
            setIsAIRunning(false);
        }
    };


    const pendingQueue  = pendingLogs.filter(l => l.status === 'pending');
    const radarData     = rows.length ? computeThreatData(rows) : undefined;


    return (
        <>
            <AnimatePresence>{isAIRunning && <LLMFullscreenOverlay />}</AnimatePresence>
            <AIReportPanel data={aiReportData} onClose={() => setAiReportData(null)} />

            <div className="h-[calc(100vh-3.5rem)] flex flex-col gap-4 p-5 overflow-hidden">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-0.5 flex items-center gap-2">
                            <ShieldAlert className={`w-6 h-6 ${isThreat ? 'text-crimson' : 'text-lavender'}`} />
                            Threat Analysis
                            {isThreat && <span className="text-xs bg-crimson/15 text-crimson px-2 py-0.5 rounded-full font-mono animate-pulse">⚠ HIGH THREAT</span>}
                        </h1>
                        <p className="text-sm text-slate-500">Isolation Forest engine · AI-augmented reporting</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {rows.length > 0 && (
                            <>
                                <button onClick={() => downloadCSV(rows)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-400 text-xs hover:bg-white/10 transition-all">
                                    <Download className="w-3.5 h-3.5" /> Raw CSV
                                </button>
                                {/* Primary CTA */}
                                <motion.button
                                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                    onClick={handleAIReport}
                                    disabled={isAIRunning || isAnalyzing || rows.length === 0}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 border border-primary/50 text-white text-xs font-bold btn-glow-lavender hover:bg-primary/30 transition-all disabled:opacity-50"
                                >
                                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                                    Generate AI-Augmented Report
                                </motion.button>
                            </>
                        )}
                        {aiSuccess && <CheckCircle2 className="w-4 h-4 text-emerald" title="AI report saved to Manager view" />}
                    </div>
                </motion.div>

                {/* ── BENTO GRID ──────────────────────────────────────────── */}
                <div className="flex-1 min-h-0 grid grid-cols-12 grid-rows-[auto_1fr] gap-4 overflow-hidden">

                    {/* TOP ROW — metrics + radar (shrink-0) */}
                    <div className="col-span-12 grid grid-cols-12 gap-4 shrink-0">

                        {/* Metric bento cards */}
                        <div className="col-span-7 grid grid-cols-3 gap-3">
                            <MetricBento label="Total Lines" value={rows.length} sub="log entries processed" color="lavender" />
                            <MetricBento label="Anomalies" value={anomalyCount} sub={rows.length ? `${(anomalyRate * 100).toFixed(1)}% of traffic` : '—'} color="crimson" />
                            <MetricBento label="Benign" value={rows.length - anomalyCount} sub="clean requests" color="emerald" />
                        </div>

                        {/* Threat Radar */}
                        <div className="col-span-5 glass-panel rounded-xl p-3 bento-card" style={{ height: 140 }}>
                            <ThreatRadar data={radarData} color={isThreat ? '#DC2626' : '#BDB2FF'} />
                        </div>
                    </div>

                    {/* BOTTOM ROW — queue + controls + table */}
                    <div className="col-span-12 min-h-0 grid grid-cols-12 gap-4 overflow-hidden">

                        {/* Left col — queue + upload + AI stream */}
                        <div className="col-span-3 flex flex-col gap-3 overflow-hidden">

                            {/* Pending queue */}
                            <AnimatePresence>
                                {pendingLogs.length > 0 && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="glass-panel rounded-xl overflow-hidden shrink-0">
                                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8">
                                            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                <Inbox className="w-3.5 h-3.5 text-lavender" /> Queue
                                            </h2>
                                            {pendingQueue.length > 0 && <span className="text-[9px] bg-lavender/15 text-lavender px-1.5 py-0.5 rounded-full font-bold">{pendingQueue.length}</span>}
                                        </div>
                                        <div className="divide-y divide-white/5 max-h-48 overflow-y-auto scrollbar-thin">
                                            {pendingLogs.map((log) => (
                                                <div key={log.id} className={`flex items-center gap-2.5 px-3 py-2.5 ${log.status === 'done' ? 'opacity-40' : 'hover:bg-white/3'}`}>
                                                    <FileText className={`w-3 h-3 shrink-0 ${log.status === 'done' ? 'text-emerald' : 'text-slate-500'}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] font-medium text-slate-200 truncate">{log.filename}</p>
                                                        <p className="text-[10px] text-slate-600 flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{timeAgo(log.uploadTime)}</p>
                                                    </div>
                                                    {log.status === 'done' && <span className="text-[9px] bg-emerald/15 text-emerald px-1.5 rounded-full">✓</span>}
                                                    {log.status === 'analyzing' && <span className="text-[9px] bg-lavender/15 text-lavender px-1.5 rounded-full animate-pulse">…</span>}
                                                    {log.status === 'pending' && (
                                                        <div className="flex gap-1">
                                                            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                                                                disabled={isAnalyzing}
                                                                onClick={() => runAnalysisFromQueue(log.id, log.file, log.filename)}
                                                                className="px-2 py-1 rounded-md bg-lavender/15 text-lavender text-[10px] font-bold hover:bg-lavender/25 transition-all disabled:opacity-40"
                                                            >
                                                                {analyzingId === log.id ? <motion.span className="inline-block w-2.5 h-2.5 rounded-full border border-lavender border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} /> : <Zap className="w-2.5 h-2.5" />}
                                                            </motion.button>
                                                            <button onClick={() => removePendingLog(log.id)} className="text-[10px] text-slate-700 hover:text-slate-500 px-1">✕</button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Manual upload */}
                            <div className="glass-panel rounded-xl p-3 shrink-0 relative overflow-hidden">
                                <AnimatePresence>{isAnalyzing && !isAIRunning && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="absolute inset-0 z-10 flex items-center justify-center bg-obsidian/80 backdrop-blur-sm rounded-xl">
                                        <div className="flex flex-col items-center gap-2">
                                            <motion.div className="w-8 h-8 rounded-full border-2 border-transparent border-t-lavender" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                                            <p className="text-[11px] text-lavender font-mono">Analyzing…</p>
                                        </div>
                                    </motion.div>
                                )}</AnimatePresence>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Manual Upload</p>
                                <button onClick={() => fileInputRef.current?.click()} disabled={isAnalyzing}
                                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-white/15 bg-white/3 text-slate-400 text-xs hover:bg-white/6 hover:border-white/25 transition-all disabled:opacity-40">
                                    <UploadCloud className="w-3.5 h-3.5" />
                                    {lastFile ? <span className="truncate max-w-[100px]">{lastFile}</span> : 'Select log file'}
                                </button>
                                <input ref={fileInputRef} type="file" accept=".log,.txt,.csv,text/plain" className="hidden" onChange={handleFileSelected} />
                            </div>

                            {/* AI reasoning stream */}
                            <AnimatePresence>
                                {(isAIRunning || aiText) && (
                                    <AIReasoningPanel text={aiText} isActive={isAIRunning} />
                                )}
                            </AnimatePresence>

                            {/* Error */}
                            <AnimatePresence>
                                {analysisError && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="flex items-start gap-2 p-3 rounded-xl bg-crimson/10 border border-crimson/20 text-xs text-crimson shrink-0">
                                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                        {analysisError}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Data Table */}
                        <div className="col-span-9 min-h-0 overflow-hidden">
                            {isAnalyzing ? (
                                <SkeletonTable rows={10} cols={6} />
                            ) : rows.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-4">
                                    <BrainCircuit className="w-16 h-16 opacity-20" />
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-slate-600">No analysis data yet</p>
                                        <p className="text-xs text-slate-700 mt-1">Run ML Analysis from the queue or upload a log file</p>
                                    </div>
                                </div>
                            ) : (
                                <DataTable rows={rows} onEscalate={setSelectedRow} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AnalystNoteModal row={selectedRow} onClose={() => setSelectedRow(null)} />
        </>
    );
}
