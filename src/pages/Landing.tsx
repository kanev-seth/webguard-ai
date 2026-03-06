import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Activity } from 'lucide-react';

const FEATURES = [
    { icon: ShieldCheck, label: 'Isolation Forest Detection', desc: 'ML-powered anomaly engine' },
    { icon: Zap,         label: 'Real-Time Processing',       desc: 'Sub-second log analysis' },
    { icon: Activity,    label: 'Role-Based Console',          desc: 'Analyst & Manager workflows' },
];

export default function Landing() {
    return (
        <div className="relative min-h-screen w-full overflow-hidden mesh-bg flex flex-col">

            {/* ── Ambient orbs ── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full bg-lavender/6 blur-[120px] animate-slow-spin" />
                <div className="absolute bottom-[-20%] right-[-15%] w-[600px] h-[600px] rounded-full bg-emerald/4 blur-[100px] animate-float" />
                <div className="absolute top-[30%] right-[5%] w-[400px] h-[400px] rounded-full bg-crimson/3 blur-[90px]" />
            </div>

            {/* ── Grid texture overlay ── */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.025]"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                }}
            />

            {/* ── Nav ── */}
            <nav className="relative z-10 flex items-center justify-between px-10 py-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-lavender to-purple-500 flex items-center justify-center shadow-lg shadow-lavender/30">
                        <ShieldCheck className="w-4.5 h-4.5 text-slate-900 w-4 h-4" />
                    </div>
                    <span className="font-bold text-white text-base tracking-tight">WebGuard AI</span>
                </div>
                <Link
                    to="/login"
                    className="text-sm text-slate-400 hover:text-white transition-colors font-medium"
                >
                    Sign In →
                </Link>
            </nav>

            {/* ── Hero ── */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald/30 bg-emerald/8 mb-8"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
                    <span className="text-xs text-emerald font-semibold tracking-wider uppercase">AI-Powered Security Platform</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
                    className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.08] tracking-tight max-w-4xl mb-6"
                >
                    Intelligent Log Analysis.{' '}
                    <span className="bg-gradient-to-r from-lavender via-purple-400 to-lavender bg-clip-text text-transparent text-glow-primary">
                        Zero Compromise.
                    </span>
                </motion.h1>

                {/* Sub-copy */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                    className="text-lg text-slate-400 max-w-xl leading-relaxed mb-12"
                >
                    WebGuard AI fuses Isolation Forest anomaly detection with an enterprise-grade analyst workflow — from log ingestion to threat remediation.
                </motion.p>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
                    className="flex flex-col sm:flex-row items-center gap-4 mb-20"
                >
                    <Link
                        to="/login"
                        className="group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-lavender to-purple-500 text-slate-900 font-bold text-base btn-glow-lavender hover:shadow-lavender/40 hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5"
                    >
                        Access Console
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <span className="text-slate-600 text-sm">No credit card required</span>
                </motion.div>

                {/* Feature pills */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.45, ease: 'easeOut' }}
                    className="flex flex-wrap justify-center gap-4"
                >
                    {FEATURES.map((f, i) => (
                        <motion.div
                            key={f.label}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className="flex items-center gap-3 px-5 py-3 rounded-xl glass-panel neon-border-primary"
                        >
                            <f.icon className="w-4 h-4 text-lavender shrink-0" />
                            <div className="text-left">
                                <div className="text-xs font-semibold text-white">{f.label}</div>
                                <div className="text-[11px] text-slate-500">{f.desc}</div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </main>

            {/* ── Footer ── */}
            <footer className="relative z-10 text-center py-6 text-xs text-slate-600">
                WebGuard AI · Enterprise Security Platform · BTech Project
            </footer>
        </div>
    );
}
