import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, FileText, Send, Lock, Loader2, BrainCircuit, Download, UploadCloud, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ─── Midnight Neon AI Loading Overlay ────────────────────────────────────────
function AILoadingOverlay() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-2xl z-20 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm"
        >
            {/* Outer pulsing ring */}
            <motion.div
                className="relative w-24 h-24 flex items-center justify-center mb-6"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            >
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-full bg-lavender/20 blur-xl" />
                {/* Spinner ring */}
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-transparent border-t-lavender border-r-purple-400"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                />
                {/* Inner icon */}
                <BrainCircuit className="w-10 h-10 text-lavender relative z-10" />
            </motion.div>

            <motion.p
                className="text-lavender font-bold text-base tracking-widest uppercase mb-1"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
                AI Model Processing Logs...
            </motion.p>
            <p className="text-slate-500 text-xs font-mono">Isolation Forest · Anomaly Detection</p>
        </motion.div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function AnalystView() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<any[]>([]);
    const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [severity, setSeverity] = useState('Medium Risk');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [anomaly, setAnomaly] = useState<any | null>(null);

    // AI Analysis state
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [lastFileName, setLastFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/logs');
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
                if (data.length > 0) setSelectedLogId(data[0]._id);
            }
        } catch (err) {
            console.error("Error fetching logs:", err);
        }
    };

    useEffect(() => {
        if (selectedLogId) {
            setAnomaly({
                _id: 'mock_anomaly_' + selectedLogId,
                log_id: selectedLogId,
                type: 'Unusual Traffic Spike',
                severity: 'high',
                confidence: 0.89,
                description: 'Detected abnormal outbound traffic volume inconsistent with previous baselines.'
            });
        }
    }, [selectedLogId]);

    // ─── AI Analysis: file picker → POST → CSV download ──────────────────────
    const handleRunAnalysis = () => {
        setAnalysisError(null);
        fileInputRef.current?.click();
    };

    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset so the same file can be re-selected
        e.target.value = '';

        setLastFileName(file.name);
        setIsAnalyzing(true);
        setAnalysisError(null);

        try {
            const formData = new FormData();
            formData.append('logfile', file);

            const res = await fetch('http://localhost:5000/api/analysis/process', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errJson = await res.json().catch(() => ({ error: 'Unknown error from server.' }));
                throw new Error(errJson.error ?? `Server error ${res.status}`);
            }

            // Trigger browser CSV download
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = 'analysis_results.csv';
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            URL.revokeObjectURL(url);

        } catch (err: any) {
            console.error('AI analysis error:', err);
            setAnalysisError(err.message ?? 'Analysis failed.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSubmitReview = async () => {
        if (!selectedLogId || !anomaly) return;
        setIsSubmitting(true);
        try {
            const res = await fetch('http://localhost:5000/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    result_id: '000000000000000000000000',
                    analyst_id: user?.id,
                    notes: `[${severity}] ${notes}`
                })
            });
            if (res.ok || res.status === 400 || res.status === 500) {
                alert("Review submitted to Manager (simulated)");
                setNotes('');
            }
        } catch (err) {
            console.error("Error submitting review:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] grid grid-cols-12 gap-6 p-6">

            {/* ── LEFT PANEL: Log Viewer ── */}
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="col-span-4 flex flex-col glass-panel rounded-2xl overflow-hidden"
            >
                <div className="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
                    <h3 className="font-mono text-sm text-slate-400">AVAILABLE_LOGS</h3>
                </div>
                <div className="flex-1 overflow-auto p-4 font-mono text-xs space-y-1 bg-black/40">
                    {logs.length === 0 && <div className="text-slate-500 p-4">No logs available.</div>}
                    {logs.map((log) => (
                        <div
                            key={log._id}
                            onClick={() => setSelectedLogId(log._id)}
                            className={`
                                cursor-pointer px-2 py-2 rounded transition-colors flex justify-between
                                ${selectedLogId === log._id ? 'bg-white/10' : 'hover:bg-white/5'}
                            `}
                        >
                            <span className="text-lavender truncate w-2/3">{log.source}</span>
                            <span className="text-slate-500">{new Date(log.uploaded_at).toLocaleTimeString()}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* ── CENTER PANEL: AI Analysis ── */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="col-span-4 flex flex-col gap-6"
            >
                {/* Existing anomaly card */}
                <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-purple-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Shield className="w-24 h-24 text-lavender" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                        <Eye className="w-5 h-5 mr-2 text-lavender" />
                        AI Analysis
                    </h2>

                    {anomaly ? (
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-200">{anomaly.type}</h4>
                                <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-terracotta/20 text-terracotta">
                                    {anomaly.severity}
                                </span>
                            </div>
                            <p className="text-sm text-slate-400 mb-3">{anomaly.description}</p>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">Confidence Score</span>
                                <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-lavender to-purple-500 rounded-full"
                                        style={{ width: `${anomaly.confidence * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-slate-500 italic">Select a log to view analysis...</div>
                    )}
                </div>

                {/* ── NEW: Run AI Analysis card ── */}
                <div className="flex-1 glass-panel rounded-2xl relative overflow-hidden flex flex-col">

                    {/* Loading overlay via AnimatePresence */}
                    <AnimatePresence>
                        {isAnalyzing && <AILoadingOverlay />}
                    </AnimatePresence>

                    <div className="p-5 border-b border-white/10 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-lavender/10 border border-lavender/20 flex items-center justify-center">
                            <BrainCircuit className="w-5 h-5 text-lavender" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white">Isolation Forest Engine</h3>
                            <p className="text-xs text-slate-500">Upload raw log file for ML analysis</p>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center p-6 gap-5">
                        {/* Drop zone / upload button */}
                        <motion.button
                            onClick={handleRunAnalysis}
                            disabled={isAnalyzing}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="
                                w-full flex flex-col items-center gap-3 py-6
                                border-2 border-dashed border-lavender/30 rounded-xl
                                bg-lavender/5 hover:bg-lavender/10 hover:border-lavender/60
                                transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                            "
                        >
                            <div className="w-12 h-12 rounded-full bg-lavender/10 flex items-center justify-center">
                                <UploadCloud className="w-6 h-6 text-lavender" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-lavender">Run AI Analysis</p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {lastFileName ? `Last: ${lastFileName}` : 'Select .log / .txt file'}
                                </p>
                            </div>
                        </motion.button>

                        {/* Error message */}
                        <AnimatePresence>
                            {analysisError && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="w-full flex items-start gap-2 p-3 rounded-lg bg-terracotta/10 border border-terracotta/30"
                                >
                                    <AlertTriangle className="w-4 h-4 text-terracotta mt-0.5 shrink-0" />
                                    <p className="text-xs text-terracotta leading-relaxed">{analysisError}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Caption */}
                        <div className="flex items-center gap-2 mt-auto">
                            <Download className="w-3.5 h-3.5 text-slate-600" />
                            <p className="text-xs text-slate-600">Results download automatically as CSV</p>
                        </div>
                    </div>

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".log,.txt,.csv,text/plain"
                        className="hidden"
                        onChange={handleFileSelected}
                    />
                </div>
            </motion.div>

            {/* ── RIGHT PANEL: Analyst Workbench ── */}
            <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="col-span-4 flex flex-col glass-panel rounded-2xl"
            >
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-terracotta" />
                        Analyst Workbench
                    </h2>
                </div>

                <div className="p-6 flex-1 flex flex-col gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Severity Classification</label>
                        <select
                            value={severity}
                            onChange={(e) => setSeverity(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-slate-300 focus:outline-none focus:border-lavender/50 text-sm"
                        >
                            <option>Low Risk</option>
                            <option>Medium Risk</option>
                            <option>High Risk</option>
                            <option>Critical (Immediate Action)</option>
                        </select>
                    </div>

                    <div className="space-y-2 flex-1 flex flex-col">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Manual Observations</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full flex-1 bg-black/20 border border-white/10 rounded-lg p-3 text-slate-300 focus:outline-none focus:border-lavender/50 text-sm font-mono resize-none"
                            placeholder="Enter detailed analysis findings..."
                        />
                    </div>

                    <button
                        onClick={handleSubmitReview}
                        disabled={isSubmitting || !selectedLogId}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-lavender to-purple-500 text-slate-900 font-bold hover:shadow-lg hover:shadow-purple-500/20 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4 mr-2" />}
                        Submit to Manager
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
