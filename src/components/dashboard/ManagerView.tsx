import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Archive, ShieldCheck, AlertCircle, Download, FileCheck, ChevronRight, Zap } from 'lucide-react';
import { MOCK_REPORTS, type Report } from '../../data';

export function ManagerView() {
    const [selectedReport, setSelectedReport] = useState<Report>(MOCK_REPORTS[0]);

    return (
        <div className="h-[calc(100vh-8rem)] grid grid-cols-12 gap-6 p-6">

            {/* LEFT PANEL: The Archive */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="col-span-3 glass-panel rounded-2xl flex flex-col overflow-hidden"
            >
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="font-bold text-white flex items-center">
                        <Archive className="w-5 h-5 mr-2 text-slate-400" />
                        Case Archive
                    </h2>
                    <span className="text-xs bg-white/10 px-2 py-1 rounded text-slate-400">30 Days</span>
                </div>
                <div className="flex-1 overflow-auto p-2 space-y-2">
                    {MOCK_REPORTS.map((report) => (
                        <div
                            key={report.id}
                            onClick={() => setSelectedReport(report)}
                            className={`
                                p-4 rounded-xl cursor-pointer transition-all border
                                ${selectedReport.id === report.id
                                    ? 'bg-lavender/10 border-lavender/30 shadow-lg shadow-lavender/5'
                                    : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'
                                }
                            `}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-mono text-xs text-slate-500">{report.date}</span>
                                <span className={`w-2 h-2 rounded-full ${report.severity === 'critical' ? 'bg-red-500' : report.severity === 'high' ? 'bg-terracotta' : 'bg-blue-400'}`} />
                            </div>
                            <h4 className={`text-sm font-medium mb-1 ${selectedReport.id === report.id ? 'text-white' : 'text-slate-300'}`}>
                                {report.title}
                            </h4>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">{report.analyst}</span>
                                {report.status === 'pending' && <span className="text-terracotta bg-terracotta/10 px-1.5 py-0.5 rounded">Pending</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* MIDDLE PANEL: Incident Review */}
            <motion.div
                layoutId="incident-card"
                className="col-span-5 glass-panel rounded-2xl flex flex-col p-8"
            >
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${selectedReport.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-terracotta/20 text-terracotta'
                                }`}>
                                {selectedReport.severity} Severity
                            </span>
                            <span className="text-slate-500 text-sm font-mono">CASE-{selectedReport.id.toUpperCase()}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white leading-tight">{selectedReport.title}</h1>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Reported By</label>
                        <div className="font-mono text-slate-300">{selectedReport.analyst}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Date</label>
                        <div className="font-mono text-slate-300">{selectedReport.date}</div>
                    </div>
                </div>

                <div className="flex-1 rounded-xl bg-black/20 border border-white/10 p-6 mb-6">
                    <h3 className="text-sm font-bold text-slate-400 mb-2 flex items-center">
                        <FileCheck className="w-4 h-4 mr-2" />
                        Analyst Observations
                    </h3>
                    <p className="text-slate-300 leading-relaxed text-sm">
                        Detailed investigation reveals anomalous traffic patterns consistent with the reported severity.
                        Source IP addresses originate from known botnet subnets.
                        Recommended immediate intervention to prevent data exfiltration.
                    </p>
                </div>

                <div className="flex gap-4">
                    <button className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 transition-colors flex items-center justify-center text-sm font-medium">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                    </button>
                    <button className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 transition-colors flex items-center justify-center text-sm font-medium">
                        <Archive className="w-4 h-4 mr-2" />
                        Archive Case
                    </button>
                </div>
            </motion.div>

            {/* RIGHT PANEL: Solution Engine (EXCLUSIVE) */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="col-span-4 flex flex-col gap-6"
            >
                <div className="bg-gradient-to-b from-lavender/20 to-purple-900/20 backdrop-blur-xl border border-lavender/30 rounded-2xl p-6 h-full flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-lavender/20 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none" />

                    <h2 className="text-xl font-bold text-white mb-6 flex items-center relative z-10">
                        <Zap className="w-5 h-5 mr-2 text-lavender" />
                        Solution Engine
                        <span className="ml-auto text-[10px] bg-lavender text-black px-2 py-0.5 rounded-full font-bold uppercase">Manager Only</span>
                    </h2>

                    <div className="space-y-4 relative z-10">
                        <div className="p-4 rounded-xl bg-black/40 border border-lavender/20 shadow-lg shadow-lavender/5 group hover:border-lavender/50 transition-colors cursor-pointer">
                            <h4 className="font-bold text-white mb-1 group-hover:text-lavender transition-colors">Apply Firewall Rule #8821</h4>
                            <p className="text-xs text-slate-400 mb-3">Block inbound traffic from subnet 192.168.x.x due to high velocity requests.</p>
                            <button className="w-full py-2 bg-lavender/10 hover:bg-lavender text-lavender hover:text-black rounded-lg text-xs font-bold uppercase transition-all">
                                Execute Block
                            </button>
                        </div>

                        <div className="p-4 rounded-xl bg-black/40 border border-white/10 group hover:border-white/30 transition-colors cursor-pointer">
                            <h4 className="font-bold text-white mb-1">Rate Limit API Gateway</h4>
                            <p className="text-xs text-slate-400 mb-3">Throttle requests to 100/min per IP for the authentication endpoint.</p>
                            <button className="w-full py-2 bg-white/5 hover:bg-white/20 text-white rounded-lg text-xs font-bold uppercase transition-all">
                                Configure Limits
                            </button>
                        </div>

                        <div className="p-4 rounded-xl bg-black/40 border border-white/10 group hover:border-white/30 transition-colors cursor-pointer">
                            <h4 className="font-bold text-white mb-1">Patch CVE-2024-9921</h4>
                            <p className="text-xs text-slate-400 mb-3">Deploy hotfix to payment server nodes.</p>
                            <button className="w-full py-2 bg-white/5 hover:bg-white/20 text-white rounded-lg text-xs font-bold uppercase transition-all">
                                Deploy Hotfix
                            </button>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/10">
                        <div className="flex items-center text-xs text-slate-400">
                            <ShieldCheck className="w-4 h-4 mr-2 text-green-400" />
                            System Status: Optimized
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
