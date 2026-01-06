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
    const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);

    const handleLogin = async (role: UserRole) => {
        setLoadingRole(role);
        await login(role);
        navigate('/dashboard');
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
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl shadow-black/20">
                        <Shield className="w-8 h-8 text-lavender mr-3" />
                        <h1 className="text-3xl font-bold tracking-tight text-white">WebGuard AI</h1>
                    </div>
                    <h2 className="text-xl text-muted-foreground font-mono">Select Security Clearance Level</h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {personas.map((persona, index) => (
                        <motion.button
                            key={persona.role}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleLogin(persona.role)}
                            disabled={!!loadingRole}
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
                                {loadingRole === persona.role ? (
                                    <span className="flex items-center animate-pulse">
                                        <Lock className="w-4 h-4 mr-2 animate-spin" />
                                        AUTHENTICATING...
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        ACCESS PORTAL <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                                    </span>
                                )}
                            </div>
                        </motion.button>
                    ))}
                </div>
            </main>
        </div>
    );
}
