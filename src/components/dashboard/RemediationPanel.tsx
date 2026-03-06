import { motion, AnimatePresence } from 'framer-motion';
import { ShieldOff, Gauge, UserX, Server } from 'lucide-react';
import type { Escalation } from '../../context/SecurityContext';
import { useSecurity } from '../../context/SecurityContext';
import { useAuth } from '../../context/AuthContext';

const ACTIONS = [
    { key: 'block',    icon: ShieldOff,  label: 'Block IP at Edge Firewall', desc: 'Drop all inbound packets from this IP at the network perimeter.',       color: 'crimson' },
    { key: 'rate',     icon: Gauge,      label: 'Rate Limit Endpoint',        desc: 'Throttle requests to 50/min per IP for the targeted path.',             color: 'amber'   },
    { key: 'disable',  icon: UserX,      label: 'Disable Compromised Account',desc: 'Suspend credentials associated with this IP in the identity provider.',  color: 'lavender'},
    { key: 'quarantine', icon: Server,    label: 'Quarantine Host',            desc: 'Isolate the targeted server segment until forensic analysis completes.', color: 'slate'   },
];

const ACTION_STYLES: Record<string, { border: string; bg: string; text: string; btn: string }> = {
    crimson:  { border: 'border-crimson/25',  bg: 'hover:bg-crimson/10',  text: 'text-crimson',  btn: 'bg-crimson/10 hover:bg-crimson text-crimson hover:text-white'    },
    amber:    { border: 'border-amber-500/25', bg: 'hover:bg-amber-500/10',text: 'text-amber-400',btn: 'bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black'},
    lavender: { border: 'border-lavender/25', bg: 'hover:bg-lavender/10', text: 'text-lavender', btn: 'bg-lavender/10 hover:bg-lavender text-lavender hover:text-black'  },
    slate:    { border: 'border-white/15',    bg: 'hover:bg-white/8',     text: 'text-slate-400', btn: 'bg-white/5 hover:bg-white/20 text-slate-300'                     },
};

interface RemediationPanelProps {
    escalation: Escalation | null;
}

export function RemediationPanel({ escalation }: RemediationPanelProps) {
    const { resolveEscalation } = useSecurity();
    const { user } = useAuth();

    const handleAction = (action: string) => {
        if (!escalation) return;
        resolveEscalation(escalation.id, action, user?.name ?? 'Manager');
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-white text-sm flex items-center gap-2">
                    <ShieldOff className="w-4 h-4 text-lavender" />
                    Remediation Engine
                </h2>
                <span className="text-[10px] bg-lavender/15 text-lavender px-2 py-0.5 rounded-full font-bold uppercase">Manager Only</span>
            </div>

            {!escalation ? (
                <div className="flex-1 flex items-center justify-center text-slate-600 text-sm text-center">
                    Select a threat from the queue to activate the remediation engine.
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={escalation.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 flex flex-col gap-3 overflow-auto scrollbar-thin"
                    >
                        {/* Threat summary pill */}
                        <div className="p-3 rounded-xl bg-crimson/10 border border-crimson/25 mb-1">
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Target IP</div>
                            <div className="font-mono text-sm text-crimson font-bold">{escalation.threat.ip}</div>
                        </div>

                        {ACTIONS.map((a) => {
                            const s = ACTION_STYLES[a.color];
                            return (
                                <div key={a.key} className={`p-4 rounded-xl bg-black/30 border ${s.border} ${s.bg} transition-colors`}>
                                    <div className="flex items-start gap-3 mb-3">
                                        <a.icon className={`w-4 h-4 mt-0.5 ${s.text} shrink-0`} />
                                        <div>
                                            <h4 className={`text-xs font-bold ${s.text} mb-0.5`}>{a.label}</h4>
                                            <p className="text-[11px] text-slate-500 leading-relaxed">{a.desc}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAction(a.label)}
                                        className={`w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${s.btn}`}
                                    >
                                        Execute
                                    </button>
                                </div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
}
