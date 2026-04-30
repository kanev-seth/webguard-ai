import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ArrowRight, ShieldCheck, Zap, Activity, BrainCircuit,
    ShieldAlert, Lock, Eye, Users, BarChart3, FileSearch,
    CheckCircle2, AlertTriangle, Database, Cpu,
} from 'lucide-react';

// ── Animated counter ──────────────────────────────────────────────────────────
function StatCard({ value, label, sub, color }: { value: string; label: string; sub: string; color: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col items-center px-8 py-5 rounded-2xl border ${color} backdrop-blur-sm`}
        >
            <span className="text-3xl font-black text-white tracking-tight">{value}</span>
            <span className="text-xs font-bold text-slate-300 mt-1">{label}</span>
            <span className="text-[10px] text-slate-600 mt-0.5">{sub}</span>
        </motion.div>
    );
}

// ── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, accent, delay }: {
    icon: typeof ShieldCheck; title: string; desc: string; accent: string; delay: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5, ease: 'easeOut' }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="flex flex-col gap-3 p-5 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-white/16 hover:bg-white/[0.05] transition-all group cursor-default"
        >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
                <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">{title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
        </motion.div>
    );
}

// ── Role card ────────────────────────────────────────────────────────────────
function RoleCard({ icon: Icon, role, tasks, color, delay }: {
    icon: typeof ShieldCheck; role: string; tasks: string[]; color: string; delay: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.5 }}
            className="flex flex-col gap-4 p-6 rounded-2xl bg-white/[0.025] border border-white/10 hover:border-white/20 transition-all"
        >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5.5 h-5.5 w-5 h-5" />
            </div>
            <div>
                <h3 className="text-base font-bold text-white mb-3">{role}</h3>
                <ul className="space-y-2">
                    {tasks.map((t) => (
                        <li key={t} className="flex items-center gap-2 text-xs text-slate-400">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald shrink-0" />
                            {t}
                        </li>
                    ))}
                </ul>
            </div>
        </motion.div>
    );
}

// ── Threat chip ───────────────────────────────────────────────────────────────
function ThreatChip({ label, severity }: { label: string; severity: 'critical' | 'high' | 'medium' }) {
    const cfg = {
        critical: 'bg-crimson/10 border-crimson/30 text-crimson',
        high:     'bg-terracotta/10 border-terracotta/30 text-terracotta',
        medium:   'bg-amber-500/10 border-amber-400/30 text-amber-400',
    }[severity];
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold ${cfg}`}>
            <AlertTriangle className="w-3 h-3" />
            {label}
        </span>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const FEATURES = [
    { icon: BrainCircuit,  title: 'Isolation Forest ML Engine', desc: 'Unsupervised anomaly detection trained on real access log distributions. Flags statistical outliers with zero labelled training data required.', accent: 'bg-lavender/15 text-lavender', delay: 0.4 },
    { icon: ShieldAlert,   title: 'Deterministic Rule Engine',  desc: 'Hard-coded signatures for SQLi, XSS, path traversal, command injection, and 20+ scanner fingerprints — fires before the ML model.', accent: 'bg-crimson/15 text-crimson', delay: 0.5 },
    { icon: Zap,           title: 'Real-Time Expert Briefings', desc: 'AI-generated executive summaries with risk level, threat actor profiling, and category-specific remediation playbooks — no API key needed.', accent: 'bg-emerald/15 text-emerald', delay: 0.6 },
    { icon: Users,         title: 'Role-Based SOC Workflow',    desc: 'Contributor → Analyst → Manager escalation chain with full audit trail, analyst notes, and one-click remediation actions.', accent: 'bg-blue-500/15 text-blue-400', delay: 0.7 },
    { icon: BarChart3,     title: 'Attack Vector Radar',        desc: 'Six-axis threat visualisation across Injection, Exfil, Brute-Force, Traversal, Recon, and DDoS categories in the Manager command centre.', accent: 'bg-terracotta/15 text-terracotta', delay: 0.8 },
    { icon: Database,      title: 'MongoDB Persistence',        desc: 'All AI reports, escalations, analyst notes, and audit trail entries persisted to MongoDB with structured schemas and TTL controls.', accent: 'bg-purple-500/15 text-purple-400', delay: 0.9 },
];

const ROLES = [
    {
        icon: Lock, role: 'Log Contributor', color: 'bg-slate-700/60 text-slate-300',
        tasks: ['Upload Apache / Nginx access logs', 'Track upload history and queue status', 'Receive confirmation on log processing'],
        delay: 0.3,
    },
    {
        icon: Eye, role: 'Security Analyst', color: 'bg-lavender/15 text-lavender',
        tasks: ['Run ML + rule-based anomaly detection', 'Inspect flagged requests with full reasons', 'Escalate confirmed threats with analyst notes', 'Generate AI-augmented expert reports'],
        delay: 0.4,
    },
    {
        icon: ShieldCheck, role: 'Security Manager', color: 'bg-emerald/15 text-emerald',
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

            {/* ── Ambient background orbs ── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full bg-lavender/6 blur-[120px] animate-slow-spin" />
                <div className="absolute bottom-[-20%] right-[-15%] w-[600px] h-[600px] rounded-full bg-emerald/4 blur-[100px] animate-float" />
                <div className="absolute top-[30%] right-[5%] w-[400px] h-[400px] rounded-full bg-crimson/3 blur-[90px]" />
                <div className="absolute top-[60%] left-[20%] w-[300px] h-[300px] rounded-full bg-blue-500/3 blur-[80px]" />
            </div>

            {/* ── Grid texture ── */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.025]"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                }}
            />

            {/* ── Nav ── */}
            <nav className="relative z-10 flex items-center justify-between px-10 py-6">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-lavender to-purple-500 flex items-center justify-center shadow-lg shadow-lavender/30">
                        <ShieldCheck className="w-5 h-5 text-slate-900" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-white text-sm tracking-tight leading-tight">WebGuard AI</span>
                        <span className="text-[9px] text-slate-600 tracking-widest uppercase">Threat Intelligence</span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <a href="#features" className="text-sm text-slate-500 hover:text-white transition-colors">Features</a>
                    <a href="#workflow" className="text-sm text-slate-500 hover:text-white transition-colors">Workflow</a>
                    <a href="#threats" className="text-sm text-slate-500 hover:text-white transition-colors">Coverage</a>
                    <Link
                        to="/login"
                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-lavender/10 border border-lavender/30 text-lavender text-sm font-semibold hover:bg-lavender hover:text-slate-900 transition-all"
                    >
                        Sign In <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </nav>

            {/* ── Hero ── */}
            <main className="relative z-10 flex-1 flex flex-col items-center px-6 pt-16 pb-0">

                {/* Status badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald/30 bg-emerald/8 mb-8"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
                    <span className="text-xs text-emerald font-semibold tracking-wider uppercase">AI-Powered SOC Platform · Production Ready</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.08] tracking-tight max-w-4xl mb-6 text-center"
                >
                    Intelligent Threat Detection.{' '}
                    <span className="bg-gradient-to-r from-lavender via-purple-400 to-lavender bg-clip-text text-transparent text-glow-primary">
                        Zero Compromise.
                    </span>
                </motion.h1>

                {/* Sub-copy */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg text-slate-400 max-w-2xl leading-relaxed mb-10 text-center"
                >
                    WebGuard AI fuses Isolation Forest anomaly detection with a deterministic rule engine, delivering expert-grade security briefings and a full analyst-to-manager escalation workflow — no external AI key required.
                </motion.p>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex items-center gap-4 mb-16"
                >
                    <Link
                        to="/login"
                        className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-lavender to-purple-500 text-slate-900 font-bold text-base btn-glow-lavender hover:shadow-lavender/40 hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5"
                    >
                        Access Console
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <a
                        href="#features"
                        className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl border border-white/12 text-slate-300 hover:text-white hover:border-white/25 hover:bg-white/5 transition-all text-sm font-medium"
                    >
                        <Activity className="w-4 h-4" />
                        See How It Works
                    </a>
                </motion.div>

                {/* Live stats row */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.35 }}
                    className="flex flex-wrap justify-center gap-4 mb-20"
                >
                    <StatCard value="10+" label="Threat Categories" sub="SQL, XSS, LFI, RCE &amp; more" color="border-lavender/20 bg-lavender/5" />
                    <StatCard value="52+"  label="Detection Patterns" sub="Deterministic rule engine" color="border-crimson/20 bg-crimson/5" />
                    <StatCard value="3"    label="User Roles" sub="Contributor · Analyst · Manager" color="border-emerald/20 bg-emerald/5" />
                    <StatCard value="100%" label="No API Key Needed" sub="Local expert analysis engine" color="border-blue-500/20 bg-blue-500/5" />
                </motion.div>

                {/* ── Features grid ──────────────────────────────────────────── */}
                <section id="features" className="w-full max-w-6xl mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.5 }}
                        className="text-center mb-10"
                    >
                        <span className="text-[10px] text-lavender font-bold tracking-[0.2em] uppercase">Platform Capabilities</span>
                        <h2 className="text-2xl font-bold text-white mt-2">
                            Built for Real Security Operations
                        </h2>
                        <p className="text-slate-500 text-sm mt-2 max-w-lg mx-auto">
                            Every component is designed around the actual workflow of a SOC team — from raw log ingestion to executive reporting.
                        </p>
                    </motion.div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {FEATURES.map((f) => (
                            <FeatureCard key={f.title} {...f} />
                        ))}
                    </div>
                </section>

                {/* ── Threat coverage ────────────────────────────────────────── */}
                <section id="threats" className="w-full max-w-6xl mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.5 }}
                        className="text-center mb-8"
                    >
                        <span className="text-[10px] text-crimson font-bold tracking-[0.2em] uppercase">Detection Coverage</span>
                        <h2 className="text-2xl font-bold text-white mt-2">
                            What We Detect
                        </h2>
                        <p className="text-slate-500 text-sm mt-2 max-w-lg mx-auto">
                            The rule engine fires on known attack signatures. The ML model catches everything else.
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
                        className="flex flex-wrap justify-center gap-2.5 p-8 rounded-2xl bg-white/[0.02] border border-white/8"
                    >
                        {THREATS.map((t) => <ThreatChip key={t.label} {...t} />)}
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 text-[11px] font-bold text-slate-500">
                            <Cpu className="w-3 h-3" /> + ML Anomaly Detection
                        </span>
                    </motion.div>
                </section>

                {/* ── Role workflow ──────────────────────────────────────────── */}
                <section id="workflow" className="w-full max-w-6xl mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.5 }}
                        className="text-center mb-10"
                    >
                        <span className="text-[10px] text-emerald font-bold tracking-[0.2em] uppercase">Role-Based Workflow</span>
                        <h2 className="text-2xl font-bold text-white mt-2">
                            Every Role Has a Purpose
                        </h2>
                        <p className="text-slate-500 text-sm mt-2 max-w-lg mx-auto">
                            Three distinct interfaces designed for the actual responsibilities of each security team member.
                        </p>
                    </motion.div>

                    {/* Workflow connector */}
                    <div className="relative grid grid-cols-3 gap-6">
                        <div className="absolute top-14 left-[33%] right-[33%] h-px bg-gradient-to-r from-slate-700 via-lavender/40 to-slate-700 pointer-events-none" />
                        {ROLES.map((r) => <RoleCard key={r.role} {...r} />)}
                    </div>
                </section>

                {/* ── Final CTA ──────────────────────────────────────────────── */}
                <section className="w-full max-w-3xl mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.6 }}
                        className="relative rounded-3xl p-12 text-center overflow-hidden border border-lavender/20"
                        style={{ background: 'linear-gradient(135deg, rgba(189,178,255,0.06) 0%, rgba(2,6,23,0.9) 60%)' }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-lavender/5 to-transparent pointer-events-none rounded-3xl" />
                        <FileSearch className="w-10 h-10 text-lavender mx-auto mb-4 opacity-80" />
                        <h2 className="text-2xl font-bold text-white mb-3">Ready to Analyse Your Logs?</h2>
                        <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto">
                            Upload any Apache or Nginx access log and receive a full expert security briefing in seconds.
                        </p>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-lavender to-purple-500 text-slate-900 font-bold hover:shadow-lavender/30 hover:shadow-xl transition-all btn-glow-lavender"
                        >
                            Get Started Free <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                </section>
            </main>

            {/* ── Footer ── */}
            <footer className="relative z-10 border-t border-white/[0.06] py-6 px-10 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-lavender/50" />
                    WebGuard AI · Enterprise Security Platform
                </div>
                <div className="flex items-center gap-4">
                    <span>BTech Final Year Project</span>
                    <span>·</span>
                    <span>Isolation Forest + SOC Workflow</span>
                </div>
            </footer>
        </div>
    );
}
