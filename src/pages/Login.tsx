import { motion, AnimatePresence } from 'framer-motion';
import { type UserRole, useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Upload, FileText, Lock, Info, X } from 'lucide-react';
import { useState } from 'react';
import { getRoleHome } from '../components/layout/ProtectedRoute';

const personas = [
    {
        role: 'contributor' as UserRole,
        title: 'Log Contributor',
        desc: 'Ingest raw data logs securely.',
        icon: Upload,
        color: 'from-blue-500 to-cyan-500 text-blue-400',
        borderColor: 'group-hover:border-cyan-500/50',
    },
    {
        role: 'analyst' as UserRole,
        title: 'Security Analyst',
        desc: 'Analyze threats and report anomalies.',
        icon: FileText,
        color: 'from-violet-500 to-purple-500 text-purple-400',
        borderColor: 'group-hover:border-purple-500/50',
    },
    {
        role: 'manager' as UserRole,
        title: 'Security Manager',
        desc: 'Executive review and remediation.',
        icon: Shield,
        color: 'from-orange-500 to-red-500 text-red-400',
        borderColor: 'group-hover:border-red-500/50',
    },
];

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [showInfo, setShowInfo] = useState(false);

    // Form State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI State
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role);
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setError('');
        setSuccessMsg('');
    };

    const handleBack = () => {
        setSelectedRole(null);
        setError('');
        setSuccessMsg('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (!selectedRole || !username || !password) {
            setError('All fields are required.');
            return;
        }

        if (mode === 'signup') {
            if (password !== confirmPassword) {
                setError('Passwords do not match.');
                return;
            }
        }

        setIsAuthenticating(true);

        try {
            if (mode === 'signup') {
                const res = await fetch('http://localhost:5000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: username,
                        password,
                        role: selectedRole === 'analyst' ? 'Security Analyst' : selectedRole === 'manager' ? 'Security Manager' : 'Log Contributor'
                    })
                });

                const data = await res.json();

                if (res.ok) {
                    setSuccessMsg('Registration successful! Please login.');
                    setTimeout(() => {
                        setMode('login');
                        setSuccessMsg('');
                        setPassword('');
                        setConfirmPassword('');
                        setIsAuthenticating(false);
                    }, 1500);
                    return;
                } else {
                    setError(data.message || 'Registration failed');
                }
            } else {
                await login(selectedRole, username, password);
                navigate(getRoleHome(selectedRole));
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Authentication failed');
        } finally {
            if (mode === 'login') setIsAuthenticating(false);
            if (mode === 'signup' && error) setIsAuthenticating(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden mesh-bg">
            {/* Info Button */}
            <button
                onClick={() => setShowInfo(true)}
                className="absolute top-8 left-8 z-20 flex items-center gap-3 text-slate-400 hover:text-white transition-colors glass-panel px-5 py-2.5 rounded-full group hover:border-primary/40"
            >
                <div className="bg-primary/10 p-1.5 rounded-full group-hover:bg-primary/20 transition-colors">
                    <Info className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-semibold tracking-widest uppercase">Mission Briefing</span>
            </button>

            {/* Project Info Modal */}
            <AnimatePresence>
                {showInfo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
                        onClick={() => setShowInfo(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="glass-panel-deep border border-primary/20 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                                <h2 className="text-xl font-bold text-white flex items-center gap-3 font-outfit">
                                    <Shield className="w-5 h-5 text-primary" />
                                    WebGuard AI Overview
                                </h2>
                                <button onClick={() => setShowInfo(false)} className="text-slate-400 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-8 space-y-8 text-slate-300 font-light">
                                <section>
                                    <h3 className="text-primary font-semibold mb-3 text-sm tracking-wide uppercase">What is WebGuard AI?</h3>
                                    <p className="text-sm leading-relaxed text-slate-400">
                                        An advanced cybersecurity platform for detecting anomalies in server logs using AI.
                                        It features a secure hierarchical workflow for log ingestion, automated analysis, and executive reporting.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-primary font-semibold mb-4 text-sm tracking-wide uppercase">User Hierarchy & Workflow</h3>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="glass-panel p-5 rounded-2xl">
                                            <div className="flex items-center gap-2 mb-3 text-blue-400 font-bold text-sm">
                                                <Upload className="w-4 h-4" /> Contributor
                                            </div>
                                            <p className="text-xs text-slate-400 leading-relaxed">Uploads encrypted log files (.log, .txt) for analysis.</p>
                                        </div>
                                        <div className="glass-panel p-5 rounded-2xl">
                                            <div className="flex items-center gap-2 mb-3 text-purple-400 font-bold text-sm">
                                                <FileText className="w-4 h-4" /> Analyst
                                            </div>
                                            <p className="text-xs text-slate-400 leading-relaxed">Reviews AI findings, adds context, and submits to management.</p>
                                        </div>
                                        <div className="glass-panel p-5 rounded-2xl">
                                            <div className="flex items-center gap-2 mb-3 text-red-400 font-bold text-sm">
                                                <Shield className="w-4 h-4" /> Manager
                                            </div>
                                            <p className="text-xs text-slate-400 leading-relaxed">Approves final reports and executes remediation actions.</p>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="relative z-10 w-full max-w-5xl px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center justify-center p-4 mb-6 rounded-3xl glass-panel border border-primary/20 shadow-xl">
                        <Shield className="w-8 h-8 text-primary mr-3" />
                        <h1 className="text-3xl font-bold tracking-tight text-white font-outfit">WebGuard AI</h1>
                    </div>
                    {!selectedRole && (
                        <h2 className="text-lg text-slate-400 font-light tracking-wide uppercase">Select Security Clearance Level</h2>
                    )}
                </motion.div>

                {/* STEP 1: ROLE SELECTION */}
                {!selectedRole && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {personas.map((persona, index) => (
                            <motion.button
                                key={persona.role}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                                onClick={() => handleRoleSelect(persona.role)}
                                className={`group relative h-[320px] rounded-[2rem] p-8 text-left transition-all duration-300 glass-card hover:border-primary/40 overflow-hidden flex flex-col justify-between cursor-pointer`}
                            >
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${persona.color.split(' ')[0]} ${persona.color.split(' ')[1]}`} />

                                <div className="relative z-10">
                                    <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                        <persona.icon className={`w-7 h-7 ${persona.color.split(' ')[2]}`} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3 font-outfit tracking-tight">{persona.title}</h3>
                                    <p className="text-sm text-slate-400 font-light leading-relaxed">{persona.desc}</p>
                                </div>

                                <div className="relative z-10 flex items-center text-xs font-semibold tracking-widest text-slate-500 group-hover:text-white transition-colors uppercase mt-4">
                                    Initiate Login <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                )}

                {/* STEP 2: LOGIN/SIGNUP FORM */}
                {selectedRole && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-[420px] mx-auto"
                    >
                        <div className="glass-panel-deep rounded-[2rem] p-10 relative overflow-hidden">
                            {/* Role Indicator Banner */}
                            <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${personas.find(p => p.role === selectedRole)?.color.split(' ').slice(0, 2).join(' ')}`} />

                            <button
                                onClick={handleBack}
                                className="mb-8 text-slate-400 hover:text-white transition-colors text-xs font-semibold tracking-wider uppercase flex items-center group"
                            >
                                <span className="group-hover:-translate-x-1 transition-transform mr-2">←</span> Back
                            </button>

                            <div className="flex flex-col items-center mb-8 text-center">
                                <div className={`w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 shadow-lg`}>
                                    <Lock className={`w-7 h-7 ${personas.find(p => p.role === selectedRole)?.color.split(' ')[2]}`} />
                                </div>
                                <h3 className="text-3xl font-bold text-white font-outfit tracking-tight mb-2">Gatekeeper</h3>
                                <p className="text-slate-400 text-sm font-light">
                                    Authenticate as <span className="text-white font-medium capitalize">{selectedRole}</span>
                                </p>
                            </div>

                            {/* Mode Toggle */}
                            <div className="flex bg-black/40 p-1.5 rounded-xl mb-8 border border-white/5">
                                <button
                                    onClick={() => setMode('login')}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'login' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={() => setMode('signup')}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'signup' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Sign Up
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Username / Email</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary/50 focus:bg-white/5 transition-all font-mono text-sm placeholder:text-slate-600 shadow-inner"
                                        placeholder="Enter ID"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary/50 focus:bg-white/5 transition-all font-mono text-sm placeholder:text-slate-600 shadow-inner"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <AnimatePresence>
                                    {mode === 'signup' && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="space-y-2 overflow-hidden pt-1"
                                        >
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm Password</label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary/50 focus:bg-white/5 transition-all font-mono text-sm placeholder:text-slate-600 shadow-inner"
                                                placeholder="••••••••"
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Submit Button */}
                                <motion.button
                                    whileHover={!isAuthenticating ? { scale: 1.02 } : {}}
                                    whileTap={!isAuthenticating ? { scale: 0.98 } : {}}
                                    disabled={isAuthenticating}
                                    className={`w-full py-4 mt-8 btn-premium flex items-center justify-center text-sm tracking-wide ${isAuthenticating ? '!bg-emerald/80 !shadow-emerald/40' : ''}`}
                                    animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                >
                                    {isAuthenticating ? (
                                        <>
                                            <Lock className="w-4 h-4 mr-2 animate-pulse text-white" />
                                            <span className="text-white font-bold">{mode === 'login' ? 'AUTHENTICATING...' : 'REGISTERING...'}</span>
                                        </>
                                    ) : (
                                        mode === 'login' ? 'Authenticate' : 'Create Access ID'
                                    )}
                                </motion.button>

                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-crimson text-xs text-center font-mono mt-4 p-2 bg-crimson/10 rounded-lg border border-crimson/20"
                                    >
                                        {error}
                                    </motion.p>
                                )}

                                {successMsg && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-emerald text-xs text-center font-mono mt-4 p-2 bg-emerald/10 rounded-lg border border-emerald/20"
                                    >
                                        {successMsg}
                                    </motion.p>
                                )}
                            </form>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
