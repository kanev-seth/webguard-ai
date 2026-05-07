import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ArrowRight, ShieldCheck, Zap, Activity, BrainCircuit,
    ShieldAlert, Lock, Eye, Users, BarChart3, FileSearch,
    CheckCircle2, AlertTriangle, Database, Cpu,
} from 'lucide-react';

function StatCard({ value, label, sub, color }: { value: string; label: string; sub: string; color: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col items-center px-8 py-6 rounded-2xl glass-card border-t ${color}`}
        >
            <span className="text-4xl font-bold text-white tracking-tight font-outfit">{value}</span>
            <span className="text-sm font-semibold text-slate-300 mt-2">{label}</span>
            <span className="text-[11px] text-slate-500 mt-1">{sub}</span>
        </motion.div>
    );
}

function FeatureCard({ icon: Icon, title, desc, accent, delay }: {
    icon: typeof ShieldCheck; title: string; desc: string; accent: string; delay: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col gap-4 p-6 rounded-2xl glass-card bento-card cursor-default"
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accent} bg-opacity-10 backdrop-blur-md`}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-light">{desc}</p>
        </motion.div>
    );
}

function RoleCard({ icon: Icon, role, tasks, color, delay }: {
    icon: typeof ShieldCheck; role: string; tasks: string[]; color: string; delay: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.5 }}
            className="flex flex-col gap-5 p-8 rounded-2xl glass-card bento-card"
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-white mb-4 tracking-tight">{role}</h3>
                <ul className="space-y-3">
                    {tasks.map((t) => (
                        <li key={t} className="flex items-start gap-3 text-sm text-slate-400 font-light leading-snug">
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            {t}
                        </li>
                    ))}
                </ul>
            </div>
        </motion.div>
    );
}

function ThreatChip({ label, severity }: { label: string; severity: 'critical' | 'high' | 'medium' }) {
    const cfg = {
        critical: 'bg-crimson/10 neon-border-crimson text-crimson',
        high:     'bg-amber-500/10 border-amber-500/40 text-amber-500',
        medium:   'bg-slate-700/30 border-slate-600/50 text-slate-300',
    }[severity];
    return (
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold tracking-wide ${cfg}`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            {label}
        </span>
    );
}

const FEATURES = [
    { icon: BrainCircuit,  title: 'Isolation Forest ML Engine', desc: 'Unsupervised anomaly detection trained on real access log distributions. Flags statistical outliers with zero labelled training data required.', accent: 'bg-primary text-primary', delay: 0.4 },
    { icon: ShieldAlert,   title: 'Deterministic Rule Engine',  desc: 'Hard-coded signatures for SQLi, XSS, path traversal, command injection, and 20+ scanner fingerprints — fires before the ML model.', accent: 'bg-crimson text-crimson', delay: 0.5 },
    { icon: Zap,           title: 'Real-Time Expert Briefings', desc: 'AI-generated executive summaries with risk level, threat actor profiling, and category-specific remediation playbooks — no API key needed.', accent: 'bg-emerald text-emerald', delay: 0.6 },
    { icon: Users,         title: 'Role-Based SOC Workflow',    desc: 'Contributor → Analyst → Manager escalation chain with full audit trail, analyst notes, and one-click remediation actions.', accent: 'bg-blue-400 text-blue-400', delay: 0.7 },
    { icon: BarChart3,     title: 'Attack Vector Radar',        desc: 'Six-axis threat visualisation across Injection, Exfil, Brute-Force, Traversal, Recon, and DDoS categories in the Manager command centre.', accent: 'bg-amber-400 text-amber-400', delay: 0.8 },
    { icon: Database,      title: 'MongoDB Persistence',        desc: 'All AI reports, escalations, analyst notes, and audit trail entries persisted to MongoDB with structured schemas and TTL controls.', accent: 'bg-purple-400 text-purple-400', delay: 0.9 },
];

const ROLES = [
    {
        icon: Lock, role: 'Log Contributor', color: 'bg-slate-700',
        tasks: ['Upload Apache / Nginx access logs', 'Track upload history and queue status', 'Receive confirmation on log processing'],
        delay: 0.3,
    },
    {
        icon: Eye, role: 'Security Analyst', color: 'bg-primary',
        tasks: ['Run ML + rule-based anomaly detection', 'Inspect flagged requests with full reasons', 'Escalate confirmed threats with analyst notes', 'Generate AI-augmented expert reports'],
        delay: 0.4,
    },
    {
        icon: ShieldCheck, role: 'Security Manager', color: 'bg-emerald',
        tasks: ['View live threat counts in dashboard header', 'Review AI briefings and remediation steps', 'Deploy firewall rules and rate limits', 'Download reports in CSV / TXT / JSON'],
        delay: 0.5,
    },
];

const THREATS = [
    { label: 'SQL Injection',        severity: 'critical' as const },
    { label: 'Command Injection',    severity: 'critical' as const },
    { label: 'Path Traversal / LFI', severity: 'critical' as const },
    { label: 'Data Exfiltration',    severity: 'critical' as const },
    { label: 'XSS Payloads',         severity: 'high'     as const },
    { label: 'Brute Force Auth',     severity: 'high'     as const },
    { label: 'Scanner UAs',          severity: 'high'     as const },
    { label: 'Reconnaissance',       severity: 'medium'   as const },
    { label: 'Automated Scripting',  severity: 'medium'   as const },
    { label: 'Anomalous Requests',   severity: 'medium'   as const },
];

export default function Landing() {
    return (
        <div className="relative min-h-screen w-full overflow-hidden mesh-bg flex flex-col">
            {/* ── Nav ── */}
            <nav className="relative z-10 flex items-center justify-between px-12 py-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-white text-lg tracking-tight leading-none font-outfit">WebGuard AI</span>
                        <span className="text-[10px] text-primary/80 tracking-[0.2em] uppercase mt-1">Threat Intelligence</span>
                    </div>
                </div>
                <div className="flex items-center gap-8">
                    <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</a>
                    <a href="#workflow" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Workflow</a>
                    <Link
                        to="/login"
                        className="btn-outline-premium px-6 py-2.5 text-sm"
                    >
                        Sign In
                    </Link>
                </div>
            </nav>

            {/* ── Hero ── */}
            <main className="relative z-10 flex-1 flex flex-col items-center px-6 pt-20 pb-0">
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass-panel border-primary/30 mb-8"
                >
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                    </span>
                    <span className="text-xs text-primary font-bold tracking-widest uppercase">AI-Powered SOC Platform</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="text-5xl sm:text-7xl font-bold text-white leading-[1.1] tracking-tight max-w-5xl mb-8 text-center"
                >
                    Intelligent Log Analysis.<br/>
                    <span className="text-primary" style={{ textShadow: '0 0 40px rgba(189, 178, 255, 0.4)' }}>
                        Zero Compromise.
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg sm:text-xl text-slate-400 max-w-3xl leading-relaxed mb-12 text-center font-light"
                >
                    WebGuard AI fuses Isolation Forest anomaly detection with a deterministic rule engine, delivering expert-grade security briefings and a full analyst-to-manager escalation workflow.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex items-center gap-6 mb-24"
                >
                    <Link
                        to="/login"
                        className="btn-premium px-8 py-4 text-base shadow-2xl flex items-center gap-3"
                    >
                        Access Console
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <a
                        href="#features"
                        className="btn-outline-premium px-8 py-4 text-base flex items-center gap-3"
                    >
                        <Activity className="w-5 h-5" />
                        See How It Works
                    </a>
                </motion.div>

                {/* Live stats row */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex flex-wrap justify-center gap-6 mb-32"
                >
                    <StatCard value="10+" label="Threat Categories" sub="SQL, XSS, LFI, RCE &amp; more" color="border-primary/50" />
                    <StatCard value="52+"  label="Detection Patterns" sub="Deterministic rule engine" color="border-crimson/50" />
                    <StatCard value="3"    label="User Roles" sub="Contributor · Analyst · Manager" color="border-emerald/50" />
                    <StatCard value="100%" label="No API Key Needed" sub="Local expert analysis engine" color="border-cyan-500/50" />
                </motion.div>

                {/* ── Features grid ──────────────────────────────────────────── */}
                <section id="features" className="w-full max-w-6xl mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Built for Real Security Operations
                        </h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
                            Every component is designed around the actual workflow of a SOC team — from raw log ingestion to executive reporting.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FEATURES.map((f) => (
                            <FeatureCard key={f.title} {...f} />
                        ))}
                    </div>
                </section>

                {/* ── Threat coverage ────────────────────────────────────────── */}
                <section id="threats" className="w-full max-w-6xl mb-32">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Comprehensive Detection Coverage
                        </h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
                            The rule engine fires on known attack signatures. The ML model catches everything else.
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 p-10 rounded-3xl glass-panel">
                        {THREATS.map((t) => <ThreatChip key={t.label} {...t} />)}
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-xs font-semibold text-primary">
                            <Cpu className="w-3.5 h-3.5" /> + ML Anomaly Detection
                        </span>
                    </div>
                </section>

                {/* ── Role workflow ──────────────────────────────────────────── */}
                <section id="workflow" className="w-full max-w-6xl mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Every Role Has a Purpose
                        </h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
                            Three distinct interfaces designed for the actual responsibilities of each security team member.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        <div className="hidden md:block absolute top-20 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                        {ROLES.map((r) => <RoleCard key={r.role} {...r} />)}
                    </div>
                </section>

                {/* ── Final CTA ──────────────────────────────────────────────── */}
                <section className="w-full max-w-4xl mb-32">
                    <div className="glass-panel-deep rounded-[2rem] p-16 text-center border-t border-primary/30 relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                        <FileSearch className="w-16 h-16 text-primary mx-auto mb-6" />
                        <h2 className="text-4xl font-bold text-white mb-6">Ready to Analyse Your Logs?</h2>
                        <p className="text-slate-400 text-lg mb-10 max-w-lg mx-auto font-light">
                            Upload any Apache or Nginx access log and receive a full expert security briefing in seconds.
                        </p>
                        <Link
                            to="/login"
                            className="btn-premium px-10 py-4 text-lg inline-flex items-center gap-3"
                        >
                            Get Started Free <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </section>
            </main>

            {/* ── Footer ── */}
            <footer className="relative z-10 border-t border-white/10 py-8 px-12 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 bg-black/20 backdrop-blur-lg">
                <div className="flex items-center gap-3 mb-4 sm:mb-0 font-medium">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    WebGuard AI · Enterprise Security Platform
                </div>
                <div className="flex items-center gap-6 font-light">
                    <span>Isolation Forest + SOC Workflow</span>
                </div>
            </footer>
        </div>
    );
}
