import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Archive, ShieldCheck, Download, FileCheck, Zap, BrainCircuit, AlertTriangle, CheckCircle2, Clock, BarChart2, RefreshCw, ChevronDown, FileText, FileJson, FileBadge, ShieldAlert, TrendingUp } from 'lucide-react';
import { ThreatRadar } from '../ui/ThreatRadar';
import { SkeletonCard } from '../ui/SkeletonLoader';
import { useSecurity } from '../../context/SecurityContext';

const RISK_CONFIG: Record<string, { color: string; dot: string; badge: string }> = {
    LOW:      { color: 'text-emerald',   dot: 'bg-emerald',   badge: 'bg-emerald/15 text-emerald' },
    MEDIUM:   { color: 'text-lavender',  dot: 'bg-lavender',  badge: 'bg-lavender/15 text-lavender' },
    HIGH:     { color: 'text-terracotta',dot: 'bg-terracotta',badge: 'bg-terracotta/15 text-terracotta' },
    CRITICAL: { color: 'text-crimson',   dot: 'bg-crimson',   badge: 'bg-crimson/15 text-crimson' },
    UNKNOWN:  { color: 'text-slate-400', dot: 'bg-slate-500', badge: 'bg-slate-700 text-slate-400' },
};

// ── Stored final reports (from old endpoint) ──────────────────────────────────
type FinalReport = { _id: string; final_decision: string; recommendation: string; created_at: string; manager_id?: { email?: string } };
// ── AI reports ────────────────────────────────────────────────────────────────
type AIReportEntry = { _id: string; filename: string; summary: string; riskLevel: string; remediations: string[]; rawAnomalyCount: number; totalLines: number; createdAt: string };

export function ManagerView() {
    const { escalations, analysisStats } = useSecurity();
    const [reports, setReports]               = useState<FinalReport[]>([]);
    const [aiReports, setAIReports]           = useState<AIReportEntry[]>([]);
    const [selectedFinal, setSelectedFinal]   = useState<FinalReport | null>(null);
    const [selectedAI, setSelectedAI]         = useState<AIReportEntry | null>(null);
    const [tab, setTab]                       = useState<'ai' | 'final'>('ai');
    const [isLoadingAI, setIsLoadingAI]       = useState(true);
    const [downloading, setDownloading]       = useState(false);
    const [dlMenuOpen, setDlMenuOpen]         = useState(false);
    const dlMenuRef                           = useRef<HTMLDivElement>(null);

    const pendingEscalations = escalations.filter((e) => e.status === 'pending').length;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dlMenuRef.current && !dlMenuRef.current.contains(e.target as Node)) {
                setDlMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => { fetchReports(); fetchAIReports(); }, []);

    const fetchReports = async () => {
        try { const r = await fetch('http://localhost:5000/api/reports'); if (r.ok) { const d = await r.json(); setReports(d); if (d.length > 0) setSelectedFinal(d[0]); } }
        catch { /* silent */ }
    };

    const fetchAIReports = async () => {
        setIsLoadingAI(true);
        try { const r = await fetch('http://localhost:5000/api/analysis/ai-reports'); if (r.ok) { const d = await r.json(); setAIReports(d); if (d.length > 0) setSelectedAI(d[0]); } }
        catch { /* silent */ }
        finally { setIsLoadingAI(false); }
    };

    // ── Download helpers ──────────────────────────────────────────────────────
    const downloadExpertCsv = async (id: string, filename: string) => {
        setDownloading(true); setDlMenuOpen(false);
        try {
            const r = await fetch(`http://localhost:5000/api/analysis/ai-reports/${id}/download`);
            if (!r.ok) throw new Error('Download failed');
            const blob = await r.blob();
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
            a.download = `Expert_Security_Report_${filename}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
        } catch { alert('Could not download CSV report.'); }
        finally { setDownloading(false); }
    };

    const downloadExecutiveBriefing = (report: AIReportEntry) => {
        setDlMenuOpen(false);
        const divider = '═'.repeat(72);
        const thin    = '─'.repeat(72);
        const date    = new Date(report.createdAt).toLocaleString();
        const anomalyRate = report.totalLines
            ? ((report.rawAnomalyCount / report.totalLines) * 100).toFixed(1)
            : '0.0';

        const remediationBlock = report.remediations.length
            ? report.remediations.map((s, i) => `  ${i + 1}. ${s}`).join('\n')
            : '  No remediation steps recorded.';

        const content = [
            divider,
            '  WEBGUARD AI — EXECUTIVE SECURITY BRIEFING',
            '  CONFIDENTIAL — MANAGER ACCESS ONLY',
            divider,
            '',
            `  Report File   : ${report.filename}`,
            `  Generated At  : ${date}`,
            `  Report ID     : ${report._id}`,
            `  Risk Level    : ${report.riskLevel}`,
            '',
            thin,
            '  THREAT STATISTICS',
            thin,
            `  Total Log Lines Processed : ${report.totalLines}`,
            `  Anomalies Detected        : ${report.rawAnomalyCount}`,
            `  Benign Requests           : ${report.totalLines - report.rawAnomalyCount}`,
            `  Anomaly Rate              : ${anomalyRate}%`,
            '',
            thin,
            '  EXECUTIVE SUMMARY',
            thin,
            '',
            ...report.summary.match(/.{1,68}/g)?.map(l => `  ${l}`) ?? [`  ${report.summary}`],
            '',
            thin,
            '  REMEDIATION ACTION PLAN',
            thin,
            '',
            remediationBlock,
            '',
            divider,
            '  Generated by WebGuard AI Intelligence Platform',
            '  Powered by Isolation Forest + Mistral-7B-Instruct SOC Layer',
            divider,
        ].join('\n');

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `Executive_Briefing_${report.filename.replace(/[^a-z0-9]/gi, '_')}.txt`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };

    const downloadJsonDump = (report: AIReportEntry) => {
        setDlMenuOpen(false);
        const payload = {
            reportId:       report._id,
            filename:       report.filename,
            generatedAt:    report.createdAt,
            riskLevel:      report.riskLevel,
            anomalyCount:   report.rawAnomalyCount,
            totalLines:     report.totalLines,
            anomalyRate:    report.totalLines ? +((report.rawAnomalyCount / report.totalLines) * 100).toFixed(2) : 0,
            summary:        report.summary,
            remediations:   report.remediations,
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `WebGuard_Report_${report._id}.json`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };
    // ─────────────────────────────────────────────────────────────────────────

    const riskCfg = (level: string) => RISK_CONFIG[level] ?? RISK_CONFIG.UNKNOWN;

    // Build dummy radar data from selected AI report anomaly count
    const radarData = selectedAI ? [
        { subject: 'Injection',  value: Math.min(100, selectedAI.rawAnomalyCount * 12), fullMark: 100 },
        { subject: 'Exfil',      value: Math.min(100, selectedAI.rawAnomalyCount * 8),  fullMark: 100 },
        { subject: 'BruteForce', value: Math.min(100, selectedAI.rawAnomalyCount * 15), fullMark: 100 },
        { subject: 'Traversal',  value: Math.min(100, selectedAI.rawAnomalyCount * 10), fullMark: 100 },
        { subject: 'Recon',      value: Math.min(100, selectedAI.rawAnomalyCount * 6),  fullMark: 100 },
        { subject: 'DDoS',       value: Math.min(100, selectedAI.rawAnomalyCount * 9),  fullMark: 100 },
    ] : undefined;

    return (
        <div className="h-[calc(100vh-3.5rem)] flex flex-col gap-0 p-5 pb-0">

            {/* ── Live Threat Intelligence Banner ────────────────────────── */}
            <AnimatePresence>
                {analysisStats && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        className={`mb-3 flex items-center gap-3 px-4 py-2.5 rounded-xl border text-xs font-semibold shrink-0 ${
                            analysisStats.anomalyCount > 0
                                ? 'bg-crimson/8 border-crimson/25 text-crimson'
                                : 'bg-emerald/8 border-emerald/20 text-emerald'
                        }`}
                    >
                        {analysisStats.anomalyCount > 0
                            ? <ShieldAlert className="w-4 h-4 shrink-0 animate-pulse" />
                            : <ShieldCheck  className="w-4 h-4 shrink-0" />
                        }
                        <span className="font-bold">
                            {analysisStats.anomalyCount > 0
                                ? `ACTIVE THREAT REPORT — ${analysisStats.anomalyCount} anomalie${analysisStats.anomalyCount > 1 ? 's' : ''} detected`
                                : 'LAST SCAN CLEAR — No anomalies detected'
                            }
                        </span>
                        <span className="text-slate-500 font-normal">
                            in {analysisStats.totalLines.toLocaleString()} log entries &nbsp;·&nbsp;
                            {(100 - analysisStats.securePercent).toFixed(1)}% threat rate &nbsp;·&nbsp;
                            {analysisStats.securePercent}% secure
                        </span>
                        {pendingEscalations > 0 && (
                            <span className="ml-auto flex items-center gap-1 text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                <TrendingUp className="w-3 h-3" />{pendingEscalations} escalation{pendingEscalations > 1 ? 's' : ''} pending
                            </span>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">

            {/* ── LEFT: Archive / AI Briefings ── */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="col-span-3 glass-panel rounded-2xl flex flex-col overflow-hidden">

                {/* Tab switcher */}
                <div className="flex border-b border-white/8 shrink-0 items-center">
                    {([['ai', 'AI Briefings', BrainCircuit], ['final', 'Archive', Archive]] as const).map(([key, label, Icon]) => (
                        <button key={key} onClick={() => setTab(key)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold transition-all ${tab === key ? 'text-lavender border-b-2 border-lavender' : 'text-slate-500 hover:text-slate-300'}`}>
                            <Icon className="w-3.5 h-3.5" />{label}
                        </button>
                    ))}
                    <button onClick={() => fetchAIReports()}
                        className="px-2.5 py-3 text-slate-600 hover:text-slate-400 transition-colors" title="Refresh">
                        <RefreshCw className="w-3 h-3" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-2 space-y-1.5 scrollbar-thin">
                    {tab === 'ai' && (
                        isLoadingAI ? (
                            <div className="space-y-2 p-1"><SkeletonCard lines={2} /><SkeletonCard lines={2} /></div>
                        ) : aiReports.length === 0 ? (
                            <div className="text-slate-600 p-4 text-xs text-center mt-6 space-y-3">
                                <BrainCircuit className="w-10 h-10 mx-auto opacity-15" />
                                <p className="text-slate-500 text-xs font-semibold">No reports yet</p>
                                <p className="text-slate-700 text-[10px] leading-relaxed">
                                    Go to <span className="text-lavender font-bold">Threat Analysis</span>, upload a log file, run ML Analysis, then click
                                    <span className="text-lavender font-bold"> Generate AI-Augmented Report</span>.
                                </p>
                                <p className="text-slate-700 text-[10px]">Reports will appear here for download.</p>
                            </div>
                        ) : aiReports.map((r) => {
                            const cfg = riskCfg(r.riskLevel);
                            const isSelected = selectedAI?._id === r._id;
                            return (
                                <motion.div key={r._id} whileHover={{ x: 2 }} onClick={() => setSelectedAI(r)}
                                    className={`p-3 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-lavender/8 border-lavender/25' : 'border-transparent hover:bg-white/[0.03] hover:border-white/8'}`}>
                                    <div className="flex items-start justify-between mb-1.5">
                                        <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                                            <Clock className="w-2.5 h-2.5" />{new Date(r.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${cfg.badge}`}>{r.riskLevel}</span>
                                    </div>
                                    <p className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>{r.filename}</p>
                                    <p className="text-[10px] text-slate-600 mt-0.5">{r.rawAnomalyCount} anomalies · {r.totalLines} lines</p>
                                </motion.div>
                            );
                        })
                    )}
                    {tab === 'final' && (
                        reports.length === 0 ? (
                            <div className="text-slate-600 p-4 text-xs text-center mt-4">No final reports filed yet.</div>
                        ) : reports.map((report) => (
                            <motion.div key={report._id} whileHover={{ x: 2 }} onClick={() => setSelectedFinal(report)}
                                className={`p-3 rounded-xl cursor-pointer transition-all border ${selectedFinal?._id === report._id ? 'bg-lavender/8 border-lavender/25' : 'border-transparent hover:bg-white/[0.03] hover:border-white/8'}`}>
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-mono text-[10px] text-slate-500">{new Date(report.created_at).toLocaleDateString()}</span>
                                    <span className={`w-2 h-2 rounded-full ${report.final_decision === 'Confirmed Incident' ? 'bg-crimson' : 'bg-emerald'}`} />
                                </div>
                                <p className="text-xs font-semibold text-slate-300 truncate">{report.final_decision}</p>
                            </motion.div>
                        ))
                    )}
                </div>
            </motion.div>

            {/* ── MIDDLE: Detail view ── */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                className="col-span-5 glass-panel rounded-2xl flex flex-col overflow-hidden">

                <AnimatePresence mode="wait">
                    {tab === 'ai' && selectedAI ? (
                        <motion.div key={selectedAI._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-5 shrink-0">
                                <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <BrainCircuit className="w-4 h-4 text-lavender" />
                                        <span className="text-xs font-bold text-lavender uppercase tracking-wider">AI Intelligence Briefing</span>
                                    </div>
                                    <h1 className="text-lg font-bold text-white leading-tight">{selectedAI.filename}</h1>
                                    <p className="text-xs text-slate-500 mt-0.5 font-mono">{new Date(selectedAI.createdAt).toLocaleString()}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${riskCfg(selectedAI.riskLevel).badge}`}>
                                    {selectedAI.riskLevel} RISK
                                </span>
                            </div>

                            {/* Stats row */}
                            <div className="grid grid-cols-2 gap-3 mb-5 shrink-0">
                                <div className="p-3 rounded-xl bg-crimson/5 border border-crimson/15">
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Anomalies Detected</p>
                                    <p className="text-xl font-bold text-crimson">{selectedAI.rawAnomalyCount}</p>
                                    <p className="text-[10px] text-slate-600">of {selectedAI.totalLines} total lines</p>
                                </div>
                                <div className="p-3 rounded-xl bg-lavender/5 border border-lavender/15">
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Anomaly Rate</p>
                                    <p className="text-xl font-bold text-lavender">
                                        {selectedAI.totalLines ? ((selectedAI.rawAnomalyCount / selectedAI.totalLines) * 100).toFixed(1) : 0}%
                                    </p>
                                    <p className="text-[10px] text-slate-600">of total traffic</p>
                                </div>
                            </div>

                            {/* Executive Summary */}
                            <div className="flex-1 rounded-xl bg-black/30 border border-white/8 p-4 mb-4 overflow-y-auto scrollbar-thin min-h-0">
                                <h3 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-1.5">
                                    <FileCheck className="w-3.5 h-3.5" /> Executive Summary
                                </h3>
                                <p className="text-sm text-slate-300 leading-relaxed">{selectedAI.summary}</p>
                            </div>

                            {/* Download dropdown */}
                            <div ref={dlMenuRef} className="relative shrink-0">
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    onClick={() => setDlMenuOpen(o => !o)}
                                    disabled={downloading}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-lavender to-purple-500 text-slate-900 font-bold flex items-center justify-center gap-2 text-sm hover:shadow-lg hover:shadow-lavender/25 transition-all btn-glow-lavender disabled:opacity-60">
                                    <Download className="w-4 h-4" />
                                    {downloading ? 'Downloading…' : 'Download Report'}
                                    <ChevronDown className={`w-3.5 h-3.5 ml-1 transition-transform ${dlMenuOpen ? 'rotate-180' : ''}`} />
                                </motion.button>

                                <AnimatePresence>
                                    {dlMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -6, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -6, scale: 0.97 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute bottom-full mb-2 left-0 right-0 glass-panel rounded-xl overflow-hidden border border-white/12 z-50 shadow-2xl shadow-black/60"
                                        >
                                            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest px-3 pt-2.5 pb-1">Export Format</p>

                                            {/* Expert CSV */}
                                            <button
                                                onClick={() => downloadExpertCsv(selectedAI._id, selectedAI.filename)}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-lavender/8 transition-colors text-left group"
                                            >
                                                <div className="w-7 h-7 rounded-lg bg-emerald/10 flex items-center justify-center shrink-0 group-hover:bg-emerald/20 transition-colors">
                                                    <FileBadge className="w-3.5 h-3.5 text-emerald" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-white">Expert CSV</p>
                                                    <p className="text-[10px] text-slate-500">Annotated data for SIEM ingestion</p>
                                                </div>
                                            </button>

                                            {/* Executive Briefing TXT */}
                                            <button
                                                onClick={() => downloadExecutiveBriefing(selectedAI)}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-lavender/8 transition-colors text-left group"
                                            >
                                                <div className="w-7 h-7 rounded-lg bg-lavender/10 flex items-center justify-center shrink-0 group-hover:bg-lavender/20 transition-colors">
                                                    <FileText className="w-3.5 h-3.5 text-lavender" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-white">Executive Briefing</p>
                                                    <p className="text-[10px] text-slate-500">Formatted .txt for leadership review</p>
                                                </div>
                                            </button>

                                            {/* JSON Dump */}
                                            <button
                                                onClick={() => downloadJsonDump(selectedAI)}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 pb-3 hover:bg-lavender/8 transition-colors text-left group"
                                            >
                                                <div className="w-7 h-7 rounded-lg bg-terracotta/10 flex items-center justify-center shrink-0 group-hover:bg-terracotta/20 transition-colors">
                                                    <FileJson className="w-3.5 h-3.5 text-terracotta" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-white">Raw JSON</p>
                                                    <p className="text-[10px] text-slate-500">Structured data for API integration</p>
                                                </div>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ) : tab === 'final' && selectedFinal ? (
                        <motion.div key={selectedFinal._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
                            <div className="flex justify-between items-start mb-6 shrink-0">
                                <div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedFinal.final_decision === 'Confirmed Incident' ? 'bg-crimson/15 text-crimson' : 'bg-blue-500/15 text-blue-400'}`}>
                                        {selectedFinal.final_decision}
                                    </span>
                                    <p className="text-xs text-slate-500 font-mono mt-2">ID-{selectedFinal._id.slice(-6).toUpperCase()}</p>
                                </div>
                            </div>
                            <div className="flex-1 rounded-xl bg-black/20 border border-white/8 p-5 mb-4 min-h-0 overflow-auto scrollbar-thin">
                                <h3 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5"><FileCheck className="w-3.5 h-3.5" />Manager Recommendation</h3>
                                <p className="text-sm text-slate-300 leading-relaxed">{selectedFinal.recommendation}</p>
                            </div>
                            <button className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 flex items-center justify-center gap-2 text-sm transition-colors shrink-0">
                                <Download className="w-4 h-4" />Export PDF
                            </button>
                        </motion.div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-600 flex-col gap-3">
                            <Archive className="w-10 h-10 opacity-30" />
                            <p className="text-sm">Select a report to view details</p>
                        </div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* ── RIGHT: Solution Engine + Radar ── */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
                className="col-span-4 flex flex-col gap-4">

                {/* Threat Radar */}
                <div className="glass-panel rounded-2xl p-4 bento-card" style={{ height: 220 }}>
                    <ThreatRadar data={radarData} color={selectedAI?.riskLevel === 'CRITICAL' ? '#DC2626' : selectedAI?.riskLevel === 'HIGH' ? '#E2725B' : '#BDB2FF'} />
                </div>

                {/* Remediation Steps (from AI report) */}
                <AnimatePresence>
                    {tab === 'ai' && selectedAI?.remediations?.length ? (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="glass-panel rounded-2xl p-4 flex flex-col gap-3 bento-card">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-lavender" /> AI Remediation Steps
                            </h3>
                            <div className="space-y-2">
                                {selectedAI.remediations.map((step, i) => (
                                    <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.03] border border-white/6 hover:border-lavender/20 transition-colors">
                                        <span className="text-[10px] font-bold text-lavender bg-lavender/10 w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                                        <p className="text-xs text-slate-300 leading-relaxed">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ) : tab !== 'ai' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex-1 bg-gradient-to-b from-lavender/15 to-purple-900/15 border border-lavender/25 rounded-2xl p-5 flex flex-col relative overflow-hidden bento-card">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-lavender/15 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                                <Zap className="w-4 h-4 text-lavender" /> Solution Engine
                                <span className="ml-auto text-[9px] bg-lavender text-black px-2 py-0.5 rounded-full font-bold uppercase">Manager Only</span>
                            </h2>
                            <div className="space-y-3 relative z-10 flex-1">
                                {[
                                    { title: 'Apply Firewall Rule #8821', desc: 'Block inbound traffic from subnet 192.168.x.x', action: 'Execute Block', accent: true },
                                    { title: 'Rate Limit API Gateway',    desc: 'Throttle to 100 req/min per IP on /auth endpoint', action: 'Configure Limits', accent: false },
                                    { title: 'Patch CVE-2024-9921',       desc: 'Deploy hotfix to payment server nodes', action: 'Deploy Hotfix', accent: false },
                                ].map((item) => (
                                    <div key={item.title} className={`p-3 rounded-xl bg-black/40 border ${item.accent ? 'border-lavender/20 hover:border-lavender/50' : 'border-white/8 hover:border-white/20'} transition-colors`}>
                                        <h4 className="font-bold text-white text-xs mb-1">{item.title}</h4>
                                        <p className="text-[11px] text-slate-400 mb-2">{item.desc}</p>
                                        <button className={`w-full py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all ${item.accent ? 'bg-lavender/10 hover:bg-lavender text-lavender hover:text-black' : 'bg-white/5 hover:bg-white/15 text-white'}`}>
                                            {item.action}
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-3 border-t border-white/8 flex items-center gap-2 relative z-10">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald" />
                                <span className="text-[11px] text-slate-400">System Status: Optimized</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Risk indicator */}
                {tab === 'ai' && selectedAI && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className={`glass-panel rounded-xl p-3 flex items-center gap-3 bento-card border ${riskCfg(selectedAI.riskLevel).badge.includes('crimson') ? 'border-crimson/20' : 'border-lavender/15'}`}>
                        <AlertTriangle className={`w-4 h-4 shrink-0 ${riskCfg(selectedAI.riskLevel).color}`} />
                        <div>
                            <p className="text-xs font-bold text-white">Overall Risk: {selectedAI.riskLevel}</p>
                            <p className="text-[10px] text-slate-500">Based on Mistral-7B SOC analysis</p>
                        </div>
                        <BarChart2 className="w-4 h-4 text-slate-600 ml-auto" />
                    </motion.div>
                )}
            </motion.div>
            </div>{/* end inner grid */}
        </div>
    );
}
