import { motion } from 'framer-motion';
import { Shield, LogOut, ChevronRight, Activity } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSecurity } from '../../context/SecurityContext';
import { MetricWidget } from '../ui/MetricWidget';
import { SystemPulseLine } from '../ui/SystemPulseLine';

const ROUTE_LABELS: Record<string, string> = {
    '/console/ingest':  'Data Ingestion',
    '/console/analyze': 'Threat Analysis',
    '/console/command': 'Command Center',
};

const ROLE_BADGE: Record<string, { label: string; color: string }> = {
    contributor: { label: 'Log Contributor',   color: 'bg-slate-700 text-slate-300' },
    analyst:     { label: 'Security Analyst',   color: 'bg-lavender/20 text-lavender' },
    manager:     { label: 'Security Manager',   color: 'bg-emerald/15 text-emerald' },
};

export function TopBar() {
    const { user, logout } = useAuth();
    const { escalations, analysisStats } = useSecurity();
    const { pathname }     = useLocation();

    if (!user) return null;

    const pageLabel  = ROUTE_LABELS[pathname] ?? 'Console';
    const badge      = ROLE_BADGE[user.role];
    const pending    = escalations.filter((e) => e.status === 'pending').length;

    // Live threat metrics — prefer current analysis stats, fall back to escalation count
    const liveAnomalies    = analysisStats?.anomalyCount ?? pending;
    const liveSecurePct    = analysisStats?.securePercent ?? (pending > 0 ? 97 : 100);
    const isThreat         = liveAnomalies > 0 || pending > 2;
    const threatSub        = analysisStats
        ? `${liveAnomalies} in last scan`
        : `${pending} pending review`;

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="h-14 shrink-0 flex items-center px-6 gap-4 border-b border-white/[0.06] z-40 relative"
            style={{
                background: 'linear-gradient(90deg, rgba(2,6,23,0.95) 0%, rgba(15,23,42,0.95) 100%)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                boxShadow: '0 1px 0 rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.4)',
            }}
        >
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 mr-2 group shrink-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-lavender to-purple-400 flex items-center justify-center shadow-md shadow-lavender/25 group-hover:shadow-lavender/50 group-hover:scale-105 transition-all duration-200">
                    <Shield className="w-4 h-4 text-slate-900" />
                </div>
                <div className="hidden sm:flex flex-col">
                    <span className="font-bold text-sm text-white tracking-tight leading-none group-hover:text-lavender transition-colors">WebGuard AI</span>
                    <span className="text-[9px] text-slate-600 tracking-widest uppercase">Threat Intelligence</span>
                </div>
            </Link>

            {/* Divider */}
            <div className="w-px h-6 bg-white/8 shrink-0" />

            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-xs text-slate-500">
                <span>Console</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-slate-300 font-medium">{pageLabel}</span>
            </div>

            <div className="flex-1" />

            {/* Metric widgets — analyst + manager only */}
            {user.role !== 'contributor' && (
                <div className="flex items-center gap-2">
                    <MetricWidget
                        label="Secure Traffic"
                        sub={analysisStats ? `${analysisStats.totalLines.toLocaleString()} entries` : 'Last 24 hours'}
                        variant="emerald"
                        ring
                        ringProgress={liveSecurePct}
                        value={String(liveSecurePct) + '%'}
                    />
                    <MetricWidget
                        label="Active Threats"
                        sub={threatSub}
                        variant="crimson"
                        value={liveAnomalies}
                    />

                    {/* ── System Pulse Line (Live Health) ─────────────────── */}
                    <motion.div
                        className="flex flex-col items-end gap-0.5 px-3 py-1.5 rounded-xl border border-white/8 bg-white/[0.025] relative overflow-hidden"
                        whileHover={{ borderColor: 'rgba(189,178,255,0.2)', backgroundColor: 'rgba(255,255,255,0.04)' }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Glow behind the waveform when threat */}
                        {isThreat && (
                            <div className="absolute inset-0 bg-crimson/5 rounded-xl" />
                        )}
                        <div className="flex items-center gap-1.5 relative z-10">
                            <Activity className={`w-2.5 h-2.5 ${isThreat ? 'text-crimson' : 'text-emerald'}`} />
                            <span className={`text-[9px] uppercase tracking-wider ${isThreat ? 'text-crimson' : 'text-slate-500'}`}>
                                System Health
                            </span>
                        </div>
                        <div className="relative z-10">
                            <SystemPulseLine
                                width={110}
                                height={28}
                                color="#BDB2FF"
                                threatColor="#DC2626"
                                isThreat={isThreat}
                            />
                        </div>
                    </motion.div>
                </div>
            )}

            {/* User identity */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-white/10">
                <div className="text-right hidden sm:block">
                    <div className="text-xs font-semibold text-white leading-tight">{user.name}</div>
                    <div className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium inline-block mt-0.5 ${badge.color}`}>
                        {badge.label}
                    </div>
                </div>

                {/* Avatar circle */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-lavender/30 to-purple-600/30 border border-lavender/20 flex items-center justify-center text-[11px] font-bold text-lavender">
                    {user.name.charAt(0).toUpperCase()}
                </div>

                <motion.button
                    onClick={logout}
                    title="Sign out"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-crimson hover:bg-crimson/10 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                </motion.button>
            </div>
        </motion.header>
    );
}
