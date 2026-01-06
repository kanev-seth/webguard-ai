import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, FileText, Send, Lock, Eye, AlertOctagon } from 'lucide-react';
import { MOCK_LOGS, MOCK_ANOMALIES } from '../../data';

export function AnalystView() {
    const [selectedLog, setSelectedLog] = useState<string | null>(null);

    return (
        <div className="h-[calc(100vh-8rem)] grid grid-cols-12 gap-6 p-6">

            {/* LEFT PANEL: Log Viewer (Code Editor Style) */}
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="col-span-4 flex flex-col glass-panel rounded-2xl overflow-hidden"
            >
                <div className="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
                    <h3 className="font-mono text-sm text-slate-400">RAW_LOGS.log</h3>
                    <div className="flex gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500/50" />
                        <span className="w-3 h-3 rounded-full bg-yellow-500/50" />
                        <span className="w-3 h-3 rounded-full bg-green-500/50" />
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-4 font-mono text-xs space-y-1 bg-black/40">
                    {MOCK_LOGS.map((log, i) => (
                        <div
                            key={log.id}
                            onClick={() => setSelectedLog(log.id)}
                            className={`
                                cursor-pointer px-2 py-1 rounded transition-colors
                                ${selectedLog === log.id ? 'bg-white/10' : 'hover:bg-white/5'}
                                ${log.level === 'WARN' ? 'text-terracotta' : log.level === 'ERROR' ? 'text-red-400' : 'text-slate-300'}
                            `}
                        >
                            <span className="opacity-50 mr-4 select-none">{i + 1}</span>
                            <span className="mr-3 text-slate-500">[{log.timestamp.split(' ')[1]}]</span>
                            <span className={`mr-3 font-bold ${log.level === 'WARN' ? 'text-terracotta' : log.level === 'ERROR' ? 'text-red-500' : 'text-lavender'}`}>
                                {log.level}
                            </span>
                            <span>{log.message}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* CENTER PANEL: AI Analysis */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="col-span-4 flex flex-col gap-6"
            >
                <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-purle-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Shield className="w-24 h-24 text-lavender" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                        <Eye className="w-5 h-5 mr-2 text-lavender" />
                        AI Analysis
                    </h2>

                    <div className="space-y-4">
                        {MOCK_ANOMALIES.map((anomaly) => (
                            <div key={anomaly.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-lavender/30 transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-slate-200 group-hover:text-lavender transition-colors">{anomaly.type}</h4>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${anomaly.severity === 'critical' ? 'bg-red-500/20 text-red-300' :
                                            anomaly.severity === 'high' ? 'bg-terracotta/20 text-terracotta' : 'bg-blue-500/20 text-blue-300'
                                        }`}>
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
                        ))}
                    </div>
                </div>

                {/* HIDDEN SECTION: Solutions (Correctly blurred) */}
                <div className="flex-1 glass-panel rounded-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-10 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4 border border-white/20">
                            <Lock className="w-6 h-6 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Restricted Access</h3>
                        <p className="text-slate-400 text-sm">Remediation protocols require Manager clearance.</p>
                    </div>

                    {/* Blurred content background hint */}
                    <div className="p-6 opacity-20 blur-sm pointer-events-none select-none">
                        <h3 className="text-lg font-bold mb-4 text-green-400">Recommended Actions</h3>
                        <div className="space-y-4">
                            <div className="h-12 bg-green-500/20 rounded-lg w-full"></div>
                            <div className="h-24 bg-green-500/20 rounded-lg w-full"></div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* RIGHT PANEL: The Workbench */}
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
                        <select className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-slate-300 focus:outline-none focus:border-lavender/50 text-sm">
                            <option>Low Risk</option>
                            <option>Medium Risk</option>
                            <option>High Risk</option>
                            <option>Critical (Immediate Action)</option>
                        </select>
                    </div>

                    <div className="space-y-2 flex-1 flex flex-col">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Manual Observations</label>
                        <textarea
                            className="w-full flex-1 bg-black/20 border border-white/10 rounded-lg p-3 text-slate-300 focus:outline-none focus:border-lavender/50 text-sm font-mono resize-none"
                            placeholder="Enter detailed analysis findings..."
                        ></textarea>
                    </div>

                    <p className="text-xs text-slate-500 italic border-l-2 border-terracotta pl-3 py-1">
                        Note: You are viewing active session data only. Historical archives are restricted.
                    </p>

                    <button className="w-full py-4 rounded-xl bg-gradient-to-r from-lavender to-purple-500 text-slate-900 font-bold hover:shadow-lg hover:shadow-purple-500/20 transition-all active:scale-95 flex items-center justify-center">
                        <Send className="w-4 h-4 mr-2" />
                        Submit to Manager
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
