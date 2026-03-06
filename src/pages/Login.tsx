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
        color: 'from-blue-500 to-cyan-500',
        borderColor: 'group-hover:border-cyan-500/50',
    },
    {
        role: 'analyst' as UserRole,
        title: 'Security Analyst',
        desc: 'Analyze threats and report anomalies.',
        icon: FileText,
        color: 'from-violet-500 to-purple-500',
        borderColor: 'group-hover:border-purple-500/50',
    },
    {
        role: 'manager' as UserRole,
        title: 'Security Manager',
        desc: 'Executive review and remediation.',
        icon: Shield,
        color: 'from-orange-500 to-red-500',
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
                // Register Flow
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
                    return; // Stop here, don't login automatically yet
                } else {
                    setError(data.message || 'Registration failed');
                }

            } else {
                // Login Flow
                await login(selectedRole, username, password);
                navigate(getRoleHome(selectedRole));
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Authentication failed');
        } finally {
            if (mode === 'login') setIsAuthenticating(false);
            if (mode === 'signup' && error) setIsAuthenticating(false); // Only stop loading on error for signup, success handles it
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-obsidian relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-lavender/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-terracotta/10 rounded-full blur-[120px]" />
            </div>

            {/* Info Button */}
            <button
                onClick={() => setShowInfo(true)}
                className="absolute top-6 left-6 z-20 flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 group"
            >
                <div className="bg-lavender/10 p-1 rounded-full group-hover:bg-lavender/20 transition-colors">
                    <Info className="w-4 h-4 text-lavender" />
                </div>
                <span className="text-sm font-bold tracking-wide">MISSION BRIEFING</span>
            </button>

            {/* Project Info Modal */}
            <AnimatePresence>
                {showInfo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setShowInfo(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-slate-900 border border-white/10 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-lavender" />
                                    WebGuard AI Overview
                                </h2>
                                <button onClick={() => setShowInfo(false)} className="text-slate-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-8 space-y-6 text-slate-300">
                                <section>
                                    <h3 className="text-lavender font-bold mb-2">What is WebGuard AI?</h3>
                                    <p className="text-sm leading-relaxed">
                                        An advanced cybersecurity platform for detecting anomalies in server logs using AI.
                                        It features a secure hierarchical workflow for log ingestion, automated analysis, and executive reporting.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-lavender font-bold mb-2">User Hierarchy & Workflow</h3>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-2 mb-2 text-cyan-400 font-bold text-sm">
                                                <Upload className="w-4 h-4" /> Log Contributor
                                            </div>
                                            <p className="text-xs text-slate-400">Uploads encrypted log files (.log, .txt) for analysis.</p>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-2 mb-2 text-purple-400 font-bold text-sm">
                                                <FileText className="w-4 h-4" /> Security Analyst
                                            </div>
                                            <p className="text-xs text-slate-400">Reviews AI findings, adds context, and submits to management.</p>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-2 mb-2 text-red-400 font-bold text-sm">
                                                <Shield className="w-4 h-4" /> Security Manager
                                            </div>
                                            <p className="text-xs text-slate-400">Approves final reports and executes remediation actions.</p>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-lavender font-bold mb-2">How to Login</h3>
                                    <ul className="list-disc list-inside text-sm space-y-1 text-slate-400">
                                        <li>Select your role from the main screen.</li>
                                        <li>If you are new, switch to "Sign Up" to create an account.</li>
                                        <li>Existing users can log in with their credentials.</li>
                                    </ul>
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
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl shadow-black/20">
                        <Shield className="w-8 h-8 text-lavender mr-3" />
                        <h1 className="text-3xl font-bold tracking-tight text-white">WebGuard AI</h1>
                    </div>
                    {/* Only show this subtitle if selecting role */}
                    {!selectedRole && (
                        <h2 className="text-xl text-muted-foreground font-mono">Select Security Clearance Level</h2>
                    )}
                </motion.div>

                {/* STEP 1: ROLE SELECTION */}
                {!selectedRole && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {personas.map((persona, index) => (
                            <motion.button
                                key={persona.role}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                                whileHover={{ y: -5, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleRoleSelect(persona.role)}
                                className={`group relative h-72 rounded-3xl p-6 text-left transition-all duration-300 bg-black/40 backdrop-blur-xl border border-white/10 ${persona.borderColor} hover:shadow-2xl hover:shadow-black/50 overflow-hidden flex flex-col justify-between`}
                            >
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${persona.color}`} />

                                <div>
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${persona.color} flex items-center justify-center mb-6 shadow-lg`}>
                                        <persona.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">{persona.title}</h3>
                                    <p className="text-sm text-slate-400 font-medium leading-relaxed">{persona.desc}</p>
                                </div>

                                <div className="flex items-center text-sm font-mono text-slate-500 group-hover:text-white transition-colors">
                                    <span className="flex items-center">
                                        INITIATE LOGIN <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                                    </span>
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
                        className="max-w-md mx-auto"
                    >
                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                            {/* Role Indicator Banner */}
                            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${personas.find(p => p.role === selectedRole)?.color}`} />

                            <button
                                onClick={handleBack}
                                className="mb-6 text-slate-500 hover:text-white transition-colors text-sm flex items-center"
                            >
                                ← Back to Role Selection
                            </button>

                            <div className="flex flex-col items-center mb-6">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${personas.find(p => p.role === selectedRole)?.color} flex items-center justify-center mb-4 shadow-lg`}>
                                    <Lock className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">Gatekeeper Access</h3>
                                <p className="text-slate-400 text-sm mt-1">
                                    Authenticate as <span className="text-white font-semibold capitalize">{selectedRole}</span>
                                </p>
                            </div>

                            {/* Mode Toggle */}
                            <div className="flex bg-white/5 p-1 rounded-xl mb-6">
                                <button
                                    onClick={() => setMode('login')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'login' ? 'bg-white/10 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={() => setMode('signup')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'signup' ? 'bg-white/10 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Sign Up
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Username / Email</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lavender/50 focus:bg-white/10 transition-all font-mono placeholder:text-slate-600"
                                        placeholder="Enter ID"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lavender/50 focus:bg-white/10 transition-all font-mono placeholder:text-slate-600"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <AnimatePresence>
                                    {mode === 'signup' && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="space-y-1 overflow-hidden"
                                        >
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Confirm Password</label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lavender/50 focus:bg-white/10 transition-all font-mono placeholder:text-slate-600"
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
                                    className={`w-full py-4 rounded-xl font-bold text-slate-900 mt-4 transition-all flex items-center justify-center
                                        ${isAuthenticating
                                            ? 'bg-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)] text-white'
                                            : `bg-gradient-to-r ${personas.find(p => p.role === selectedRole)?.color} text-white shadow-lg`
                                        }
                                    `}
                                    animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                >
                                    {isAuthenticating ? (
                                        <>
                                            <Lock className="w-5 h-5 mr-2 animate-pulse" />
                                            {mode === 'login' ? 'AUTHENTICATING...' : 'REGISTERING...'}
                                        </>
                                    ) : (
                                        mode === 'login' ? 'Authenticate' : 'Create Access ID'
                                    )}
                                </motion.button>

                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-red-400 text-xs text-center font-mono mt-2"
                                    >
                                        [ERROR] {error}
                                    </motion.p>
                                )}

                                {successMsg && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-green-400 text-xs text-center font-mono mt-2"
                                    >
                                        [SUCCESS] {successMsg}
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
