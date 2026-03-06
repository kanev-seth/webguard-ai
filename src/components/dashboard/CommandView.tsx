import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Clock, CheckCircle2, AlertTriangle, MessageSquareQuote } from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import { RemediationPanel } from './RemediationPanel';
import type { Escalation } from '../../context/SecurityContext';

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
}

export function CommandView() {
    const { escalations, auditTrail } = useSecurity();
    const [selected, setSelected] = useState<Escalation | null>(
        escalations.find(e => e.status === 'pending') ?? null
    );

    const pending  = escalations.filter(e => e.status === 'pending');
    const resolved = escalations.filter(e => e.status === 'resolved');

    // Keep selected in sync — if it gets resolved externally, keep showing it (read-only) or clear
    const displaySelected = selected
        ? (escalations.find(e => e.id === selected.id) ?? null)
        : null;

    return (
        <div className="h-[calc(100vh-3.5rem)] flex flex-col gap-4 p-6 overflow-hidden">

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="shrink-0">
                <h1 className="text-2xl font-bold text-white mb-0.5">Command Center</h1>
                <p className="text-sm text-slate-500">Review analyst escalations and deploy remediation actions.</p>
            </motion.div>

            {/* 3-column layout */}
            <div className="flex-1 min-h-0 grid grid-cols-12 gap-4">

                {/* ── LEFT: Escalation Queue ── */}
                <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="col-span-3 glass-panel rounded-2xl flex flex-col overflow-hidden"
                >
                    <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <ShieldAlert className="w-3.5 h-3.5 text-crimson" />
                            Escalation Queue
                        </h3>
                        {pending.length > 0 && (
                            <span className="text-[10px] bg-crimson/20 text-crimson px-2 py-0.5 rounded-full font-bold animate-pulse">
                                {pending.length} pending
                            </span>
                        )}
                    </div>

                    <div className="flex-1 overflow-auto scrollbar-thin p-2 space-y-1">
                        {/* Pending entries */}
                        {pending.length === 0 && (
                            <div className="p-4 text-xs text-slate-600 text-center">No pending escalations.</div>
                        )}
                        {pending.map((esc) => (
                            <motion.button
                                key={esc.id}
                                layout
                                onClick={() => setSelected(esc)}
                                className={`w-full text-left p-3 rounded-xl border transition-all ${
                                    displaySelected?.id === esc.id
                                        ? 'bg-crimson/10 border-crimson/30'
                                        : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-mono text-xs text-crimson font-bold">{esc.threat.ip}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-pulse" />
                                </div>
                                {/* Analyst name prominently */}
                                <div className="text-[10px] text-lavender font-semibold mb-1 flex items-center gap-1">
                                    <MessageSquareQuote className="w-3 h-3" />
                                    {esc.analystName}
                                </div>
                                <p className="text-[11px] text-slate-400 line-clamp-2 mb-1 leading-relaxed">{esc.analystComment}</p>
                                <div className="flex items-center gap-1 text-[10px] text-slate-600">
                                    <Clock className="w-2.5 h-2.5" />
                                    {timeAgo(esc.submittedAt)}
                                </div>
                            </motion.button>
                        ))}

                        {/* Resolved divider */}
                        {resolved.length > 0 && (
                            <>
                                <div className="pt-2 pb-1 px-2 text-[10px] text-slate-600 uppercase tracking-wider">Resolved</div>
                                {resolved.map((esc) => (
                                    <motion.button
                                        key={esc.id}
                                        layout
                                        onClick={() => setSelected(esc)}
                                        className={`w-full text-left p-3 rounded-xl border transition-all opacity-50 ${
                                            displaySelected?.id === esc.id
                                                ? 'bg-white/8 border-white/20 opacity-80'
                                                : 'border-transparent hover:bg-white/5'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-3 h-3 text-emerald" />
                                            <span className="font-mono text-xs text-slate-400">{esc.threat.ip}</span>
                                        </div>
                                    </motion.button>
                                ))}
                            </>
                        )}
                    </div>
                </motion.div>

                {/* ── CENTER: Threat Detail (with prominent analyst notes) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    className="col-span-5 glass-panel rounded-2xl flex flex-col overflow-hidden"
                >
                    <div className="p-4 border-b border-white/10 shrink-0">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Threat Detail</h3>
                    </div>

                    <div className="flex-1 p-5 overflow-auto scrollbar-thin">
                        <AnimatePresence mode="wait">
                            {!displaySelected ? (
                                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="h-full flex items-center justify-center text-slate-600 text-sm">
                                    Select an escalation to review
                                </motion.div>
                            ) : (
                                <motion.div key={displaySelected.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

                                    {/* Status badge */}
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                            displaySelected.status === 'pending'
                                                ? 'bg-crimson/20 text-crimson'
                                                : 'bg-emerald/20 text-emerald'
                                        }`}>
                                            {displaySelected.status === 'pending' ? '⚠ Pending Review' : '✓ Resolved'}
                                        </span>
                                        <span className="text-xs text-slate-500">{timeAgo(displaySelected.submittedAt)}</span>
                                    </div>

                                    {/* Fields grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            ['IP Address', displaySelected.threat.ip],
                                            ['Method',     displaySelected.threat.method],
                                            ['Status Code', String(displaySelected.threat.status)],
                                            ['Risk Score',  displaySelected.threat.anomaly_score.toFixed(4)],
                                        ].map(([label, val]) => (
                                            <div key={label} className="p-3 rounded-xl bg-white/4 border border-white/8">
                                                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{label}</div>
                                                <div className="font-mono text-sm text-slate-200">{val}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* URL */}
                                    <div className="p-3 rounded-xl bg-white/4 border border-white/8">
                                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Target URL</div>
                                        <div className="font-mono text-xs text-slate-300 break-all">{displaySelected.threat.url}</div>
                                    </div>

                                    {/* ML Reasons */}
                                    {displaySelected.threat.reasons.length > 0 && (
                                        <div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Detection Signals</div>
                                            <ul className="space-y-1.5">
                                                {displaySelected.threat.reasons.map((r, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300 p-2.5 rounded-lg bg-crimson/5 border border-crimson/15">
                                                        <AlertTriangle className="w-3 h-3 text-crimson mt-0.5 shrink-0" />
                                                        {r}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* ── Analyst Notes (the most important section) ── */}
                                    <div className="p-5 rounded-xl bg-lavender/8 border border-lavender/25 relative overflow-hidden">
                                        {/* Glow blob */}
                                        <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-lavender/15 blur-2xl pointer-events-none" />

                                        {/* Header */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <MessageSquareQuote className="w-4 h-4 text-lavender" />
                                            <span className="text-xs font-bold text-lavender uppercase tracking-wider">
                                                Analyst Notes
                                            </span>
                                            <span className="ml-auto text-[10px] text-slate-500 font-mono">
                                                — {displaySelected.analystName}
                                            </span>
                                        </div>

                                        {/* The comment itself */}
                                        <blockquote className="text-sm text-slate-200 leading-relaxed font-mono border-l-2 border-lavender/40 pl-4 italic">
                                            "{displaySelected.analystComment}"
                                        </blockquote>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* ── RIGHT: Remediation + Audit ── */}
                <motion.div
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="col-span-4 flex flex-col gap-4 overflow-hidden"
                >
                    {/* Remediation engine card */}
                    <div className="flex-1 glass-panel rounded-2xl p-5 overflow-hidden flex flex-col neon-border-primary relative">
                        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-lavender/8 blur-3xl pointer-events-none" />
                        <RemediationPanel
                            escalation={displaySelected?.status === 'pending' ? displaySelected : null}
                        />
                    </div>

                    {/* Audit trail */}
                    <div className="glass-panel rounded-2xl p-4 max-h-52 flex flex-col shrink-0">
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3 text-emerald" />
                            Remediation History
                        </h3>
                        <div className="flex-1 overflow-auto scrollbar-thin space-y-1.5">
                            {auditTrail.length === 0
                                ? <p className="text-xs text-slate-600 text-center py-2">No actions taken yet.</p>
                                : auditTrail.map((entry) => (
                                    <div key={entry.id} className="flex items-center gap-2 p-2 rounded-lg bg-emerald/5 border border-emerald/15">
                                        <CheckCircle2 className="w-3 h-3 text-emerald shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-[11px] text-slate-300">{entry.ip}</span>
                                                <span className="text-[10px] text-slate-500 truncate">→ {entry.action}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-600">{timeAgo(entry.resolvedAt)} · {entry.resolvedBy}</div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
