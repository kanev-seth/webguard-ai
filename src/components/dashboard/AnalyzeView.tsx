import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, UploadCloud, Download, AlertTriangle, Inbox, FileText, Clock, Zap } from 'lucide-react';
import type { AnalystRow } from '../../context/SecurityContext';
import { useSecurity } from '../../context/SecurityContext';
import { DataTable } from './DataTable';
import { AnalystNoteModal } from './AnalystNoteModal';

// ─── AI Loading Overlay ──────────────────────────────────────────────────────
function AILoadingOverlay() {
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-sm rounded-2xl"
        >
            <motion.div
                className="relative w-24 h-24 flex items-center justify-center mb-6"
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
                <div className="absolute inset-0 rounded-full bg-lavender/15 blur-xl" />
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-transparent border-t-lavender border-r-purple-400"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                />
                <BrainCircuit className="w-10 h-10 text-lavender relative z-10" />
            </motion.div>
            <motion.p
                className="text-lavender font-bold text-sm tracking-widest uppercase mb-1"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.2, repeat: Infinity }}
            >
                AI Model Processing Logs...
            </motion.p>
            <p className="text-slate-500 text-xs font-mono">Isolation Forest · Anomaly Detection</p>
        </motion.div>
    );
}

// ─── CSV Download helper ─────────────────────────────────────────────────────
function downloadCSV(rows: AnalystRow[]) {
    const headers = ['IP', 'Timestamp', 'Method', 'URL', 'Status', 'Bytes', 'Is_Anomaly', 'Anomaly_Score', 'Reasons'];
    const esc = (v: unknown) => {
        const s = String(v ?? '');
        return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const body = rows.map(r => [
        r.ip, r.timestamp, r.method, r.url, r.status, r.bytes,
        r.is_anomaly, r.anomaly_score.toFixed(6),
        r.reasons.join(' | ')
    ].map(esc).join(','));
    const csv  = [headers.join(','), ...body].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'analysis_results.csv';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
}

// ─── Main View ───────────────────────────────────────────────────────────────
export function AnalyzeView() {
    const { pendingLogs, setPendingLogStatus, removePendingLog } = useSecurity();
    const [rows, setRows]               = useState<AnalystRow[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [lastFile, setLastFile]       = useState<string | null>(null);
    const [selectedRow, setSelectedRow] = useState<AnalystRow | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Run analysis from a pending queue entry ────────────────────────────
    const runAnalysisFromQueue = async (logId: string, file?: File, filename?: string) => {
        if (!file) {
            setAnalysisError(`No file reference found for "${filename}". Please upload manually below.`);
            return;
        }
        setAnalyzingId(logId);
        setPendingLogStatus(logId, 'analyzing');
        setLastFile(filename ?? file.name);
        setIsAnalyzing(true);
        setAnalysisError(null);
        await runFetch(file);
        setPendingLogStatus(logId, 'done');
        setAnalyzingId(null);
    };

    // ── Run analysis from manual file picker ──────────────────────────────
    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';
        setLastFile(file.name);
        setIsAnalyzing(true);
        setAnalysisError(null);
        await runFetch(file);
    };

    // ── Shared fetch → parse → setRows ───────────────────────────────────
    const runFetch = async (file: File) => {
        try {
            const form = new FormData();
            form.append('logfile', file);
            const res = await fetch('http://localhost:5000/api/analysis/process', {
                method: 'POST', body: form,
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: 'Unknown server error' }));
                throw new Error(err.error ?? `HTTP ${res.status}`);
            }
            const csvText = await res.text();
            const lines   = csvText.split(/\r?\n/).filter(Boolean);
            const headers = lines[0].split(',');
            const parsed: AnalystRow[] = lines.slice(1).map((line) => {
                const cols = line.match(/("(?:[^"]|"")*"|[^,]*)/g)?.map(c =>
                    c.startsWith('"') ? c.slice(1, -1).replace(/""/g, '"') : c
                ) ?? [];
                const get = (h: string) => cols[headers.indexOf(h)] ?? '';
                return {
                    ip:            get('IP'),
                    timestamp:     get('Timestamp'),
                    method:        get('Method'),
                    url:           get('URL'),
                    status:        Number(get('Status')),
                    bytes:         Number(get('Bytes')),
                    is_anomaly:    get('Is_Anomaly') === 'true',
                    anomaly_score: parseFloat(get('Anomaly_Score')),
                    reasons:       get('Reasons').split(' | ').filter(Boolean),
                };
            });
            setRows(parsed);
        } catch (err: any) {
            setAnalysisError(err.message ?? 'Analysis failed');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const anomalyCount  = rows.filter(r => r.is_anomaly).length;
    const pendingQueue  = pendingLogs.filter(l => l.status === 'pending');
    const analyzingItem = pendingLogs.find(l => l.status === 'analyzing');

    function timeAgo(iso: string) {
        const diff = Date.now() - new Date(iso).getTime();
        const m = Math.floor(diff / 60000);
        if (m < 1) return 'just now';
        if (m < 60) return `${m}m ago`;
        return `${Math.floor(m / 60)}h ago`;
    }

    return (
        <div className="h-[calc(100vh-3.5rem)] flex flex-col gap-4 p-6 overflow-hidden">

            {/* Page header */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-0.5">Threat Analysis</h1>
                    <p className="text-sm text-slate-500">Select a log from the ingestion queue or upload manually to run the Isolation Forest engine.</p>
                </div>
                {rows.length > 0 && (
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-crimson font-mono bg-crimson/10 px-3 py-1.5 rounded-lg border border-crimson/20">
                            {anomalyCount} anomalies
                        </span>
                        <button
                            onClick={() => downloadCSV(rows)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-lavender/30 bg-lavender/10 text-lavender text-xs font-bold hover:bg-lavender/20 transition-all"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Download CSV
                        </button>
                    </div>
                )}
            </motion.div>

            {/* ── SECTION 1: Pending Ingestion Queue ── */}
            <AnimatePresence>
                {pendingLogs.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="shrink-0"
                    >
                        <div className="glass-panel rounded-2xl overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-3 border-b border-white/8">
                                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Inbox className="w-3.5 h-3.5 text-lavender" />
                                    Pending Ingestion Queue
                                </h2>
                                {pendingQueue.length > 0 && (
                                    <span className="text-[10px] bg-lavender/15 text-lavender px-2 py-0.5 rounded-full font-bold">
                                        {pendingQueue.length} awaiting analysis
                                    </span>
                                )}
                            </div>

                            {/* Log rows */}
                            <div className="divide-y divide-white/5">
                                {pendingLogs.map((log) => {
                                    const isThisAnalyzing = analyzingId === log.id;
                                    return (
                                        <motion.div
                                            key={log.id}
                                            layout
                                            className={`flex items-center gap-4 px-5 py-3 transition-colors ${
                                                log.status === 'done' ? 'opacity-50' : 'hover:bg-white/3'
                                            }`}
                                        >
                                            <FileText className={`w-4 h-4 shrink-0 ${log.status === 'done' ? 'text-emerald' : 'text-slate-500'}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-200 truncate">{log.filename}</p>
                                                <p className="text-xs text-slate-500">
                                                    {log.lines.toLocaleString()} lines · {log.size}
                                                    <span className="mx-1.5 text-slate-700">·</span>
                                                    <Clock className="inline w-3 h-3 mr-0.5" />
                                                    {timeAgo(log.uploadTime)}
                                                </p>
                                            </div>

                                            {/* Status badge */}
                                            {log.status === 'done' && (
                                                <span className="text-[10px] bg-emerald/15 text-emerald px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">✓ Analysed</span>
                                            )}
                                            {log.status === 'analyzing' && (
                                                <span className="text-[10px] bg-lavender/15 text-lavender px-2 py-0.5 rounded-full font-semibold whitespace-nowrap animate-pulse">Processing…</span>
                                            )}

                                            {/* Action buttons */}
                                            {log.status === 'pending' && (
                                                <div className="flex items-center gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                                        disabled={isAnalyzing}
                                                        onClick={() => runAnalysisFromQueue(log.id, log.file, log.filename)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-lavender to-purple-500 text-slate-900 text-[11px] font-bold hover:shadow-md hover:shadow-lavender/20 transition-all disabled:opacity-40"
                                                    >
                                                        {isThisAnalyzing
                                                            ? <motion.span className="w-3 h-3 rounded-full border-2 border-slate-900 border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                                                            : <Zap className="w-3 h-3" />
                                                        }
                                                        Run ML Analysis
                                                    </motion.button>
                                                    <button
                                                        onClick={() => removePendingLog(log.id)}
                                                        className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors px-1"
                                                        title="Dismiss"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── SECTION 2: Manual upload fallback + AI overlay ── */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="relative glass-panel rounded-2xl overflow-hidden shrink-0"
            >
                <AnimatePresence>{(isAnalyzing) && <AILoadingOverlay />}</AnimatePresence>

                <div className="flex items-center gap-4 px-5 py-3.5">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isAnalyzing}
                        className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/8 border border-white/15 text-slate-300 font-bold text-xs hover:bg-white/12 transition-all active:scale-95 disabled:opacity-40"
                    >
                        <UploadCloud className="w-4 h-4" />
                        {isAnalyzing ? 'Analyzing…' : 'Manual Upload'}
                    </button>
                    <span className="text-xs text-slate-600">
                        {lastFile ? `▶ ${lastFile}` : pendingQueue.length > 0 ? 'Use queue above, or upload a new file directly' : 'Select a .log or .txt file in Apache Combined Log Format'}
                    </span>
                    <input ref={fileInputRef} type="file" accept=".log,.txt,.csv,text/plain" className="hidden" onChange={handleFileSelected} />
                </div>

                <AnimatePresence>
                    {analysisError && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-2 px-5 pb-3.5 text-xs text-crimson"
                        >
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            {analysisError}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* ── SECTION 3: Data table ── */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex-1 min-h-0">
                {rows.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3">
                        <BrainCircuit className="w-12 h-12 opacity-30" />
                        <p className="text-sm">Click "Run ML Analysis" on a queued log, or upload a file manually.</p>
                    </div>
                ) : (
                    <DataTable rows={rows} onEscalate={setSelectedRow} />
                )}
            </motion.div>

            {/* Analyst note modal */}
            <AnalystNoteModal row={selectedRow} onClose={() => setSelectedRow(null)} />
        </div>
    );
}
