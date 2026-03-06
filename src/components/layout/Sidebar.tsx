import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UploadCloud, BrainCircuit, ShieldAlert, LogOut, Shield } from 'lucide-react';
import { useAuth, type UserRole } from '../../context/AuthContext';

const NAV_ITEMS: Record<UserRole, { path: string; icon: React.ElementType; label: string }[]> = {
    contributor: [
        { path: '/console/ingest',   icon: UploadCloud,  label: 'Ingest' },
    ],
    analyst: [
        { path: '/console/analyze',  icon: BrainCircuit, label: 'Analysis' },
    ],
    manager: [
        { path: '/console/analyze',  icon: BrainCircuit, label: 'Analysis' },
        { path: '/console/command',  icon: ShieldAlert,  label: 'Command' },
    ],
};

export function Sidebar() {
    const { pathname } = useLocation();
    const { user, logout } = useAuth();

    if (!user) return null;

    const items = NAV_ITEMS[user.role] ?? [];

    return (
        <div className="h-full w-16 flex flex-col items-center bg-obsidian border-r border-white/6 py-6 z-30">
            {/* Logo mark */}
            <div className="mb-8">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-lavender to-purple-500 flex items-center justify-center shadow-md shadow-lavender/20">
                    <Shield className="w-4 h-4 text-slate-900" />
                </div>
            </div>

            {/* Nav items */}
            <nav className="flex-1 flex flex-col gap-2 w-full px-2">
                {items.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            title={item.label}
                            className="relative flex items-center justify-center p-2.5 rounded-xl transition-colors duration-200 group"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeNav"
                                    className="absolute inset-0 bg-lavender/10 rounded-xl border border-lavender/20 shadow-[0_0_15px_rgba(189,178,255,0.08)]"
                                    transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                                />
                            )}
                            <item.icon
                                className={`w-5 h-5 z-10 transition-colors ${
                                    isActive ? 'text-lavender' : 'text-slate-600 group-hover:text-slate-300'
                                }`}
                            />
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="w-full px-2">
                <button
                    onClick={logout}
                    title="Sign out"
                    className="flex items-center justify-center p-2.5 w-full rounded-xl text-slate-600 hover:text-crimson hover:bg-crimson/10 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
