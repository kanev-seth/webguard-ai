import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, FileText, Send, Loader2, BrainCircuit, Download, UploadCloud, AlertTriangle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThreatRadar, computeThreatData } from '../ui/ThreatRadar';
import { SkeletonCard } from '../ui/SkeletonLoader';

// ─── AI Loading Overlay ───────────────────────────────────────────────────────
function AILoadingOverlay() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-2xl z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
            <motion.div className="relative w-20 h-20 flex items-center justify-center mb-5"
                animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
                <div className="absolute inset-0 rounded-full bg-lavender/20 blur-xl" />
                <motion.div className="absolute inset-0 rounded-full border-2 border-transparent border-t-lavender border-r-purple-400"
                    animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} />
                <BrainCircuit className="w-9 h-9 text-lavender relative z-10" />
            </motion.div>
            <motion.p className="text-lavender font-bold text-sm tracking-widest uppercase mb-1"
                animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }}>
                Isolation Forest Running…
            </motion.p>
            <p className="text-slate-500 text-xs font-mono">Anomaly Detection · ML Engine</p>
        </motion.div>
    );
}

// ─── Magnetic Button wrapper ──────────────────────────────────────────────────
function MagneticButton({ children, onClick, disabled, className }: {
    children: React.ReactNode; onClick: () => void; disabled?: boolean; className?: string;
}) {
    const ref = useRef<HTMLButtonElement>(null);
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const btn = ref.current; if (!btn || disabled) return;
        const rect = btn.getBoundingClientRect();
        const dx = (e.clientX - rect.left - rect.width / 2) * 0.25;
        const dy = (e.clientY - rect.top  - rect.height / 2) * 0.25;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
    }, [disabled]);
    const handleMouseLeave = useCallback(() => {
        if (ref.current) ref.current.style.transform = '';
    }, []);
    return (
        <button ref={ref} onClick={onClick} disabled={disabled} className={`btn-magnetic ${className}`}
            onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            {children}
        </button>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function AnalystView() {
    const { user } = useAuth();
    const [logs, setLogs]               = useState<any[]>([]);
    const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
    const [notes, setNotes]             = useState('');
    const [severity, setSeverity]       = useState('Medium Risk');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [anomaly, setAnomaly]         = useState<any | null>(null);
    const [isLoadingLogs, setIsLoadingLogs] = useState(true);

    // Analysis state
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [lastFileName, setLastFileName] = useState<string | null>(null);
    const [analysedRows, setAnalysedRows] = useState<{ is_anomaly: boolean; reasons: string[] }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { fetchLogs(); }, []);

    const fetchLogs = async () => {
        setIsLoadingLogs(true);
        try {
            const res = await fetch('http://localhost:5000/api/logs');
            if (res.ok) { const data = await res.json(); setLogs(data); if (data.length > 0) setSelectedLogId(data[0]._id); }
        } catch (err) { console.error('Error fetching logs:', err); }
        finally { setIsLoadingLogs(false); }
    };

    useEffect(() => {
        if (!selectedLogId) return;
        setAnomaly({ _id: 'mock_' + selectedLogId, type: 'Unusual Traffic Spike', severity: 'high', confidence: 0.89, description: 'Detected abnormal outbound traffic volume inconsistent with previous baselines.' });
    }, [selectedLogId]);

    const handleRunAnalysis = () => { setAnalysisError(null); fileInputRef.current?.click(); };

    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        e.target.value = ''; setLastFileName(file.name); setIsAnalyzing(true); setAnalysisError(null);
        try {
            const formData = new FormData(); formData.append('logfile', file);
            const res = await fetch('http://localhost:5000/api/analysis/process', { method: 'POST', body: formData });
            if (!res.ok) { const err = await res.json().catch(() => ({ error: 'Unknown error' })); throw new Error(err.error ?? `Server error ${res.status}`); }

            // Parse CSV for radar
            const csvText = await res.text();
            const lines   = csvText.split(/\r?\n/).filter(Boolean);
            const headers = lines[0].split(',');
            const parsed = lines.slice(1).map(line => {
                const cols = line.match(/(\"(?:[^\"]|\"\")*\"|[^,]*)/g)?.map(c => c.startsWith('"') ? c.slice(1,-1).replace(/""/g,'"') : c) ?? [];
                const get  = (h: string) => cols[headers.indexOf(h)] ?? '';
                return { is_anomaly: get('Is_Anomaly') === 'true', reasons: get('Reasons').split(' | ').filter(Boolean) };
            });
            setAnalysedRows(parsed);

            // Also trigger download
            const blob = new Blob([csvText], { type: 'text/csv' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'analysis_results.csv';
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
        } catch (err: any) {
            setAnalysisError(err.message ?? 'Analysis failed.');
        } finally { setIsAnalyzing(false); }
    };

    const handleSubmitReview = async () => {
        if (!selectedLogId || !anomaly) return;
        setIsSubmitting(true);
        try {
            await fetch('http://localhost:5000/api/reviews', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ result_id: '000000000000000000000000', analyst_id: user?.id, notes: `[${severity}] ${notes}` }),
            });
            alert('Review submitted to Manager (simulated)'); setNotes('');
        } catch (err) { console.error('Error submitting review:', err); }
        finally { setIsSubmitting(false); }
    };

    const radarData = analysedRows.length ? computeThreatData(analysedRows) : undefined;

    return (
        <div className="h-[calc(100vh-3.5rem)] grid grid-cols-12 gap-4 p-5">

            {/* ── LEFT: Log Viewer ── */}
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                className="col-span-3 flex flex-col glass-panel rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/8 bg-black/20 flex justify-between items-center shrink-0">
                    <h3 className="font-mono text-xs text-slate-400 uppercase tracking-wider">Available Logs</h3>
                    <span className="text-[10px] text-slate-600">{logs.length} files</span>
                </div>
                <div className="flex-1 overflow-auto p-3 space-y-1 bg-black/30 scrollbar-thin">
                    {isLoadingLogs ? (
                        <div className="space-y-2 p-1"><SkeletonCard lines={2} /><SkeletonCard lines={2} /><SkeletonCard lines={2} /></div>
                    ) : logs.length === 0 ? (
                        <div className="text-slate-600 p-4 text-xs text-center mt-4">No logs ingested yet.</div>
                    ) : logs.map((log) => (
                        <motion.div key={log._id} whileHover={{ x: 2 }}
                            onClick={() => setSelectedLogId(log._id)}
                            className={`cursor-pointer px-3 py-2.5 rounded-lg transition-all flex justify-between items-center ${selectedLogId === log._id ? 'bg-lavender/10 border border-lavender/20' : 'hover:bg-white/5 border border-transparent'}`}>
                            <span className="text-xs text-lavender truncate">{log.source}</span>
                            <span className="text-[10px] text-slate-600 shrink-0 ml-2">{new Date(log.uploaded_at).toLocaleTimeString()}</span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* ── CENTER: AI Analysis + Radar ── */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.08 }}
                className="col-span-5 flex flex-col gap-4">

                {/* Anomaly card */}
                <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-lavender/50 relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <Shield className="w-24 h-24 text-lavender" />
                    </div>
                    <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-lavender" /> AI Analysis
                    </h2>
                    {anomaly ? (
                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/8">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-200 text-sm">{anomaly.type}</h4>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-terracotta/15 text-terracotta">{anomaly.severity}</span>
                            </div>
                            <p className="text-xs text-slate-400 mb-3 leading-relaxed">{anomaly.description}</p>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">Confidence</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div className="h-full bg-gradient-to-r from-lavender to-purple-500 rounded-full"
                                            initial={{ width: 0 }} animate={{ width: `${anomaly.confidence * 100}%` }} transition={{ duration: 1, delay: 0.3 }} />
                                    </div>
                                    <span className="text-lavender font-mono">{(anomaly.confidence * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                        </div>
                    ) : <div className="text-slate-600 italic text-sm">Select a log to view analysis…</div>}
                </div>

                {/* Run Analysis card */}
                <div className="flex-1 glass-panel rounded-2xl relative overflow-hidden flex flex-col">
                    <AnimatePresence>{isAnalyzing && <AILoadingOverlay />}</AnimatePresence>
                    <div className="p-4 border-b border-white/8 flex items-center gap-3 shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-lavender/10 border border-lavender/20 flex items-center justify-center">
                            <BrainCircuit className="w-4 h-4 text-lavender" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white">Isolation Forest Engine</h3>
                            <p className="text-[11px] text-slate-500">Upload raw log file for ML analysis</p>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center p-5 gap-4">
                        <MagneticButton onClick={handleRunAnalysis} disabled={isAnalyzing}
                            className="w-full flex flex-col items-center gap-3 py-5 border-2 border-dashed border-lavender/25 rounded-xl bg-lavender/[0.04] hover:bg-lavender/[0.08] hover:border-lavender/50 transition-all cursor-pointer disabled:opacity-50">
                            <div className="w-11 h-11 rounded-full bg-lavender/10 border border-lavender/20 flex items-center justify-center">
                                <UploadCloud className="w-5 h-5 text-lavender" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-lavender">Run AI Analysis</p>
                                <p className="text-[11px] text-slate-500 mt-0.5">{lastFileName ? `Last: ${lastFileName}` : 'Select .log / .txt file'}</p>
                            </div>
                        </MagneticButton>
                        <AnimatePresence>
                            {analysisError && (
                                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="w-full flex items-start gap-2 p-3 rounded-lg bg-terracotta/10 border border-terracotta/20">
                                    <AlertTriangle className="w-3.5 h-3.5 text-terracotta mt-0.5 shrink-0" />
                                    <p className="text-xs text-terracotta">{analysisError}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div className="flex items-center gap-2 mt-auto opacity-50">
                            <Download className="w-3 h-3 text-slate-600" />
                            <p className="text-[11px] text-slate-600">Results download automatically as CSV</p>
                        </div>
                    </div>
                    <input ref={fileInputRef} type="file" accept=".log,.txt,.csv,text/plain" className="hidden" onChange={handleFileSelected} />
                </div>

                {/* Threat Radar */}
                <div className="glass-panel rounded-2xl p-4 shrink-0" style={{ height: 180 }}>
                    <ThreatRadar data={radarData} />
                </div>
            </motion.div>

            {/* ── RIGHT: Workbench ── */}
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.15 }}
                className="col-span-4 flex flex-col glass-panel rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-white/8 shrink-0">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-terracotta" /> Analyst Workbench
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">Classify, annotate, and escalate threats</p>
                </div>
                <div className="p-5 flex-1 flex flex-col gap-4 overflow-hidden">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Severity Classification</label>
                        <select value={severity} onChange={(e) => setSeverity(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-lavender/40 text-xs">
                            <option>Low Risk</option><option>Medium Risk</option><option>High Risk</option><option>Critical (Immediate Action)</option>
                        </select>
                    </div>
                    <div className="flex-1 flex flex-col space-y-1.5 min-h-0">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Manual Observations</label>
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                            className="flex-1 bg-black/20 border border-white/10 rounded-lg p-3 text-slate-300 focus:outline-none focus:border-lavender/40 text-xs font-mono resize-none scrollbar-thin"
                            placeholder="Enter detailed analysis findings…" />
                    </div>

                    {/* Insight badges */}
                    <div className="flex flex-wrap gap-1.5 shrink-0">
                        {['Path traversal detected', 'SQL injection probe', 'Brute force pattern', 'Night-time activity'].map((tag) => (
                            <button key={tag} onClick={() => setNotes(n => n ? `${n}\n${tag}` : tag)}
                                className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-slate-500 hover:border-lavender/30 hover:text-lavender transition-colors">
                                + {tag}
                            </button>
                        ))}
                    </div>

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={handleSubmitReview} disabled={isSubmitting || !selectedLogId}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-lavender to-purple-500 text-slate-900 font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 btn-glow-lavender shrink-0">
                        {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
                        Submit to Manager
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}
