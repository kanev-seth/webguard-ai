import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSecurity, type AnalystRow } from '../../context/SecurityContext';

interface AnalystNoteModalProps {
    row: AnalystRow | null;
    onClose: () => void;
}

export function AnalystNoteModal({ row, onClose }: AnalystNoteModalProps) {
    const { user } = useAuth();
    const { addEscalation } = useSecurity();
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);

    if (!row) return null;

    const handleSubmit = () => {
        if (!comment.trim()) return;
        addEscalation(row, comment.trim(), user?.name ?? 'Analyst');
        setSubmitted(true);
        setTimeout(() => { setSubmitted(false); setComment(''); onClose(); }, 1800);
    };

    return (
        <AnimatePresence>
            {row && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Side panel */}
                    <motion.div
                        key="panel"
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
                        className="fixed right-0 top-0 h-full w-[420px] z-50 glass-panel border-l border-white/10 flex flex-col shadow-2xl shadow-black/60"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-crimson" />
                                <h2 className="font-bold text-white text-sm">Anomaly Detail</h2>
                            </div>
                            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-auto p-6 space-y-5 scrollbar-thin">
                            {/* Threat data grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    ['IP Address', row.ip],
                                    ['Method', row.method],
                                    ['Status', String(row.status)],
                                    ['Score', row.anomaly_score.toFixed(4)],
                                ].map(([label, val]) => (
                                    <div key={label} className="p-3 rounded-xl bg-white/5 border border-white/8">
                                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{label}</div>
                                        <div className="font-mono text-sm text-slate-200">{val}</div>
                                    </div>
                                ))}
                            </div>

                            {/* URL */}
                            <div className="p-3 rounded-xl bg-white/5 border border-white/8">
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">URL</div>
                                <div className="font-mono text-xs text-slate-300 break-all">{row.url}</div>
                            </div>

                            {/* Reasons */}
                            {row.reasons.length > 0 && (
                                <div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Detection Reasons</div>
                                    <ul className="space-y-1.5">
                                        {row.reasons.map((r, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                                                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-crimson shrink-0" />
                                                {r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Analyst comment */}
                            <div>
                                <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-2">
                                    Analyst Comments / Context
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Describe your findings, suspected attack vector, or recommended action…"
                                    rows={5}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-slate-200 font-mono placeholder:text-slate-600 focus:outline-none focus:border-lavender/40 resize-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/10">
                            <AnimatePresence mode="wait">
                                {submitted ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        className="flex items-center justify-center gap-2 py-3 text-emerald text-sm font-semibold"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        Escalated to Manager
                                    </motion.div>
                                ) : (
                                    <motion.button
                                        key="submit"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        onClick={handleSubmit}
                                        disabled={!comment.trim()}
                                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-lavender to-purple-500 text-slate-900 font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-lavender/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <Send className="w-4 h-4" />
                                        Submit to Manager
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
