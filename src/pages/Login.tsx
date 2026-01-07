import { motion } from 'framer-motion';
import { type UserRole, useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Upload, FileText, Lock } from 'lucide-react';
import { useState } from 'react';

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
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    // Hardcoded credentials for simulation
    const CREDENTIALS = {
        contributor: { user: 'contributor', pass: 'contributor' },
        analyst: { user: 'analyst', pass: 'analyst' },
        manager: { user: 'manager', pass: 'manager' },
    };

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role);
        setUsername('');
        setPassword('');
        setError(false);
    };

    const handleBack = () => {
        setSelectedRole(null);
        setError(false);
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(false);

        if (!selectedRole) return;

        const correctCreds = CREDENTIALS[selectedRole];

        if (username === correctCreds.user && password === correctCreds.pass) {
            setIsAuthenticating(true);
            // Simulate network delay for effect
            setTimeout(async () => {
                await login(selectedRole);
                navigate('/dashboard');
            }, 800);
        } else {
            setError(true);
            setTimeout(() => setError(false), 500); // Reset shake trigger
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-obsidian relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-lavender/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-terracotta/10 rounded-full blur-[120px]" />
            </div>

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

                {/* STEP 2: LOGIN FORM */}
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

                            <div className="flex flex-col items-center mb-8">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${personas.find(p => p.role === selectedRole)?.color} flex items-center justify-center mb-4 shadow-lg`}>
                                    <Lock className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">Gatekeeper Access</h3>
                                <p className="text-slate-400 text-sm mt-1">
                                    Authenticate as <span className="text-white font-semibold capitalize">{selectedRole}</span>
                                </p>
                            </div>

                            <form onSubmit={handleLoginSubmit} className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Username</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lavender/50 focus:bg-white/10 transition-all font-mono placeholder:text-slate-600"
                                        placeholder="Enter ID"
                                        autoFocus
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

                                {/* Authenticating Overlay or Button */}
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
                                            ACCESS GRANTED
                                        </>
                                    ) : (
                                        "Authenticate"
                                    )}
                                </motion.button>

                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-red-400 text-xs text-center font-mono mt-2"
                                    >
                                        [ERROR] INVALID CREDENTIALS
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
