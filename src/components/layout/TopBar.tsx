import { motion } from 'framer-motion';
import { Shield, LogOut, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSecurity } from '../../context/SecurityContext';
import { MetricWidget } from '../ui/MetricWidget';
import { Sparkline } from '../ui/Sparkline';

const ROUTE_LABELS: Record<string, string> = {
    '/console/ingest':  'Data Ingestion',
    '/console/analyze': 'Threat Analysis',
    '/console/command': 'Command Center',
};

const ROLE_BADGE: Record<string, { label: string; color: string }> = {
    contributor: { label: 'Log Contributor', color: 'bg-slate-700 text-slate-300' },
    analyst:     { label: 'Security Analyst', color: 'bg-lavender/20 text-lavender' },
    manager:     { label: 'Security Manager', color: 'bg-emerald/15 text-emerald' },
};

export function TopBar() {
    const { user, logout } = useAuth();
    const { escalations } = useSecurity();
    const { pathname } = useLocation();

    if (!user) return null;

    const pageLabel = ROUTE_LABELS[pathname] ?? 'Console';
    const badge     = ROLE_BADGE[user.role];
    const pending   = escalations.filter((e) => e.status === 'pending').length;

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="h-14 shrink-0 flex items-center px-6 gap-4 border-b border-white/8 bg-obsidian/80 backdrop-blur-xl z-40"
        >
            {/* Logo — clicking returns to landing */}
            <Link to="/" className="flex items-center gap-2 mr-2 group">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-lavender to-purple-500 flex items-center justify-center shadow-md shadow-lavender/20 group-hover:shadow-lavender/40 transition-all">
                    <Shield className="w-4 h-4 text-slate-900" />
                </div>
                <span className="font-bold text-sm text-white tracking-tight hidden sm:block group-hover:text-lavender transition-colors">WebGuard AI</span>
            </Link>


            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-xs text-slate-500">
                <span>Console</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-slate-300 font-medium">{pageLabel}</span>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Metric Widgets — only for analyst + manager */}
            {user.role !== 'contributor' && (
                <div className="flex items-center gap-2">
                    <MetricWidget
                        label="Secure Traffic"
                        sub="Last 24 hours"
                        variant="emerald"
                        ring
                        ringProgress={97}
                        value="97"
                    />
                    <MetricWidget
                        label="Active Threats"
                        sub={`${pending} pending review`}
                        variant="crimson"
                        value={pending}
                    />
                    <div className="flex flex-col items-end gap-0.5 px-3 py-1.5 rounded-xl border border-white/8 bg-white/3">
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider">24h Traffic</span>
                        <Sparkline width={100} height={28} color="#BDB2FF" />
                    </div>
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
                <button
                    onClick={logout}
                    title="Sign out"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-crimson hover:bg-crimson/10 transition-all"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        </motion.header>
    );
}
